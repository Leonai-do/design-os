## Context

The "New Agentic Version" currently operates as a simulated IDE with a Chat Interface and File Explorer, but its internal dashboard logic is simplified compared to the legacy version. The legacy version has mature components for managing roadmap sections, interactive design previews, and export workflows, but relies on a static file-based loader system that is incompatible with the real-time AI generation requirements of the agentic version.

## Goals / Non-Goals

**Goals:**
- Port the full functional depth of legacy Sections, Design Previews, and Export pages.
- Transition from file-based data loading to the reactive `useDesignStore`.
- maintain the IDE-like shell (Sidebar + Chat) throughout all application phases.
- Enable real-time UI updates when the AI modifies section specifications or sample data.

**Non-Goals:**
- Modifying the core AI intent detection or prompt engineering (already implemented in `src/lib/ai.ts`).
- Altering the "Refined Utility" styling system.
- Implementing a real backend (staying within the browser-based, local-first architecture).

## Decisions

### 1. Unified Reactive State Model
We will migrate the legacy pages to use `useDesignStore` instead of `loadProductData()` and `loadSectionData()`. 
**Rationale:** The legacy loaders read from a static file system which doesn't exist in the browser runtime. The Zustand store serves as the "Source of Truth" that the AI writes to and the UI reads from.
**Alternatives:** Maintaining a hybrid approach was considered but rejected due to the complexity of keeping a virtual file system in sync with static files.

### 2. Context-Aware Layout (AppLayout)
The `AppLayout` component will be updated to handle three distinct layout modes:
- **Dashboard Mode**: Centered, max-width content (used for Product Overview, Roadmap).
- **IDE Mode**: Split-pane view with File Explorer sidebar and Main Content (used for Data Model, Design Tokens).
- **Preview Mode**: Full-height, resizable viewport for Screen and Shell designs.
**Rationale:** This preserves the "Single Interface" vision while providing the appropriate focus for different tasks.

### 3. Iframe-Based Design Isolation
All Screen and Shell design previews will be rendered within an Iframe.
**Rationale:** This prevents CSS leaking from the screen designs into the IDE shell and ensures that theme synchronization (Light/Dark mode) can be tested in an isolated environment.
**Alternatives:** Shadow DOM was considered but Iframes provide better isolation for complete page designs and better support for the "Fullscreen" requirement.

### 4. Client-Side Export Generation
The `/export-product` command will trigger a client-side serialization of the `useDesignStore` state into a structured blob.
**Rationale:** Since there is no backend, we will use a library like `JSZip` to bundle the generated Markdown files, JSON models, and prompts into a downloadable archive directly in the browser.

## Risks / Trade-offs

- [Risk] Large product stores may cause performance lag in the Zustand store → [Mitigation] Implement memoized selectors and potentially split the store into slices (overview, roadmap, sections).
- [Risk] Complex React components in screen designs might fail to load dynamically → [Mitigation] Use `React.lazy` with robust error boundaries and fallback UI.
- [Risk] LocalStorage size limits (usually 5MB) → [Mitigation] Monitor store size; if it grows too large, suggest moving to IndexedDB.
