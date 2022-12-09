#!/usr/bin/python3
# encoding=utf-8
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler import AppSyncResolver
import boto3
from boto3.dynamodb.conditions import Key
import os
import uuid
from datetime import datetime

tracer = Tracer()
logger = Logger()
app = AppSyncResolver()

EVENTS_DDB_TABLE_NAME = os.environ["DDB_TABLE"]
dynamodb = boto3.resource("dynamodb")
ddbTable = dynamodb.Table(EVENTS_DDB_TABLE_NAME)

session = boto3.session.Session()
credentials = session.get_credentials()
region = session.region_name or "eu-west-1"
graphql_endpoint = os.environ.get("APPSYNC_URL", None)


@logger.inject_lambda_context(correlation_id_path=correlation_paths.APPSYNC_RESOLVER)
@tracer.capture_lambda_handler
def lambda_handler(event, context):
    return app.resolve(event, context)


@app.resolver(type_name="Query", field_name="getAllFleets")
def getAllFleets():
    response = ddbTable.scan()
    logger.info(response)
    items = response["Items"]
    logger.info(items)
    return items


@app.resolver(type_name="Mutation", field_name="addFleet")
def addFleet(fleetName: str, tracks=None):
    # TODO add regular expression for tag validation
    # TODO verify that the wanted tag is not already in use for another track
    fleetId = str(uuid.uuid4())
    createdAt = datetime.utcnow().isoformat() + "Z"
    item = {
        "fleetId": fleetId,
        "fleetName": fleetName,
        "createdAt": createdAt,
    }
    response = ddbTable.put_item(Item=item)
    logger.info(f"ddb put response: {response}")
    logger.info(f"addFleet: response={item}")
    return item


@app.resolver(type_name="Mutation", field_name="deleteFleet")
def deleteFleet(fleetId: str):
    logger.info(f"deleteFleet: fleetId={fleetId}")
    response = ddbTable.delete_item(Key={"fleetId": fleetId})
    logger.info(response)
    return {"fleetId": fleetId}


@app.resolver(type_name="Mutation", field_name="updateFleet")
def udpateFleet(fleetId: str, fleetName: str, tracks):
    logger.info(f"udpateFleet: fleetId={fleetId}")
    # TODO make so that only attributes which are provided is updated

    response = ddbTable.update_item(
        Key={"fleetId": fleetId},
        UpdateExpression="SET fleetName= :newName",
        ExpressionAttributeValues={":newName": fleetName},
        ReturnValues="UPDATED_NEW",
    )
    return {"fleetId": fleetId}