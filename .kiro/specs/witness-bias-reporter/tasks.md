# Tasks

## Phase 1: Infrastructure & Auth

- [x] 1. Create Cognito anonymous identity pool and user pool (witness-anon-pool, witness-anon-identity-pool) with no required attributes and unauthenticated identities enabled [Security]
- [x] 2. Create DynamoDB table `witness-reports` with session_id PK, saved_at SK, KMS CMK encryption, and TTL attribute enabled [Security]
- [x] 3. Create KMS customer-managed key and attach resource policy scoped to Lambda execution roles only [Security]
- [x] 4. Create API Gateway REST API with CORS enabled for Vercel origin, and define all four routes: POST /session, POST /report/process, POST /report/save, GET /report/{session_id} [Backend]
- [x] 5. Create IAM roles for each Lambda with least-privilege policies: Bedrock InvokeModel, DynamoDB read/write on witness-reports, KMS decrypt/encrypt [Security]

## Phase 2: Backend — Session Lambda

- [x] 6. Implement `session` Lambda handler (handler.py) that calls Cognito identity pool, returns session_id and id_token [Backend]
- [x] 7. Implement Cognito JWT validation module (auth.py) — verify token signature against JWKS, check expiry, return 401 on failure — used by all Lambdas [Security]

## Phase 3: Backend — Process Lambda

- [x] 8. Implement Bedrock client module (bedrock_client.py) with exponential backoff retry (max 2 retries) and user-friendly error on throttle/failure [Backend]
- [x] 9. Implement Documenter agent module (documenter.py) — build prompt, call Bedrock Claude Sonnet, parse and validate JSON output against Incident_Record schema [Backend]
- [x] 10. Implement Advisor agent module (advisor.py) — receive Incident_Record, build prompt, call Bedrock, parse and validate JSON output against advice schema [Backend]
- [x] 11. Implement Navigator agent module (navigator.py) — receive Incident_Record + advice, build prompt, call Bedrock, parse and validate JSON output against navigation schema [Backend]
- [x] 12. Implement `process` Lambda handler (handler.py) — validate Cognito token, validate raw_text length, invoke Documenter → Advisor → Navigator in sequence, return combined result or partial on failure [Backend]

## Phase 4: Backend — Save Lambda

- [x] 13. Implement `save` Lambda handler (handler.py) — validate Cognito token, validate no PII fields in payload, write to DynamoDB with session_id PK and TTL set to now+90 days [Backend]
- [x] 14. Implement `retrieve` Lambda handler (handler.py) — validate Cognito token, query DynamoDB by session_id, return report or 404 [Backend]

## Phase 5: Frontend — Foundation

- [x] 15. Scaffold React + Tailwind project with Vercel deployment config (vercel.json), set base background color to #1a1f36 [Frontend]
- [x] 16. Create reusable components: WhiteCard, ExitButton (fixed position), ZeroPIIBadge (lock icon + "No data stored" label), BackButton [Frontend]
- [x] 17. Create API client module (api.js) — wraps fetch with Authorization header injection, handles 401/502 errors, never logs request bodies [Frontend]
- [x] 18. Implement anonymous session initialization on app load — call POST /session, store id_token in memory only (no localStorage, no sessionStorage) [Frontend]

## Phase 6: Frontend — Reporting Flow

- [x] 19. Build LandingPage screen — dark navy background, white card with app description, ZeroPIIBadge, lock icon, "Start Report" button [Frontend]
- [x] 20. Build DescribeIncidentScreen — textarea (max 5000 chars), character counter, inline validation, "Analyze Incident" submit button, ExitButton, BackButton to landing [Frontend]
- [x] 21. Build ProcessingScreen — loading state shown while POST /report/process is in flight, spinner with calm message, ExitButton always visible [Frontend]
- [x] 22. Build ReviewDocumenterScreen — display Incident_Record fields in a white card, severity_indicator shown in red only if "high", BackButton to edit description, "Looks right, continue" button [Frontend]
- [x] 23. Build ReviewAdvisorScreen — display matched_policy, rights_summary, vt_contact in white card, BackButton to ReviewDocumenterScreen, "Continue" button [Frontend]
- [x] 24. Build ReviewNavigatorScreen — display reporting_steps list and draft_statement in white card, BackButton to ReviewAdvisorScreen, "Save Report" opt-in button and "Exit Without Saving" button [Frontend]

## Phase 7: Frontend — Save and Exit

- [x] 25. Build SaveConfirmScreen — shown after opt-in save succeeds, display retrieval_token with copy-to-clipboard button, "Done" exit button [Frontend]
- [x] 26. Build ErrorScreen — shown on agent pipeline failure, display partial results if available, "Try Again" and "Exit" buttons [Frontend]
- [x] 27. Build ExitScreen — neutral screen shown after exit button is pressed, confirm all in-memory data cleared, no navigation back into the flow [Frontend]

## Phase 8: Security Hardening

- [x] 28. Audit all Lambda handlers to confirm no raw_text or agent output is written to CloudWatch logs — use structured logging with only session_id and status codes [Security]
- [x] 29. Add input sanitization in process Lambda to reject payloads containing obvious PII patterns (email regex, VT PID format) before forwarding to Bedrock [Security]
- [x] 30. Verify DynamoDB save Lambda rejects any payload containing name, email, vt_id, or phone fields before writing [Security]

## Phase 9: Integration & Polish

- [x] 31. Wire frontend flow end-to-end: session init → describe → process → review three screens → save/exit [Frontend]
- [x] 32. Test Bedrock throttle path — mock 429 response and verify exponential backoff fires, user-friendly message appears after 2 retries [Backend]
- [x] 33. Verify mobile layout at 375px viewport — all screens usable without horizontal scroll, ExitButton always visible [Frontend]

## Phase 10: Pitch Prep

- [x] 34. Add demo mode flag — if REACT_APP_DEMO=true, use mock API responses so the app runs without live AWS credentials during the pitch [Pitch]
- [x] 35. Prepare 60-second live demo script: landing → describe incident → show three agent outputs → show zero-PII badge → exit [Pitch]
