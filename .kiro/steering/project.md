# Witness — Project Steering

## What this is
Anonymous bias incident reporting tool. Users report incidents without any PII being stored.

## Stack (never suggest alternatives)
- Frontend: React + Tailwind, deployed on Vercel
- Backend: Python Lambda + API Gateway
- Auth: AWS Cognito anonymous sessions, zero PII
- DB: DynamoDB with KMS encryption
- AI: Amazon Bedrock Claude Sonnet, 3 agents in sequence
- Deployment: Vercel (frontend), AWS Lambda (backend)

## Security rules (non-negotiable)
- No PII in DynamoDB ever — no name, email, vt_id, phone, or any identifying field
- All Lambdas must validate Cognito token before processing any request
- KMS encryption on all storage, no exceptions
- Never log user input to CloudWatch or any external service
- Show security visually in the UI: lock icons, zero-PII badge

## AI / Bedrock agents
- 3 agents run in sequence: intake → analysis → response
- Use Claude Sonnet via Amazon Bedrock only
- Agents must not retain or echo back PII from user input
- Keep prompts minimal and focused — no unnecessary context passed between agents
- Always handle Bedrock throttling/errors gracefully with user-friendly fallback messages

## Design rules
- Dark navy background (#1a1f36), white cards
- Red only for urgency indicators, never decorative
- Tone: calm, safe, trustworthy — NOT clinical or scary
- Mobile-first layout, exit button always visible
- Every action must be reversible before final submission

## Code style
- Python for all Lambda functions, minimal dependencies
- React functional components only, no class components
- Tailwind utility classes only, no custom CSS files unless unavoidable
- Keep Lambda handlers thin — business logic in separate modules
- Prefer explicit error handling over silent failures

## Hackathon constraint
10-hour build. Always prefer the simplest working solution. Working beats perfect. Skip polish until core flow is complete.
