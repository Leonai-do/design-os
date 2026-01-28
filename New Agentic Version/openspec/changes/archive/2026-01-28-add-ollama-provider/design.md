## Context

The application requires integration with an AI provider to enable agentic features. **Ollama** is selected as the first provider. Currently, the "New Agentic Version" is a React/Vite application without a centralized settings management system for AI providers. We need to implement both the UI for configuration and the integration layer for Ollama.

## Goals / Non-Goals

**Goals:**

- Enable connection to both local (`localhost:11434`) and cloud-hosted Ollama instances.
- Persistent storage of configuration (endpoint, model, parameters) using local storage or similar.
- Dynamic discovery of available models from the endpoint.
- Visual feedback on model capabilities (Vision, Tools, etc.) based on metadata.

**Non-Goals:**

- Implementing other providers (OpenAI, Anthropic) in this specific change (though the design should be extensible).
- Server-side proxying (initial implementation assumes direct client-side access, requiring CORS configuration on the Ollama instance).

## Decisions

### State Management

- **Decision**: Use `zustand` to create a `useSettingsStore`.
- **Rationale**: Minimalist, easy to persist to `localStorage` (via middleware), and already present in the project dependencies.

### UI Library

- **Decision**: Use Radix UI primitives (Dialog or Popover) for the Settings Modal.
- **Rationale**: Accessible, unstyled (allows custom styling matches), and already in dependencies (`@radix-ui/react-slot` implies Radix usage).

### API Integration

- **Decision**: Direct client-side `fetch` calls to Ollama API.
- **Rationale**: Simplicity.
- **Risk**: CORS errors. Users will need to set `OLLAMA_ORIGINS="*"` on their local instance.

### Capability Detection Strategy

- **Decision**:
  - **Vision**: Check for `"vision"` in the `capabilities` array returned by `/api/show`.
  - **Tools**: Check for `tools` support in modelfile or specific model families (e.g., `mistral`, `llama3-groq-tool-use`, `qwen`).
  - **Thinking**: Detect via model name conventions (e.g., `deepseek-r1`, `qwen3` with thinking enabled) or specific modelfile parameters.
    - _Note_: API requires sending `think: true` (or levels) in the request body for these models.
  - **Embedding**: Generally supported, but can be verified if necessary.

## Risks / Trade-offs

- **CORS Restricted**: Browser cannot access `localhost:11434` by default without Ollama configuration.
  - _Mitigation_: Add a help tip in the Settings UI with the exact command to run Ollama with CORS enabled (`OLLAMA_ORIGINS="*"`).

- **Capability Accuracy**: Ollama's API doesn't fully standardize "capability flags" yet (e.g. "supports tools").
  - _Mitigation_: Use heuristic parsing of the `modelfile` or `details` returned by `/api/show`.
