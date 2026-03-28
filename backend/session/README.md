# session Lambda

Creates an anonymous Cognito session and returns a short-lived OpenID token.

## Deploy

```bash
zip -j session.zip backend/session/handler.py
aws lambda update-function-code \
  --function-name witness-session \
  --zip-file fileb://session.zip
```

## Required environment variables

| Variable | Description |
|---|---|
| `IDENTITY_POOL_ID` | Cognito Identity Pool ID (e.g. `us-east-1:xxxxxxxx-...`) |
| `AWS_ACCOUNT_ID` | AWS account number |

## Required execution role

Attach the `WitnessSessionRoleArn` output from the `iam` CloudFormation stack.
The role grants `cognito-identity:GetId` and `cognito-identity:GetOpenIdToken`.
