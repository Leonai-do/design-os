# ollama-integration Specification

## Purpose
TBD - created by archiving change add-ollama-provider. Update Purpose after archive.
## Requirements
### Requirement: Manage Ollama Connection

The system SHALL maintain a connection configuration for the Ollama provider, supporting both local and remote endpoints.

#### Scenario: Default Configuration

- **WHEN** the application starts for the first time
- **THEN** the Ollama endpoint SHALL default to `http://localhost:11434`
- **AND** the default model selection SHALL be `kimi-k2.5:cloud`
- **AND** the API key SHALL be empty

#### Scenario: Update Configuration

- **WHEN** the user provides a new endpoint URL or API key
- **THEN** the system SHALL validate the connectivity
- **AND** persist the new configuration

### Requirement: List Available Models

The system SHALL retrieve the list of available models from the configured Ollama endpoint.

#### Scenario: Successful Fetch

- **WHEN** the connection is valid
- **THEN** the system SHALL query the `/api/tags` endpoint
- **AND** return a list of model names available for selection

#### Scenario: Filter Invalid Models

- **WHEN** the provider returns a list of tags
- **THEN** the system SHALL filter out any models that are inherently incompatible (e.g., embedding-only models if selecting for chat) if necessary
- **NOTE** For now, we list all models.

### Requirement: Detect Model Capabilities

The system SHALL analyze model metadata to determine supported capabilities (Vision, Tools, Embedding, Thinking).

#### Scenario: Detect Vision

- **WHEN** a model is selected
- **AND** its details (via `/api/show`) contain `"vision"` in the `capabilities` array
- **THEN** the system SHALL flag the "Vision" capability as active

#### Scenario: Detect Tools

- **WHEN** a model is selected
- **AND** its metadata indicates tool support (e.g., `mistral`, `llama3-groq-tool-use` families or specific flags)
- **THEN** the system SHALL flag the "Tools" capability as active

#### Scenario: Detect Thinking

- **WHEN** a model is selected
- **AND** its name contains "r1" or "reasoning" (heuristic)
- **THEN** the system SHALL flag the "Thinking" capability as active

