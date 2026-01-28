# Design: Extract Dynamic Intake

## Context

Design-OS requires an intelligent, conversational interface to gather user requirements for designs. The "Dynamic Intake" patterns from the `PRD-Genius` project provide a proven solution using client-side AI generation to drive a dynamic form wizard. This design outlines the strategy for extracting and integrating that logic.

## Goals / Non-Goals

**Goals:**

- Extract the `Dynamic Intake` engine (hooks, service, UI) from `PRD-Genius`.
- Integrate client-side Gemini AI interaction using `@google/genai`.
- Implement the `Refinement Studio` for real-time artifact collaboration.
- Establish a modular directory structure (`src/features/dynamic-intake`) for these new capabilities.
- **Transform Design-OS from a static viewer to a reactive editor** with a unified data store.

**Non-Goals:**

- Backend API proxy implementation (client-side only for this phase).
- Support for LLMs other than Gemini (matching source capabilities).

## Decisions

### 1. Client-Side AI Architecture

We will maintain the client-side architecture where the browser directly calls the Gemini API.

- **Rationale:** Lowers barrier to entry (no backend required) and simplifies the 1:1 port from the source codebase.
- **Alternatives:** Proxy server. Rejected to reduce extraction complexity.

### 2. State Management with Zustand

We will leverage `zustand` for managing the interview state (`PrdContext`, history).

- **Rationale:** The source codebase relies heavily on `zustand`. Keeping this minimizes refactoring risk during the port.
- **Alternatives:** React Context. Rejected to avoid rewriting complex state logic.

### 3. Feature-Based Directory Structure

We will group all extracted code into `src/features/dynamic-intake` and `src/features/refinement`.

- **Rationale:** Keeps the extracted code isolated, making it easier to manage and potentially replace or update later without polluting the global `src/components` namespace.

### 4. Unified Data Layer (Viewer -> Editor)

We must transition the application from a read-only static viewer to a reactive client-side editor.

- **Current Architecture:** Components read directly from `src/lib/*-loader.ts` which loads static Markdown/ZIP files.
- **New Architecture:**
  1.  **Store:** A global Zustand store will serve as the single source of truth.
  2.  **Hydration:** On load, the store hydrates from the static loaders (if data exists).
  3.  **Editing:** User interactions update the Store in memory.
  4.  **Export:** A "client-side export" feature generates a `product-plan.zip` from the Store state using `jszip`.

## Risks / Trade-offs

- **[Risk] Dependency Drift:** Source code might use libraries not present in `Design-OS` or different versions.
  - **Mitigation:** We will audit `package.json` during the implementation task to align versions of `zod`, `tailwind-merge`, and `react-markdown`.
- **[Risk] API Key Management:** Client-side calls require managing the API Key.
  - **Mitigation:** We will implement a local storage-backed "Settings" input for the user to provide their Gemini API key, ensuring it isn't hardcoded.

## Migration Plan

1.  **Dependencies:** Install `@google/genai`, `zod`, `react-markdown`.
2.  **Scaffolding:** Create feature directories.
3.  **Core Logic:** Port Types -> Service -> Store -> Hooks.
4.  **UI Implementation:** Port Components -> Integrate with Logic.
5.  **Integration:** Add routes to `App.tsx` to expose the new views.
