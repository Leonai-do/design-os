## Change Requirements

### Requirement: Authenticated Ollama Requests

The system SHALL support authentication for Ollama endpoints.

#### Scenario: Sending Requests with API Key

- **WHEN** the `settingsStore` contains a value for `apiKey`
- **AND** the active provider is Ollama
- **THEN** all requests to the Ollama API (`/api/chat`, `/api/tags`, etc.) SHALL include the `Authorization` header
- **FORMAT** `Authorization: Bearer <apiKey>`

### Requirement: Service Layer Support

- Both the `OllamaProvider` (runtime AI) and `src/services/ollama.ts` (settings checks) SHALL support the API key.
- _Note_: `src/services/ollama.ts` is used for the "Check Connection" button. It also needs the key.
