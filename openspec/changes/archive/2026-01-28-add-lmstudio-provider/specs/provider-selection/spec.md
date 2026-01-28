## ADDED Requirements

### Requirement: Provider type selection

The system SHALL allow users to select between multiple inference providers through a dropdown in the settings UI.

#### Scenario: Display provider options

- **WHEN** the user opens the settings panel
- **THEN** the system SHALL display a dropdown with options: "Ollama", "LM Studio", "Google"

#### Scenario: Select Ollama provider

- **WHEN** the user selects "Ollama" from the provider dropdown
- **THEN** the system SHALL set `provider.type` to `'ollama'` and update the default URL to `http://localhost:11434`

#### Scenario: Select LMStudio provider

- **WHEN** the user selects "LM Studio" from the provider dropdown
- **THEN** the system SHALL set `provider.type` to `'lmstudio'` and update the default URL to `http://localhost:1234`

#### Scenario: Select Google provider

- **WHEN** the user selects "Google" from the provider dropdown
- **THEN** the system SHALL set `provider.type` to `'google'` and hide the URL input field

### Requirement: Provider-specific UI messaging

The system SHALL display context-appropriate help text based on the selected provider.

#### Scenario: Ollama connection error message

- **WHEN** the connection to Ollama fails
- **THEN** the system SHALL display: "Make sure Ollama is running and CORS is enabled: OLLAMA_ORIGINS=\"\*\" ollama serve"

#### Scenario: LMStudio connection error message

- **WHEN** the connection to LMStudio fails
- **THEN** the system SHALL display: "Make sure LM Studio server is started. Go to Developer tab → Start Server"

#### Scenario: Connected status with provider name

- **WHEN** the connection succeeds
- **THEN** the system SHALL display "Connected to [Provider Name]" with a green indicator

### Requirement: Provider configuration persistence

The system SHALL persist the selected provider type and its configuration across sessions.

#### Scenario: Persist provider selection

- **WHEN** the user selects a provider and reloads the page
- **THEN** the previously selected provider type SHALL be restored from localStorage

#### Scenario: Backward compatibility

- **WHEN** loading settings that lack a `provider.type` field (legacy data)
- **THEN** the system SHALL default `provider.type` to `'ollama'`

#### Scenario: Per-provider URL persistence

- **WHEN** the user configures different URLs for different providers
- **THEN** each provider's URL SHALL be persisted independently

### Requirement: AI client provider factory

The system SHALL instantiate the correct provider class based on the selected provider type.

#### Scenario: Factory creates OllamaProvider

- **WHEN** `provider.type` is `'ollama'` and URL/model are configured
- **THEN** the AI client factory SHALL return an `OllamaProvider` instance

#### Scenario: Factory creates LMStudioProvider

- **WHEN** `provider.type` is `'lmstudio'` and URL/model are configured
- **THEN** the AI client factory SHALL return an `LMStudioProvider` instance

#### Scenario: Factory creates GoogleProvider

- **WHEN** `provider.type` is `'google'` or no local provider is configured
- **THEN** the AI client factory SHALL return a `GoogleProvider` instance
