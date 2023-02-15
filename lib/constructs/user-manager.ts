import * as lambdaPython from '@aws-cdk/aws-lambda-python-alpha';
import { DockerImage, Duration } from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IRole } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Construct } from 'constructs';

export interface UserManagerProps {
    adminGroupRole: IRole;
    userPoolId: string;
    userPoolArn: string;
    restApi: {
        api: apig.RestApi;
        apiAdminResource: apig.Resource;
        bodyValidator: apig.RequestValidator;
    };
    lambdaConfig: {
        runtime: lambda.Runtime;
        architecture: lambda.Architecture;
        bundlingImage: DockerImage;
        layersConfig: {
            powerToolsLogLevel: string;
            helperFunctionsLayer: lambda.ILayerVersion;
            powerToolsLayer: lambda.ILayerVersion;
        };
    };
}

export class UserManager extends Construct {
    // public readonly origin: cloudfront.IOrigin;
    // public readonly sourceBucket: s3.IBucket;

    constructor(scope: Construct, id: string, props: UserManagerProps) {
        super(scope, id);

        // List users Function
        const get_users_function = new lambdaPython.PythonFunction(this, 'get_users_function', {
            entry: 'lib/lambdas/get_users_function/',
            description: 'List the users in cognito',
            index: 'index.py',
            handler: 'lambda_handler',
            timeout: Duration.minutes(1),
            runtime: props.lambdaConfig.runtime,
            tracing: lambda.Tracing.ACTIVE,
            memorySize: 128,
            architecture: props.lambdaConfig.architecture,
            environment: {
                user_pool_id: props.userPoolId,
                POWERTOOLS_SERVICE_NAME: 'get_users',
                LOG_LEVEL: props.lambdaConfig.layersConfig.powerToolsLogLevel,
            },
            bundling: {
                image: props.lambdaConfig.bundlingImage,
            },
            layers: [
                props.lambdaConfig.layersConfig.helperFunctionsLayer,
                props.lambdaConfig.layersConfig.powerToolsLayer,
            ],
        });
        get_users_function.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['cognito-idp:ListUsers'],
                resources: [props.userPoolArn],
            })
        );

        // API RESOURCES
        const api_users = props.restApi.api.root.addResource('users');
        api_users.addMethod('GET', new apig.LambdaIntegration(get_users_function), {
            authorizationType: apig.AuthorizationType.IAM,
        });
    }
}
