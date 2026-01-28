## 1. Settings Store Updates

- [ ] 1.1 Add `ProviderType` type definition (`'ollama' | 'lmstudio' | 'google'`) to `settingsStore.ts`
- [ ] 1.2 Add `type` field to `ProviderConfig` interface with default value `'ollama'`
- [ ] 1.3 Add `maxTokens` field to `ModelConfig.parameters` interface
- [ ] 1.4 Create `setProviderType` action that updates type and sets default URL per provider
- [ ] 1.5 Verify backward compatibility: existing localStorage data without `type` defaults to `'ollama'`

## 2. LMStudio Service Layer

- [ ] 2.1 Create `src/services/lmstudio.ts` with `checkConnection` function (GET `/v1/models`)
- [ ] 2.2 Add `fetchModels` function to retrieve model list from `/v1/models` endpoint
- [ ] 2.3 Add `extractContextLength` function with 131072 default (OpenAI-compat doesn't expose this)
- [ ] 2.4 Add `detectCapabilities` function using name-based heuristics (matching Ollama pattern)
- [ ] 2.5 Export all functions and types from the service module

## 3. LMStudio Provider Implementation

- [ ] 3.1 Create `src/lib/ai/providers/lmstudio.ts` implementing `AIProvider` interface
- [ ] 3.2 Implement `generateContent` method using POST `/v1/chat/completions`
- [ ] 3.3 Handle response parsing: extract from `data.choices[0].message.content`
- [ ] 3.4 Add image support: format as OpenAI vision content blocks
- [ ] 3.5 Implement `generateStructured` method with `response_format: { type: 'json_object' }`
- [ ] 3.6 Add JSON cleanup utility to strip markdown code blocks from responses
- [ ] 3.7 Add `maxTokens` parameter mapping to `max_tokens` in request body
- [ ] 3.8 Add `temperature` and other config parameters to request

## 4. Ollama Provider Enhancement

- [ ] 4.1 Add `maxTokens` parameter to `OllamaProvider` constructor config interface
- [ ] 4.2 Map `maxTokens` to `num_predict` in the `options` object for `/api/chat` requests
- [ ] 4.3 Apply `num_predict` to both `generateContent` and `generateStructured` methods
- [ ] 4.4 Verify existing functionality is not affected by the addition

## 5. AI Client Factory Update

- [ ] 5.1 Import `LMStudioProvider` in `src/lib/ai/client.ts`
- [ ] 5.2 Update `getProvider` function to read `provider.type` from settings store
- [ ] 5.3 Add switch statement: `'ollama'` → OllamaProvider, `'lmstudio'` → LMStudioProvider, `'google'` → GoogleProvider
- [ ] 5.4 Pass `maxTokens` parameter to both Ollama and LMStudio providers

## 6. UI: Provider Selector Component

- [ ] 6.1 Add provider type dropdown at top of `ProviderConfigForm.tsx`
- [ ] 6.2 Create dropdown options: "Ollama", "LM Studio", "Google"
- [ ] 6.3 Wire dropdown to `setProviderType` action from settings store
- [ ] 6.4 Auto-populate default URL when switching providers (11434 for Ollama, 1234 for LMStudio)
- [ ] 6.5 Hide URL input when Google provider is selected

## 7. UI: Provider-Specific Messaging

- [ ] 7.1 Add provider-aware error messages in connection failure state
- [ ] 7.2 Ollama: "Make sure Ollama is running and CORS is enabled: OLLAMA_ORIGINS=\"\*\" ollama serve"
- [ ] 7.3 LMStudio: "Make sure LM Studio server is started. Go to Developer tab → Start Server"
- [ ] 7.4 Update success message to show "Connected to [Provider Name]"
- [ ] 7.5 Import correct service functions based on selected provider type

## 8. UI: Max Output Tokens Control

- [ ] 8.1 Add max output tokens input field to `ModelParameters.tsx`
- [ ] 8.2 Create labeled input with placeholder "Default (unlimited)"
- [ ] 8.3 Wire input to `updateModelConfig({ maxTokens: value })` action
- [ ] 8.4 Handle empty/cleared input: remove `maxTokens` from config
- [ ] 8.5 Display current value from `provider.currentModelConfig.parameters.maxTokens`

## 9. Integration & Testing

- [ ] 9.1 Test LMStudio connection check with server running and stopped
- [ ] 9.2 Test model listing from LMStudio `/v1/models` endpoint
- [ ] 9.3 Test chat completion with LMStudio (text generation)
- [ ] 9.4 Test structured output with LMStudio (JSON mode)
- [ ] 9.5 Test max output tokens with Ollama (verify `num_predict` in request)
- [ ] 9.6 Test max output tokens with LMStudio (verify `max_tokens` in request)
- [ ] 9.7 Test provider switching persists correctly across page reloads
- [ ] 9.8 Test backward compatibility: load app with legacy localStorage (no `type` field)
