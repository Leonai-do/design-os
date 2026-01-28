## Why

The current `Design-OS` application lacks the sophisticated, agentic interview capabilities found in `PRD-Genius`. To enable a conversational, "on-the-fly" design process where the system dynamically asks relevant questions based on previous answers, we need to extract and integrate the Dynamic Intake engine from `PRD-Genius`. This extraction will allow `Design-OS` to interview users about their design needs, generating specs and designs more intelligently than static forms or simple prompts.

## What Changes

- Extract the core Dynamic Intake logic hooks (`useDynamicIntakeLogic`, `useDynamicGeneration`, `useDynamicValidation`) from `PRD-Genius`.
- Port the `PrdContext`, `DiscoveryStep`, and `DynamicField` type definitions to `Design-OS`.
- Extract the `GeminiService` and the prompt engineering logic (`DEFAULT_PROMPTS.discovery`) that generates the JSON schema for dynamic questions.
- Port the UI components responsible for rendering dynamic fields: `DynamicIntake`, `ActiveStep`, `DynamicField`, and `HistoryList`.
- Extract the `RefinementView` component and its logic hooks (`useRefinementLogic`) to provide a split-screen editor/chat interface for finalizing artifacts.
- Integrate these components into the `New Agentic Version` of `Design-OS` as a reusable module.

## Capabilities

### New Capabilities

- `dynamic-intake-engine`: A reusable system for conducting AI-driven interviews. It takes a context and a system prompt, and returns a dynamic UI flow that adapts to user answers in real-time.
- `refinement-studio`: A split-screen interface for viewing, editing, and chatting with markdown artifacts (Specs, Designs) in real-time.

### Modified Capabilities

- None. This is a net-new addition to `Design-OS`.

## Impact

- **New Dependencies:** Will require adding `@google/genai`, `react-markdown`, `remark-gfm`, and `zod` to `Design-OS/package.json`.
- **Store:** Will require updates to the `Design-OS` store (likely `zustand` based) to hold the interview context and history.
- **UI:** Introduces new complex UI patterns (chat-like history combined with form inputs).
- **Codebase:** Adds a significant new module `PRD-Genius-Extraction` (or similar) within `src/` to house the ported logic.
- **Architecture:** Fundamental shift from "Static Viewer" to "Client-Side Editor" requiring a unified data store and hydration strategy.

## Test Strategy

- **Unit Tests:** Verify `useDynamicIntakeLogic` correctly updates context and handles API responses.
- **Component Tests:** Ensure `DynamicField` renders correct inputs based on JSON schema types (text, select, multiselect).
- **Integration Tests:** meaningful end-to-end flow of an interview session using mocked Gemini responses to verify the "Ask -> Answer -> Next Question" loop.

## ADDED/MODIFIED/REMOVED

### Added

- `src/features/dynamic-intake/` (New module structure)
- `src/features/dynamic-intake/hooks/useDynamicIntakeLogic.ts`
- `src/features/dynamic-intake/components/DynamicIntake.tsx`
- `src/features/dynamic-intake/services/geminiService.ts`
- `src/features/refinement/`
- `src/features/refinement/components/RefinementView.tsx`

### Modified

- `package.json` (Adding dependencies)
- `src/store/index.ts` (Adding dynamic context slice)
