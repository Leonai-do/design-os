## Change Requirements

### Requirement: Unified AI Interface

The system SHALL use a unified interface for all AI operations, regardless of the backing provider.

#### Scenario: Generate Content

- **WHEN** the system requests text generation
- **THEN** the active provider SHALL receive the prompt, history, and system instructions
- **AND** return a standardized string response

#### Scenario: Generate Structured Data

- **WHEN** the system requests structured JSON
- **THEN** the active provider SHALL enforce JSON output (via API parameters or prompting)
- **AND** return a parsed object matching the requested schema

### Requirement: Provider Routing

The system SHALL dynamically route requests based on the user's settings.

#### Scenario: Route to Ollama

- **WHEN** `settingsStore` has a configured Ollama URL (e.g., `http://localhost:11434`)
- **AND** a model is selected (e.g., `kimi-k2.5:cloud`)
- **THEN** requests SHALL be sent to the Ollama API

#### Scenario: Route to Google (Fallback)

- **WHEN** no Ollama model is configured/selected
- **OR** if the user explicitly switches to Google (future scope, mostly default behavior now)
- **THEN** requests SHALL be sent to Google GenAI using the API key from environment
