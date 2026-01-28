## Why

Models with "Thinking" capabilities (like DeepSeek via LM Studio) are often not correctly detected by the provider configuration because the metadata might not be exposed or standard. This prevents the UI from properly rendering the streaming thought process (using the `<ThinkingDisclosure>` component) and instead treats the thought stream as part of the raw message or renders it incorrectly. Users need a reliable way to manually "force-enable" these capabilities for specific models to ensure the best experience.

## What Changes

We will introduce a manual override system for AI model capabilities in the application settings.

1.  **UI Updates**: The `AI Provider Settings` modal will be updated to include toggle controls for specific capabilities (Thinking, Vision, Tools) for the currently selected model.
2.  **Persistence**: These settings will be persisted locally, keyed by the model ID, so the configuration is remembered across sessions.
3.  **Consumption**: The `StreamingFilter` and other provider logic will consume these overrides. If "Thinking" is manually enabled, the provider will be forced to check for and parse `<think>` tags, even if the model metadata doesn't explicitly advertise the capability.

## Capabilities

### New Capabilities

- `model-capability-overrides`: Manages the storage, retrieval, and UI controls for manual model capability overrides.

### Modified Capabilities

- `conversational-interface`: Update streaming logic to respect overrides for thought parsing.

## Impact

- **Components**: `AIProviderSettings` (new toggles), `ModelHeader` (reflects enabled capabilities).
- **Store**: `useSettingsStore` (new slice or field for `modelOverrides`).
- **Logic**: `StreamingFilter` and provider factories (must read from settings).

## Test Strategy

1.  **Manual Verification**:
    - Select a model (e.g., LM Studio/DeepSeek) that is physically capable of thinking but not auto-detected.
    - Go to Settings -> AI Provider.
    - Enable "Thinking" toggle.
    - Close Settings.
    - Send a prompt.
    - Verify that `<think>` tags are parsed and a Thinking card appears in chat.
2.  **Persistence**:
    - Reload the page.
    - Verify the toggle remains enabled for that model.
    - Switch to a different model.
    - Verify the toggle defaults to the new model's state (or its own override).

## ADDED/MODIFIED/REMOVED

### MODIFIED

- `src/store/settings.ts`: Add `modelOverrides` to state.
- `src/components/settings/AIProviderSettings.tsx`: Add toggle UI.
- `src/components/chat/ModelHeader.tsx`: Update to show forced capabilities.
- `src/lib/ai/providers/utils.ts` or `client.ts`: logic to checking capabilities.
