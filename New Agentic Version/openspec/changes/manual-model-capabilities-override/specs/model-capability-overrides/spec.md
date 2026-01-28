## Capability: Model Capability Overrides

This capability enables users to manually override detected capabilities (thinking, vision, tools) for specific AI models, ensuring correct UI behavior even when model metadata is incomplete.

### Requirement: Manual Override UI

Users must be able to manually toggle capabilities for the currently selected model in the settings interface.

#### Scenario: Enable Thinking for Undetected Model

- **GIVEN** I am using a model (e.g., DeepSeek) that supports reasoning but does not advertise it in metadata
- **AND** the "Thinking" capability is currently disabled or unset
- **WHEN** I toggle "Thinking" to ON in the AI Provider overrides section
- **THEN** the override is saved for this specific model ID
- **AND** the UI updates to reflect the active "Thinking" capability

#### Scenario: Persist Overrides

- **GIVEN** I have overridden "Thinking" to ON for Model A
- **AND** I switch to Model B
- **WHEN** I switch back to Model A
- **THEN** the "Thinking" toggle is still ON
- **AND** the application behaves as if Model A has thinking capabilities

### Requirement: Consume Overrides

The system must prioritize manual overrides over auto-detected capabilities when determining runtime behavior.

#### Scenario: Force Thinking Logic

- **GIVEN** "Thinking" is manually enabled for the current model
- **WHEN** the model streams a response containing `<think>` tags
- **THEN** the `StreamingFilter` detects and parses the tags
- **AND** the UI displays the thought process in a `<ThinkingDisclosure>` component
- **EVEN IF** the provider's default metadata says thinking is unsupported
