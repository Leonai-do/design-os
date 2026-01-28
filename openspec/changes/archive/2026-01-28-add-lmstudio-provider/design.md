## Context

The application uses a factory pattern in `src/lib/ai/client.ts` to instantiate AI providers. Currently, it supports:

1. **Ollama** (local) - Uses native Ollama API (`/api/chat`, `/api/tags`)
2. **Google** (cloud) - Fallback when no local provider is configured

The provider is determined at runtime by checking if `provider.url` and `provider.selectedModel` exist in the settings store. The current architecture has no explicit provider type field—it implicitly uses Ollama when a URL is configured.

LMStudio is a popular alternative to Ollama that exposes an **OpenAI-compatible API** on port 1234 by default. This makes integration straightforward since the request/response format follows the OpenAI standard.

**Constraints:**

- Must not break existing Ollama configurations
- Must maintain the same `AIProvider` interface for all providers
- Settings must persist across sessions (localStorage)
- No new npm dependencies

## Goals / Non-Goals

**Goals:**

- Add LMStudio as a selectable inference provider
- Use OpenAI-compatible API for LMStudio (`/v1/chat/completions`, `/v1/models`)
- Add explicit provider type selection in UI (Ollama, LMStudio, Google)
- Add max output tokens control for both Ollama and LMStudio
- Maintain backward compatibility with existing Ollama configurations

**Non-Goals:**

- Streaming support (both providers use `stream: false`)
- Vision/multimodal enhancements (keep existing behavior)
- LMStudio REST API v0 integration (using OpenAI-compat only, per user requirement)
- Auto-detection of which provider is running

## Decisions

### 1. Provider Type Enum

**Decision:** Add an explicit `providerType` field to the settings store.

```typescript
type ProviderType = "ollama" | "lmstudio" | "google";
```

**Alternatives considered:**

- Auto-detect based on API response → Complex, unreliable, poor UX
- Infer from URL port → Fragile (users may use non-default ports)

**Rationale:** Explicit selection is clearer for users and simpler to implement.

### 2. LMStudio API Choice

**Decision:** Use OpenAI-compatible endpoints exclusively.

| Operation        | Endpoint                       |
| ---------------- | ------------------------------ |
| Connection check | `GET /v1/models` (200 = OK)    |
| List models      | `GET /v1/models` → `data[].id` |
| Chat completions | `POST /v1/chat/completions`    |

**Alternatives considered:**

- REST API v0 (`/api/v0/*`) → Richer metadata (model type, context length) but adds complexity
- Mixed approach (v0 for metadata, v1 for completions) → Inconsistent, harder to debug

**Rationale:** User specifically requested OpenAI-compatible API. It's simpler, well-documented, and sufficient for our needs.

### 3. Default Ports and URLs

**Decision:** Set sensible defaults per provider type.

| Provider | Default URL              |
| -------- | ------------------------ |
| Ollama   | `http://localhost:11434` |
| LMStudio | `http://localhost:1234`  |
| Google   | N/A (API key only)       |

**Implementation:** When user switches provider type in UI, auto-populate the default URL (can be overridden).

### 4. Max Output Tokens Implementation

**Decision:** Add `maxTokens` parameter to both providers.

**Ollama:**

- Not natively supported in `/api/chat` options
- Will use `num_predict` option (Ollama's equivalent)

**LMStudio (OpenAI-compat):**

- Use standard `max_tokens` field in request body

**Store addition:**

```typescript
parameters: {
  temperature: number;
  numCtx?: number;       // Context window (existing)
  maxTokens?: number;    // NEW: Max output tokens
  think?: boolean;
}
```

### 5. Connection Check Strategy

**Decision:** Different endpoints per provider for health checks.

| Provider | Health Check     | Success Criteria          |
| -------- | ---------------- | ------------------------- |
| Ollama   | `GET /`          | 200 + "Ollama is running" |
| LMStudio | `GET /v1/models` | 200 OK                    |

**Rationale:** LMStudio doesn't have a simple root endpoint like Ollama. Checking `/v1/models` serves dual purpose (health + confirms API is working).

### 6. Response Format Differences

**Decision:** Handle response parsing per provider in their respective classes.

**Ollama response:**

```javascript
data.message.content;
```

**LMStudio response (OpenAI format):**

```javascript
data.choices[0].message.content;
```

**Structured output:**

- Ollama: `format: 'json'`
- LMStudio: `response_format: { type: 'json_object' }`

### 7. Settings Store Migration

**Decision:** Add `providerType` with backward-compatible default.

```typescript
provider: {
  type: 'ollama',  // NEW - defaults to 'ollama' for existing users
  url: 'http://localhost:11434',
  // ... rest unchanged
}
```

**Migration:** Existing localStorage data without `type` field will default to `'ollama'`, preserving current behavior.

## Risks / Trade-offs

| Risk                                                  | Mitigation                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| LMStudio not exposing context length via `/v1/models` | Use sensible default (131072), allow manual override in UI |
| Users confused by multiple provider options           | Clear labeling, auto-populate defaults, inline help text   |
| API key handling differs (LMStudio accepts dummy key) | Make API key optional for LMStudio, show hint in UI        |
| Breaking existing Ollama setups                       | Default `providerType` to 'ollama', extensive testing      |
| Port conflicts if both Ollama and LMStudio running    | Document that only one should be selected at a time        |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Settings Store                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ provider: {                                               │  │
│  │   type: 'ollama' | 'lmstudio' | 'google',                │  │
│  │   url: string,                                            │  │
│  │   apiKey?: string,                                        │  │
│  │   selectedModel?: string,                                 │  │
│  │   models: string[],                                       │  │
│  │   currentModelConfig: {                                   │  │
│  │     parameters: { temperature, numCtx, maxTokens, think } │  │
│  │   }                                                       │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Client Factory                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ getProvider(): AIProvider {                               │  │
│  │   switch (provider.type) {                                │  │
│  │     case 'ollama':   return new OllamaProvider(...)       │  │
│  │     case 'lmstudio': return new LMStudioProvider(...)     │  │
│  │     case 'google':   return new GoogleProvider()          │  │
│  │   }                                                       │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │OllamaProvider│  │LMStudioProv.│  │GoogleProvider│
     ├─────────────┤  ├─────────────┤  ├─────────────┤
     │/api/chat    │  │/v1/chat/    │  │Gemini API   │
     │num_predict  │  │completions  │  │             │
     │format:'json'│  │max_tokens   │  │             │
     │             │  │response_fmt │  │             │
     └─────────────┘  └─────────────┘  └─────────────┘
```

## Open Questions

1. **Model capabilities for LMStudio**: OpenAI-compat `/v1/models` doesn't return capability info (vision, tools, thinking). Should we:
   - Use name-based heuristics (like we do for Ollama fallback)?
   - Skip capability detection for LMStudio?
   - **Proposed:** Use name-based heuristics for consistency

2. **Context length for LMStudio**: Not exposed via OpenAI-compat API. Options:
   - Hardcode sensible default (131072)
   - Let user set manually
   - **Proposed:** Default to 131072, show in UI as "estimated"
