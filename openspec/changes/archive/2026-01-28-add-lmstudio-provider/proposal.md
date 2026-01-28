## Why

The application currently only supports Ollama as a local inference provider. Users who prefer LMStudio—another popular local LLM runtime—cannot use the app without switching their entire setup. Adding LMStudio as a second provider gives users choice and flexibility in their local AI backend. Additionally, the current Ollama implementation lacks max output tokens control, which is a standard parameter users expect for controlling generation length.

## What Changes

- **Add LMStudio provider** using OpenAI-compatible API endpoints (`/v1/chat/completions`, `/v1/models`)
- **Add LMStudio service layer** for connection checking and model discovery
- **Add provider type selector** in settings UI to switch between Ollama, LMStudio, and Google
- **Add max output tokens parameter** to both LMStudio and Ollama providers for consistent generation control
- **Update AI client factory** to instantiate the correct provider based on user selection
- **Update settings store** to persist provider type selection and per-provider configurations

## Capabilities

### New Capabilities

- `lmstudio-provider`: LMStudio inference provider implementation using OpenAI-compatible API, including connection checking, model listing, and chat completions
- `provider-selection`: UI and state management for selecting between multiple inference providers (Ollama, LMStudio, Google)

### Modified Capabilities

- `ollama-provider`: Add max output tokens (`max_tokens`) parameter support for consistent generation control across all providers

## Impact

**Files to be modified:**

- `src/store/settingsStore.ts` - Add provider type enum, update state shape
- `src/lib/ai/client.ts` - Update factory to handle provider selection
- `src/lib/ai/providers/ollama.ts` - Add max_tokens support
- `src/components/settings/ProviderConfigForm.tsx` - Add provider selector, update messaging per provider
- `src/components/settings/ModelParameters.tsx` - Add max output tokens slider/input

**Files to be created:**

- `src/services/lmstudio.ts` - Connection, model listing, model details utilities
- `src/lib/ai/providers/lmstudio.ts` - LMStudioProvider class implementing AIProvider interface

**Dependencies:**

- No new npm dependencies required (uses native fetch API)
- LMStudio server must be running locally on port 1234 (default)

**APIs affected:**

- Internal AI client API remains unchanged (same `generateContent`, `generateStructured` interface)
- Settings store shape changes (minor, backward-compatible with defaults)

## Test Strategy

1. **Connection testing**: Verify LMStudio connection check works when server is running and fails gracefully when not
2. **Model discovery**: Confirm models are listed correctly from LMStudio's `/v1/models` endpoint
3. **Chat completions**: Test text generation with streaming disabled
4. **Structured output**: Test JSON mode with `response_format` parameter
5. **Provider switching**: Verify switching between Ollama/LMStudio/Google updates client correctly
6. **Max output tokens**: Confirm the parameter is respected by both Ollama and LMStudio
7. **Persistence**: Verify provider selection and config persists across page reloads

## ADDED/MODIFIED/REMOVED

### ADDED

- `src/services/lmstudio.ts`
- `src/lib/ai/providers/lmstudio.ts`

### MODIFIED

- `src/store/settingsStore.ts`
- `src/lib/ai/client.ts`
- `src/lib/ai/providers/ollama.ts`
- `src/components/settings/ProviderConfigForm.tsx`
- `src/components/settings/ModelParameters.tsx`

### REMOVED

- None
