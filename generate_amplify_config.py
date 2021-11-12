import json

with open('cdk.outputs') as json_file:
    data = json.load(json_file)['CdkDeepRacerEventManagerStack']

    for key in data.keys():
        if key.startswith('apiGatewayEndpoint'):
            apiGatewayEndpoint_key = key

    output_data = {
        "Auth": {
            "region": data['region'],
            "userPoolId": data['userPoolId'],
            "userPoolWebClientId": data['userPoolWebClientId'],
            "identityPoolId": data['identityPoolId']
        },
        "Storage": {
            "region": data['region'],
            "bucket": data['modelsBucketName'],
            "identityPoolId":data['identityPoolId']
        },
        "API": {
            "endpoints": [
                {
                    "name": "models",
                    "endpoint": data[apiGatewayEndpoint_key],
                    "region": data['region']
                }
            ]
        }
    }

    print(json.dumps(output_data, indent=4))

    with open('website/src/config.json', 'w') as outfile:
        json.dump(output_data, outfile, indent=4)