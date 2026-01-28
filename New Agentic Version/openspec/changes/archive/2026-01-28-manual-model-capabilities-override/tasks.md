## 1. Store Updates

- [x] 1.1 Update `SettingsState` in `src/store/settings.ts` to include `modelCapabilitiesOverrides`.
  - Type: `Record<string, { thinking?: boolean; vision?: boolean; tools?: boolean }>` (can use `Partial<ModelCapabilities>`).
- [x] 1.2 Add `setModelCapabilityOverride` action to the store.
  - Arguments: `modelId: string`, `capability: 'thinking' | 'vision' | 'tools'`, `value: boolean | undefined`.
- [x] 1.3 Add `getEffectiveCapabilities` selector/helper.
  - Takes `modelId` and `defaultCapabilities` and merges them.

## 2. UI Implementation

- [x] 2.1 Modify `src/components/settings/AIProviderSettings.tsx`.
  - Add "Model Capabilities" section.
  - Render Toggles for Thinking, Vision, Tools.
  - Ensure toggles reflect the current effective state.
  - Wire up `onChange` to `setModelCapabilityOverride`.
- [x] 2.2 Verify `src/components/chat/ModelHeader.tsx` reflects overrides.
  - Ensure it uses the _effective_ capabilities (via `useSettingsStore` or prop propagation).

## 3. Integration & Logic

- [x] 3.1 Ensure `useChatController` or `client.ts` uses effective capabilities where relevant (mostly mainly for UI badges and prompt augmentation if any).
  - Note: `StreamingFilter` is already permissive, so no change needed there if "Thinking" parses automatically.
  - Verification task: Ensure that enabling "Thinking" allows prompt augmentation (if any) or just user visibility.

## 4. Verification

- [x] 4.1 Manual Test: Enable "Thinking" for a "dumb" model (e.g., standard Llama 3). Verify UI shows badge.
- [x] 4.2 Manual Test: Use DeepSeek via LM Studio (which hides thinking). Enable Override. Send prompt. Verify <think> tags render correctly.

## 5. Discovery Fixes

- [x] 5.1 Update `LMStudioProvider` to handle separate `reasoning` field in JSON response.
  - Inject `<think>` tags when `reasoning` is present in the chunks to ensure `StreamingFilter` captures it.
