## ADDED Requirements

### Requirement: Global Settings Entry Point

The system SHALL provide a persistent access point for global settings.

#### Scenario: Settings Icon

- **WHEN** the user views the main application layout
- **THEN** a settings icon SHALL be visible in the bottom-left corner
- **AND** clicking it SHALL open the Settings Modal

### Requirement: Provider Configuration Interface

The system SHALL provide a UI to configure the AI provider details.

#### Scenario: Configure Fields

- **WHEN** the Settings Modal is open
- **THEN** input fields SHALL be displayed for:
  - "API Endpoint" (text)
  - "API Key" (password/masked text)
  - "Model" (dropdown)
- **AND** a "Model Parameters" section SHALL be available (collapsible or visible)

#### Scenario: Model Selection

- **WHEN** the API connection is established
- **THEN** the "Model" dropdown SHALL be populated with the list of models fetched from the provider

### Requirement: Capability Visualization

The system SHALL visually indicate the capabilities of the selected model.

#### Scenario: Display Capabilities

- **WHEN** a model is selected
- **THEN** indicators for "Vision", "Tools", "Embedding", and "Thinking" SHALL be displayed
- **AND** active capabilities SHALL be highlighted (e.g., colored or solid)
- **AND** inactive capabilities SHALL be grayed out or dimmed
