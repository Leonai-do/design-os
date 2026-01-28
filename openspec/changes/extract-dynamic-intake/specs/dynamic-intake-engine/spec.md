# Specification: Dynamic Intake Engine

## ADDED Requirements

### Requirement: Dynamic Question Generation

The system MUST generate the next interview step based on the current context using an AI model. This enables the "on-the-fly" adaptation of the interview process.

#### Scenario: Generate Next Step

WHEN the user submits an answer to the current step
THEN the system sends the accumulated `PrdContext` to the AI service
AND the system receives a JSON schema defining the next question and input fields
AND the system renders the new fields dynamically

### Requirement: Context Management

The system MUST maintain a cumulative context of all user answers throughout the session (e.g., `PrdContext`). This ensures the AI "remembers" previous answers to ask relevant follow-up questions.

#### Scenario: Update Context

WHEN the user answers a question
THEN the system updates the session context with the new key-value pair
AND the context is persisted for the next generation step

### Requirement: Dynamic UI Rendering

The system MUST render UI inputs based on the AI-generated JSON schema. The schema defines the field type, label, and potential options.

#### Scenario: Render Text Input

WHEN the schema specifies a field of type "text" or "textarea"
THEN the system renders a corresponding text input component

#### Scenario: Render Selection Input

WHEN the schema specifies a field of type "select" or "multiselect"
THEN the system renders a dropdown or checkbox component with the provided options

### Requirement: Input Validation

The system MUST validate user inputs against the generated schema before proceeding to the next step or generation phase.

#### Scenario: Validate Required Fields

WHEN the user tries to proceed without filling a required field defined in the schema
THEN the system prevents progression
AND shows an error message to the user
