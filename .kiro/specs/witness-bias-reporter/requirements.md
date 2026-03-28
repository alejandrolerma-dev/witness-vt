# Requirements Document

## Introduction

Witness is an anonymous AI-powered bias incident reporting tool for Virginia Tech students. A student describes a bias incident in plain text and three Amazon Bedrock agents process it in sequence: a Documenter that structures the raw incident into a formal JSON record, an Advisor that matches it to relevant VT policy and explains the student's rights, and a Navigator that generates a step-by-step reporting path and drafts a formal statement. The student remains anonymous throughout. No PII is stored unless the student explicitly opts in.

## Glossary

- **System**: The Witness application as a whole
- **Documenter**: The first Bedrock agent that structures raw incident text into a formal JSON record
- **Advisor**: The second Bedrock agent that matches the incident to VT policy and explains student rights
- **Navigator**: The third Bedrock agent that generates a reporting path and drafts a formal statement
- **Session**: An anonymous Cognito session with no PII attached
- **Incident_Record**: The structured JSON output produced by the Documenter
- **Report**: The final artifact containing Incident_Record, policy match, rights summary, reporting path, and draft statement
- **PII**: Personally Identifiable Information — name, email, VT ID, phone number, or any field that could identify a student
- **KMS**: AWS Key Management Service used to encrypt all stored data
- **Zero-PII_Badge**: A visible UI element confirming no identifying information is stored

---

## Requirements

### Requirement 1: Anonymous Session Initialization

**User Story:** As a student, I want to use the tool without creating an account, so that I can report an incident without fear of identification.

#### Acceptance Criteria

- AC-1: WHEN a student opens the application, THE System SHALL create an anonymous Cognito session with no PII fields populated.
- AC-2: THE System SHALL assign a random session token that contains no student-identifying information.
- AC-3: WHEN a session is created, THE System SHALL display the Zero-PII_Badge and a lock icon confirming anonymous mode is active.
- AC-4: IF Cognito session creation fails, THEN THE System SHALL display a user-friendly error message and prevent the student from proceeding until the session is established.

---

### Requirement 2: Landing Page and Entry Flow

**User Story:** As a student, I want a calm, trustworthy landing screen, so that I feel safe starting a report.

#### Acceptance Criteria

