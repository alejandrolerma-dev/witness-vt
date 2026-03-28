# Witness — Infrastructure

## Prerequisites

- AWS CLI configured (`aws configure`)
- An AWS account with permissions to create Cognito, IAM, and CloudFormation resources

---

## Deploy Cognito (Task 1)

```bash
aws cloudformation deploy \
  --template-file infra/cognito.yaml \
  --stack-name witness-cognito \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

After API Gateway is created (Task 4), update the stack with the real API ARN:

```bash
aws cloudformation deploy \
  --template-file infra/cognito.yaml \
  --stack-name witness-cognito \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1 \
  --parameter-overrides ApiGatewayArn=arn:aws:execute-api:us-east-1:<account-id>:<api-id>/*/POST/session
```

### Get output values (needed by later tasks)

```bash
aws cloudformation describe-stacks \
  --stack-name witness-cognito \
  --query "Stacks[0].Outputs" \
  --output table
```

Key outputs:
| Export Name | Used by |
|---|---|
| `WitnessUserPoolId` | Lambda auth.py (JWKS validation), API Gateway authorizer |
| `WitnessUserPoolClientId` | Frontend session init |
| `WitnessIdentityPoolId` | Frontend `cognitoidentity.getId()` call |
| `WitnessUnauthRoleArn` | Identity pool role attachment |

---

## Tear down

```bash
aws cloudformation delete-stack --stack-name witness-cognito --region us-east-1
```

---

## Stack order

Deploy stacks in this order (each depends on the previous):

1. `cognito.yaml` — this file
2. `kms.yaml` — KMS CMK (Task 3)
3. `dynamodb.yaml` — DynamoDB table (Task 2)
4. `api.yaml` — API Gateway + Lambda roles (Tasks 4–5)

## Deploy DynamoDB (Task 2)

> Requires the `witness-kms` stack to be deployed first (Task 3 in stack order, but KMS key ARN must exist).

```bash
aws cloudformation deploy \
  --template-file infra/dynamodb.yaml \
  --stack-name witness-dynamodb \
  --region us-east-1 \
  --parameter-overrides \
    KmsKeyArn=$(aws cloudformation list-exports \
      --query "Exports[?Name=='WitnessKmsKeyArn'].Value" \
      --output text --region us-east-1)
```

### Get output values (needed by Lambda tasks)

```bash
aws cloudformation describe-stacks \
  --stack-name witness-dynamodb \
  --query "Stacks[0].Outputs" \
  --output table
```

Key outputs:
| Export Name | Used by |
|---|---|
| `WitnessTableName` | save Lambda (DynamoDB put/get) |
| `WitnessTableArn` | Lambda IAM role policy |


---

## Deploy KMS (Task 3)

> Deploy this before `dynamodb.yaml`. The DynamoDB stack imports `WitnessKmsKeyArn` from this stack.

```bash
aws cloudformation deploy \
  --template-file infra/kms.yaml \
  --stack-name witness-kms \
  --region us-east-1
```

After Task 5 creates the Lambda execution roles, update the stack to scope the key policy to those roles:

```bash
aws cloudformation deploy \
  --template-file infra/kms.yaml \
  --stack-name witness-kms \
  --region us-east-1 \
  --parameter-overrides \
    LambdaRoleArns="arn:aws:iam::<account-id>:role/witness-process-role,arn:aws:iam::<account-id>:role/witness-save-role"
```

### Get output values (needed by DynamoDB and Lambda tasks)

```bash
aws cloudformation describe-stacks \
  --stack-name witness-kms \
  --query "Stacks[0].Outputs" \
  --output table
```

Key outputs:
| Export Name | Used by |
|---|---|
| `WitnessKmsKeyArn` | `dynamodb.yaml` KmsKeyArn parameter |
| `WitnessKmsKeyId` | Lambda IAM policy (kms:GenerateDataKey grant) |
| `WitnessKmsAliasArn` | Reference / audit |


---

## Deploy API Gateway (Task 4)

> Deploy after Tasks 1–3 (cognito, kms, dynamodb stacks must exist). Lambda ARN parameters are optional at this stage — leave them empty and update after Tasks 6–14.

```bash
aws cloudformation deploy \
  --template-file infra/api.yaml \
  --stack-name witness-api \
  --region us-east-1
```

Once Lambdas are deployed (Tasks 6–14), update the stack with their ARNs:

```bash
aws cloudformation deploy \
  --template-file infra/api.yaml \
  --stack-name witness-api \
  --region us-east-1 \
  --parameter-overrides \
    SessionLambdaArn=arn:aws:lambda:us-east-1:<account-id>:function:witness-session \
    ProcessLambdaArn=arn:aws:lambda:us-east-1:<account-id>:function:witness-process \
    SaveLambdaArn=arn:aws:lambda:us-east-1:<account-id>:function:witness-save \
    RetrieveLambdaArn=arn:aws:lambda:us-east-1:<account-id>:function:witness-retrieve
```

After deploying, update the Cognito stack with the real API ARN (enables the unauthenticated role to call POST /session):

```bash
API_ARN=$(aws cloudformation list-exports \
  --query "Exports[?Name=='WitnessApiArn'].Value" \
  --output text --region us-east-1)

aws cloudformation deploy \
  --template-file infra/cognito.yaml \
  --stack-name witness-cognito \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1 \
  --parameter-overrides ApiGatewayArn=$API_ARN
```

### Get output values

```bash
aws cloudformation describe-stacks \
  --stack-name witness-api \
  --query "Stacks[0].Outputs" \
  --output table
```

Key outputs:
| Export Name | Used by |
|---|---|
| `WitnessApiId` | Reference / debugging |
| `WitnessApiUrl` | Frontend `api.js` base URL |
| `WitnessApiArn` | `cognito.yaml` ApiGatewayArn parameter |

### Tear down

```bash
aws cloudformation delete-stack --stack-name witness-api --region us-east-1
```

---

## Deploy IAM Roles (Task 5)

> Requires `witness-kms` and `witness-dynamodb` stacks to be deployed first — the IAM template imports `WitnessKmsKeyArn` and `WitnessTableArn` from those stacks.

```bash
aws cloudformation deploy \
  --template-file infra/iam.yaml \
  --stack-name witness-iam \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Get output values (needed by Lambda tasks)

```bash
aws cloudformation describe-stacks \
  --stack-name witness-iam \
  --query "Stacks[0].Outputs" \
  --output table
```

Key outputs:
| Export Name | Used by |
|---|---|
| `WitnessSessionRoleArn` | session Lambda execution role |
| `WitnessProcessRoleArn` | process Lambda execution role |
| `WitnessSaveRoleArn` | save Lambda execution role |
| `WitnessRetrieveRoleArn` | retrieve Lambda execution role |

### Update the KMS stack after deploying

Once the IAM stack is deployed, update `witness-kms` to scope the key policy to the process and save role ARNs (as described in the Deploy KMS section above):

```bash
aws cloudformation deploy \
  --template-file infra/kms.yaml \
  --stack-name witness-kms \
  --region us-east-1 \
  --parameter-overrides \
    LambdaRoleArns="$(aws cloudformation list-exports \
      --query "Exports[?Name=='WitnessProcessRoleArn'].Value" \
      --output text --region us-east-1),$(aws cloudformation list-exports \
      --query "Exports[?Name=='WitnessSaveRoleArn'].Value" \
      --output text --region us-east-1)"
```

### Tear down

```bash
aws cloudformation delete-stack --stack-name witness-iam --region us-east-1
```
