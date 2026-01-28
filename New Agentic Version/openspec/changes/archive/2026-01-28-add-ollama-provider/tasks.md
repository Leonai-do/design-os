## 1. State Management & Utilities

- [x] 1.1 Create `src/store/settingsStore.ts` using Zustand.
- [x] 1.2 Define interfaces for `ProviderConfig` (url, key) and `ModelConfig` (name, params).
- [x] 1.3 Add actions to update configuration and persist to localStorage (via middleware).

## 2. Ollama Service Layer

- [x] 2.1 Create `src/services/ollama.ts` for API interactions.
- [x] 2.2 Implement `checkConnection(url)` to validate endpoint availability.
- [x] 2.3 Implement `fetchModels(url)` to get list from `/api/tags`.
- [x] 2.4 Implement `fetchModelDetails(url, modelName)` for `/api/show` (optional, for deep capability check).
- [x] 2.5 Implement `detectCapabilities(modelName, details)` logic (vision, tools, thinking, etc).

## 3. Settings UI Components

- [x] 3.1 Create `src/components/settings/CapabilityBadges.tsx` to visualize Vision, Tools, etc.
- [x] 3.2 Create `src/components/settings/ModelParameters.tsx` for temperature, logic, etc.
- [x] 3.3 Create `src/components/settings/ProviderConfigForm.tsx` connecting api-endpoint inputs to store.
- [x] 3.4 Create `src/components/settings/SettingsDialog.tsx` wrapping the forms in a modal (Radix UI or similar).

## 4. Integration

- [x] 4.1 Update `src/components/layout/Sidebar.tsx` (or equivalent) to add Settings Icon at bottom-left.
- [x] 4.2 Wire up the Settings Icon to open the `SettingsDialog`.
- [x] 4.3 Verify end-to-end flow: Open settings -> Enter localhost -> See models -> Select model -> See capabilities.