- AC-5: THE System SHALL display a landing page with a dark navy background (#1a1f36), white card content areas, and no red decorative elements.
- AC-6: THE System SHALL display an exit button on every screen that is always visible without scrolling.
- AC-7: WHEN the student clicks the exit button, THE System SHALL clear all in-memory session data and navigate to a neutral exit screen without storing any input.
- AC-8: THE System SHALL display the Zero-PII_Badge and a lock icon on the landing page before the student enters any text.

---

### Requirement 3: Incident Description Input

**User Story:** As a student, I want to describe a bias incident in my own words, so that I can report what happened without filling out a complex form.

#### Acceptance Criteria

- AC-9: THE System SHALL provide a plain-text input area where the student can describe the incident in free-form text.
- AC-10: WHEN the student submits the incident description, THE System SHALL validate that the input is non-empty before sending it to the Documenter.
- AC-11: IF the input exceeds 5000 characters, THEN THE System SHALL display an inline error and prevent submission until the input is within the limit.
- AC-12: THE System SHALL allow the student to edit or clear the incident description before final submission.
- AC-13: THE System SHALL never log the raw incident text to CloudWatch or any external logging service.

---

### Requirement 4: Documenter Agent

**User Story:** As a student, I want my raw description structured into a clear record, so that the report is organized and complete.

#### Acceptance Criteria

- AC-14: WHEN the student submits an incident description, THE Documenter SHALL produce a structured Incident_Record in JSON format containing: incident_type, date_context, location_context, bias_category, description_summary, and severity_indicator.
- AC-15: THE Documenter SHALL strip or omit any PII detected in the input before including content in the Incident_Record.
- AC-16: WHEN the Documenter completes processing, THE System SHALL display the Incident_Record to the student for review before proceeding.
- AC-17: IF the Documenter returns an error or Bedrock is throttled, THEN THE System SHALL display a user-friendly fallback message and offer the student the option to retry.
- AC-18: WHEN the student reviews the Incident_Record, THE System SHALL allow the student to go back and edit the original description before proceeding to the Advisor.

---

### Requirement 5: Advisor Agent

**User Story:** As a student, I want to know which VT policies apply to my incident and what my rights are, so that I can make an informed decision about reporting.

#### Acceptance Criteria

- AC-19: WHEN the Incident_Record is confirmed by the student, THE Advisor SHALL identify the most relevant VT policy from: Honor Code, Title IX, Bias Response Team, or Dean of Students.
- AC-20: THE Advisor SHALL produce a plain-English rights summary of no more than 300 words explaining the student's options under the matched policy.
- AC-21: THE Advisor SHALL include the official VT contact or office associated with the matched policy in its output.
- AC-22: IF no policy clearly matches the incident, THEN THE Advisor SHALL default to the Bias Response Team policy and note the ambiguity in the output.
- AC-23: IF the Advisor returns an error or Bedrock is throttled, THEN THE System SHALL display a user-friendly fallback message and offer the student the option to retry.
- AC-24: WHEN the student reviews the Advisor output, THE System SHALL allow the student to go back to the Incident_Record review step before proceeding to the Navigator.

---

### Requirement 6: Navigator Agent

**User Story:** As a student, I want a step-by-step reporting path and a ready-to-file statement, so that I know exactly what to do next.

#### Acceptance Criteria

- AC-25: WHEN the student confirms the Advisor output, THE Navigator SHALL generate a numbered list of reporting steps specific to the matched VT policy.
- AC-26: THE Navigator SHALL produce a draft formal statement of no more than 500 words that the student can file directly, containing no PII.
- AC-27: THE Navigator SHALL include estimated timelines for each reporting step where available.
- AC-28: IF the Navigator returns an error or Bedrock is throttled, THEN THE System SHALL display a user-friendly fallback message and offer the student the option to retry.
- AC-29: WHEN the student reviews the Navigator output, THE System SHALL allow the student to go back to the Advisor output step before proceeding to the save/exit decision.

---

### Requirement 7: Optional Save

**User Story:** As a student, I want to optionally save my report, so that I can reference it later without being forced to store my identity.

#### Acceptance Criteria

- AC-30: WHEN the Navigator output is displayed, THE System SHALL present an explicit opt-in prompt asking the student if they want to save the Report.
- AC-31: THE System SHALL default to not saving — saving requires an affirmative action by the student.
- AC-32: WHERE the student opts in to save, THE System SHALL store the Report in DynamoDB encrypted with KMS, keyed only by the anonymous session token.
- AC-33: THE System SHALL never store any PII field in DynamoDB regardless of opt-in status.
- AC-34: WHERE the student opts in to save, THE System SHALL display a retrieval token (the session ID) that the student can copy to retrieve the report later.
- AC-35: IF DynamoDB write fails, THEN THE System SHALL inform the student and offer the option to copy the report content to clipboard instead.

---

### Requirement 8: Security and Privacy

**User Story:** As a student, I want assurance that my identity is protected at every layer, so that I can report without fear.

#### Acceptance Criteria

- AC-36: THE System SHALL validate the Cognito session token in every Lambda function before processing any request payload.
- AC-37: IF a Lambda receives a request with an invalid or missing Cognito token, THEN THE System SHALL return HTTP 401 and take no further action.
- AC-38: THE System SHALL encrypt all DynamoDB data at rest using a customer-managed KMS key.
- AC-39: THE System SHALL never write raw user input, incident descriptions, or any agent output to CloudWatch logs or any external observability service.
- AC-40: THE System SHALL pass only the minimum required fields between agents — no raw user text is forwarded beyond the Documenter.
- AC-41: THE Documenter SHALL sanitize agent output to ensure no PII fields appear in the Incident_Record before it is stored or forwarded.

---

### Requirement 9: UI Visual and Interaction Standards

**User Story:** As a student, I want a consistent, calm visual experience, so that the tool feels safe and trustworthy throughout.

#### Acceptance Criteria

- AC-42: THE System SHALL use #1a1f36 as the background color on all screens.
- AC-43: THE System SHALL use white card components for all content areas.
- AC-44: THE System SHALL use red color exclusively for urgency indicators (e.g., severity_indicator = high) and never for decorative purposes.
- AC-45: THE System SHALL render a mobile-first layout that is fully usable on a 375px wide viewport without horizontal scrolling.
- AC-46: THE System SHALL display the exit button in a fixed position so it remains visible without scrolling on all screen sizes.
- AC-47: THE System SHALL display a Zero-PII_Badge and lock icon on every screen of the reporting flow.
- AC-48: WHEN the student is on any step before final submission, THE System SHALL provide a back navigation option to the previous step.

---

### Requirement 10: Agent Pipeline Integrity

**User Story:** As a student, I want the three agents to work reliably in sequence, so that I always receive a complete report.

#### Acceptance Criteria

- AC-49: THE System SHALL invoke agents strictly in order: Documenter → Advisor → Navigator, with each agent receiving only the output of the previous step.
- AC-50: WHEN any agent in the pipeline fails after two retries, THE System SHALL halt the pipeline, preserve the outputs already generated, and display a partial results screen with a clear explanation.
- AC-51: THE System SHALL use Amazon Bedrock Claude Sonnet exclusively for all three agents.
- AC-52: THE System SHALL handle Bedrock throttling by implementing exponential backoff with a maximum of two retries before surfacing a user-friendly error.
