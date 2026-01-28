## Why

To enhance the application's AI capabilities by integrating **Ollama** as a flexible local and cloud model provider. This allows users to leverage private, locally-hosted LLMs as well as cloud-hosted Ollama endpoints, increasing model variety and user data control.

## What Changes

- **Ollama Provider Integration**: Implement the logic to connect to Ollama APIs (chat, tags/list, show/details).
- **Global Settings UI**:
  - Add a **Settings Icon** to the persistent layout (bottom-left).
  - Create a **Settings Popup/Modal** triggered by the icon.
- **Provider Configuration**:
  - Configuration fields for **API Endpoint** (Local/Cloud URLs).
  - Optional **API Key** input.
  - **Model Selection** dropdown (dynamically populated). Default: `kimi-k2.5:cloud`.
  - **Model Parameters** configuration (temperature, ctx window, etc.).
- **Capability Visualization**:
  - Visual indicators for model capabilities: **Vision**, **Tools**, **Embedding**, **Thinking**.
  - Logic to automatically detect these capabilities (via `show` API or metadata) and toggle their active/grayed-out state in the UI.

## Capabilities

### New Capabilities

- `ollama-integration`: Core logic for communicating with Ollama (listing models, chat compliance, capability detection).
- `settings-ui`: The user interface for global application settings, starting with provider configuration and model selection.

### Modified Capabilities

<!-- No existing generic provider spec identified yet. Implementation appears to be fresh or ad-hoc. -->

## Impact

- **Dependencies**: May require an Ollama client library or custom fetch wrappers.
- **UI/UX**: Introduces a new persistent entry point (Settings) and a modal workflow.
- **State Management**: Needs global state for the currently selected provider, model, and configuration.
