## ADDED Requirements

### Requirement: LMStudio connection check

The system SHALL verify connectivity to a LMStudio server by sending a GET request to the `/v1/models` endpoint.

#### Scenario: Successful connection

- **WHEN** the LMStudio server is running and accessible at the configured URL
- **THEN** the connection check SHALL return `true`

#### Scenario: Failed connection - server not running

- **WHEN** the LMStudio server is not running or unreachable
- **THEN** the connection check SHALL return `false` without throwing an exception

#### Scenario: Failed connection - invalid URL

- **WHEN** the configured URL is malformed or points to a non-LMStudio service
- **THEN** the connection check SHALL return `false` and log a warning

### Requirement: LMStudio model listing

The system SHALL retrieve available models from LMStudio's OpenAI-compatible `/v1/models` endpoint.

#### Scenario: Successful model listing

- **WHEN** the LMStudio server is connected and has models available
- **THEN** the system SHALL return an array of model identifiers from `data[].id`

#### Scenario: No models available

- **WHEN** the LMStudio server is connected but has no models loaded
- **THEN** the system SHALL return an empty array

#### Scenario: Connection failure during listing

- **WHEN** the connection to LMStudio fails during model listing
- **THEN** the system SHALL return an empty array and log an error

### Requirement: LMStudio chat completions

The system SHALL send chat completion requests to LMStudio using the OpenAI-compatible `/v1/chat/completions` endpoint.

#### Scenario: Successful text generation

- **WHEN** a valid chat completion request is sent with messages array
- **THEN** the system SHALL return the assistant's response from `data.choices[0].message.content`

#### Scenario: Generation with images

- **WHEN** a chat completion request includes base64-encoded images
- **THEN** the system SHALL format images as OpenAI vision content blocks and include them in the request

#### Scenario: Request with temperature setting

- **WHEN** the request includes a temperature parameter
- **THEN** the temperature SHALL be passed to the LMStudio API in the request body

#### Scenario: Request with max output tokens

- **WHEN** the request includes a maxTokens parameter
- **THEN** the system SHALL pass it as `max_tokens` in the request body

### Requirement: LMStudio structured output

The system SHALL support JSON-formatted responses using OpenAI-compatible response format.

#### Scenario: JSON mode enabled

- **WHEN** a structured output request is made with a JSON schema
- **THEN** the system SHALL include `response_format: { type: 'json_object' }` in the request

#### Scenario: Parse JSON response

- **WHEN** the LMStudio response contains JSON content (possibly wrapped in markdown)
- **THEN** the system SHALL strip markdown code blocks and parse the JSON content

#### Scenario: JSON parse failure

- **WHEN** the response cannot be parsed as valid JSON
- **THEN** the system SHALL return a fallback message object without crashing

### Requirement: LMStudio default configuration

The system SHALL use sensible defaults for LMStudio connections.

#### Scenario: Default URL

- **WHEN** no custom URL is configured for LMStudio
- **THEN** the system SHALL default to `http://localhost:1234`

#### Scenario: Default context length

- **WHEN** the model's context length cannot be determined from the API
- **THEN** the system SHALL default to 131072 tokens

#### Scenario: API key handling

- **WHEN** an API key is provided for LMStudio
- **THEN** the system SHALL include it as a Bearer token in the Authorization header
