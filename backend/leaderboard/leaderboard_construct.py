from aws_cdk import DockerImage, Duration
from aws_cdk import aws_appsync_alpha as appsync
from aws_cdk import aws_cognito as cognito
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_iam as iam
from aws_cdk import aws_lambda as awslambda
from aws_cdk import aws_lambda_python_alpha as lambda_python
from constructs import Construct


class Leaderboard(Construct):
    def __init__(
        self,
        scope: Construct,
        id: str,
        api: appsync.IGraphqlApi,
        # roles_to_grant_invoke_access: list[iam.IRole],
        user_pool: cognito.IUserPool,
        **kwargs,
    ):
        super().__init__(scope, id, **kwargs)

        laps_table = dynamodb.Table(
            self,
            "Table",
            partition_key=dynamodb.Attribute(
                name="pk", type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(name="sk", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption=dynamodb.TableEncryption.AWS_MANAGED,
        )

        lambda_architecture = awslambda.Architecture.ARM_64
        lambda_runtime = awslambda.Runtime.PYTHON_3_9
        lambda_bundling_image = DockerImage.from_registry(
            "public.ecr.aws/sam/build-python3.9:latest-arm64"
        )

        laps_lambda = lambda_python.PythonFunction(
            self,
            "leaderboard_laps_lambda",
            entry="backend/lambdas/leaderboard_laps_lambda/",
            description="Race Laps handler",
            index="index.py",
            handler="lambda_handler",
            timeout=Duration.minutes(1),
            runtime=lambda_runtime,
            tracing=awslambda.Tracing.ACTIVE,
            memory_size=128,
            architecture=lambda_architecture,
            bundling=lambda_python.BundlingOptions(image=lambda_bundling_image),
            # layers=[helper_functions_layer, powertools_layer]
            layers=[
                lambda_python.PythonLayerVersion.from_layer_version_arn(
                    self,
                    "powertools",
                    "arn:aws:lambda:eu-west-1:017000801446:layer:"
                    "AWSLambdaPowertoolsPython:3",
                )
            ],
            environment={
                "DDB_TABLE": laps_table.table_name,
                "APPSYNC_URL": api.graphql_url,
                "user_pool_id": user_pool.user_pool_id,
            },
        )
        laps_table.grant_read_write_data(laps_lambda)
        api.grant_mutation(laps_lambda, "newFastestLapForUser")

        laps_lambda.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "cognito-idp:ListUsers",
                ],
                resources=[user_pool.user_pool_arn],
            )
        )

        laps_data_source = api.add_lambda_data_source("lapsDataSource", laps_lambda)
        none_data_source = api.add_none_data_source("noneLeaderboard")

        # Leader board
        # Define API Schema
        user_object_type = appsync.ObjectType(
            "User",
            definition={
                "username": appsync.GraphqlType.string(),
                "email": appsync.GraphqlType.string(),
            },
        )

        api.add_type(user_object_type)

        lap_object_type = appsync.ObjectType(
            "Lap",
            definition={
                "raceId": appsync.GraphqlType.id(),
                "lapId": appsync.GraphqlType.id(),
                "time": appsync.GraphqlType.float(),
                "resets": appsync.GraphqlType.int(),
                "crashes": appsync.GraphqlType.int(),
                "isValid": appsync.GraphqlType.boolean(),
            },
        )

        lap_input_object_type = appsync.InputType(
            "LapInput",
            definition={
                "raceId": appsync.GraphqlType.id(),
                "lapId": appsync.GraphqlType.id(),
                "time": appsync.GraphqlType.float(),
                "resets": appsync.GraphqlType.int(),
                "crashes": appsync.GraphqlType.int(),
                "isValid": appsync.GraphqlType.boolean(),
            },
        )

        api.add_type(lap_object_type)
        api.add_type(lap_input_object_type)

        race_object_type = appsync.ObjectType(
            "Race",
            definition={
                "id": appsync.GraphqlType.id(),
                "username": appsync.GraphqlType.string(),
                "laps": lap_object_type.attribute(is_list=True),
            },
        )

        api.add_type(race_object_type)

        # TimeKeeper methods
        api.add_query(
            "getAllRacers",
            appsync.ResolvableField(
                return_type=user_object_type.attribute(is_list=True),
                data_source=laps_data_source,
            ),
        )

        api.add_mutation(
            "addRace",
            appsync.ResolvableField(
                args={
                    "eventId": appsync.GraphqlType.id(is_required=True),
                    "username": appsync.GraphqlType.string(is_required=True),
                    "laps": lap_input_object_type.attribute(
                        is_required=True, is_list=True
                    ),
                },
                return_type=race_object_type.attribute(),
                data_source=laps_data_source,
            ),
        )

        # Leaderboard methds
        leaderboardentry_object_type = appsync.ObjectType(
            "LeaderBoardEntry",
            definition={
                "username": appsync.GraphqlType.string(),
                "eventId": appsync.GraphqlType.string(),
                "time": appsync.GraphqlType.float(),
            },
        )

        api.add_type(leaderboardentry_object_type)

        api.add_query(
            "getLeaderBoardEntries",
            appsync.ResolvableField(
                args={
                    "eventId": appsync.GraphqlType.id(is_required=True),
                },
                return_type=leaderboardentry_object_type.attribute(is_list=True),
                data_source=laps_data_source,
            ),
        )

        api.add_mutation(
            "newFastestLapForUser",
            appsync.ResolvableField(
                args={
                    "username": appsync.GraphqlType.string(is_required=True),
                    "time": appsync.GraphqlType.float(is_required=True),
                    "eventId": appsync.GraphqlType.id(is_required=True),
                },
                return_type=leaderboardentry_object_type.attribute(),
                data_source=none_data_source,
                request_mapping_template=appsync.MappingTemplate.from_string(
                    """{
                        "version": "2017-02-28",
                        "payload": $util.toJson($context.arguments)
                    }"""
                ),
                response_mapping_template=appsync.MappingTemplate.from_string(
                    """$util.toJson($context.result)"""
                ),
            ),
        )

        api.add_subscription(
            "onNewFastestLapForUser",
            appsync.ResolvableField(
                args={
                    "eventId": appsync.GraphqlType.id(),
                },
                return_type=leaderboardentry_object_type.attribute(),
                data_source=none_data_source,
                request_mapping_template=appsync.MappingTemplate.from_string(
                    """{
                        "version": "2017-02-28",
                        "payload": $util.toJson($context.arguments.entry)
                    }"""
                ),
                response_mapping_template=appsync.MappingTemplate.from_string(
                    """$util.toJson($context.result)"""
                ),
                directives=[appsync.Directive.subscribe("newFastestLapForUser")],
            ),
        )

        # Event Admin methods
        api.add_query(
            "getRacesForUser",
            appsync.ResolvableField(
                args={
                    "username": appsync.GraphqlType.string(is_required=True),
                    "eventId": appsync.GraphqlType.string(is_required=True),
                },
                return_type=race_object_type.attribute(is_list=True),
                data_source=laps_data_source,
            ),
        )