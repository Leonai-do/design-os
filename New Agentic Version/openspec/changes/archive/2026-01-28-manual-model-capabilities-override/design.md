## Context

Currently, AI model capabilities (Thinking, Vision, Tools) are auto-detected based on provider metadata (e.g., matching "reasoning" via `ollama show`). However, many models (especially via LM Studio or custom proxies) do not expose this metadata correctly. This forces users to use "dumb" interfaces even for "smart" models, or prevents the UI from correctly parsing thought streams. We need a manual override layer.

## Goals / Non-Goals

**Goals:**

- Add `modelOverrides` map to `useSettingsStore` to persist capability flags per model ID.
- Add UI toggles in `AIProviderSettings` for Thinking, Vision, and Tools.
- Ensure `ModelHeader` and `useSettingsStore.getProviderCapabilities` (or similar selector) respect these overrides.
- Ensure the override takes precedence over auto-detection.

**Non-Goals:**

- We are not implementing _new_ capabilities, only toggling existing ones.
- We are not syncing these settings to the cloud/backend; local persistence is sufficient.

## Decisions

### 1. Store Structure

We will modify `SettingsState` in `src/store/settings.ts`.
**New Field**: `modelCapabilitiesOverrides: Record<string, Partial<ModelCapabilities>>`

- Key: `modelId` (string)
- Value: Object with overrides (e.g., `{ thinking: true, vision: false }`).
- We specifically use `Partial` so we only store what is explicitly changed? Or maybe just store the full set of flags for simplicity.
- Let's store `Record<string, { thinking?: boolean; vision?: boolean; tools?: boolean }>` to allow "inherit" (undefined) vs "force on/off".

### 2. Resolution Logic

We will add a helper or selector `getEffectiveCapabilities(modelId: string, providerDefault: ModelCapabilities): ModelCapabilities` in the store or `utils.ts`.
Logic:

```typescript
const override = store.modelCapabilitiesOverrides[modelId];
return {
  thinking: override?.thinking ?? providerDefault.thinking,
  vision: override?.vision ?? providerDefault.vision,
  tools: override?.tools ?? providerDefault.tools,
};
```

### 3. UI Location

The `AIProviderSettings.tsx` modal is the natural place. We will add a new section "Model Capabilities" below the Model selector.
This section will show 3 toggles (or checkboxes/badges) for Thinking, Vision, Tools.
It should default to the _current effective state_ but visually indicate if it's an override?
Simplify: Just show the toggles. If the user toggles it, it saves the override.

### 4. Thinking Tag Parsing

The `StreamingFilter` logic is generally permissive (it parses `<think>` if it sees it). However, the _Provider_ might strip them or behave differently if it thinks the model _can't_ think.
Actually, `StreamingFilter` is the source of truth for parsing.
The `ModelHeader` uses capabilities to show the badge.
If we enable "Thinking", the user sees the badge, and generally feels better.
Crucially, if `StreamingFilter` _always_ runs (which it does now in `generateStructured`), then the parsing just works.
So the main impact is indeed UI configuration and "correctness" of the app state.

## Risks / Trade-offs

- **Risk**: User enables "Thinking" for a model that _doesn't_ think.
  - **Result**: `StreamingFilter` looks for `<think>` tags, finds none, and just streams the text. The UI might show a "Thinking" badge but no thought process card appears. This is acceptable behavior (no crash).
- **Risk**: User enables "Vision" for a text-only model.
  - **Result**: User tries to attach image, model errors out. This is acceptable (user configuration error).

The manual override gives power to the user, accepting they might misconfigure it.
