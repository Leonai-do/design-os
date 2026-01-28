## ADDED Requirements

### Requirement: Ollama max output tokens support

The system SHALL support a max output tokens parameter for controlling generation length in Ollama requests.

#### Scenario: Max output tokens in chat request

- **WHEN** a chat completion request includes a `maxTokens` parameter
- **THEN** the system SHALL pass it as `num_predict` in the Ollama API `options` object

#### Scenario: Max output tokens not specified

- **WHEN** no `maxTokens` parameter is provided
- **THEN** the system SHALL omit `num_predict` from the request, allowing Ollama's default behavior

#### Scenario: Max output tokens in structured output

- **WHEN** a structured output request includes a `maxTokens` parameter
- **THEN** the system SHALL pass it as `num_predict` in the Ollama API `options` object

### Requirement: Max output tokens UI control

The system SHALL provide a UI control for setting max output tokens in the model parameters section.

#### Scenario: Display max output tokens input

- **WHEN** the user views the model parameters section
- **THEN** the system SHALL display a labeled input field for "Max Output Tokens"

#### Scenario: Default max output tokens value

- **WHEN** no max output tokens value has been set
- **THEN** the input SHALL display empty/placeholder indicating "Default (unlimited)"

#### Scenario: Persist max output tokens

- **WHEN** the user sets a max output tokens value
- **THEN** the value SHALL be stored in `provider.currentModelConfig.parameters.maxTokens`

#### Scenario: Clear max output tokens

- **WHEN** the user clears the max output tokens input
- **THEN** the system SHALL remove the `maxTokens` parameter from config, restoring default behavior
