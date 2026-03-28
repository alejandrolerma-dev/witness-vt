
# Witness — Steering

## Stack
- Frontend: React + Tailwind, Vercel
- Backend: Python Lambda + API Gateway
- Auth: AWS Cognito anonymous sessions
- DB: DynamoDB + KMS
- AI: Amazon Bedrock Claude Sonnet, 3 agents

## Rules
- Never store PII (no name, email, vt_id)
- Always validate Cognito token in Lambda
- Agent order: Documenter → Advisor → Navigator
- Simple working solution over complex elegant one
- 10-hour hackathon — speed is everything
