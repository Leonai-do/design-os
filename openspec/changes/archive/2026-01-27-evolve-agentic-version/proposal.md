## Why

The current "New Agentic Version" of Design OS provides a robust IDE-like shell and chat interface, but lacks the core functional depth of the legacy version—specifically section-level specifications, screen design previews, shell design, and the export system. This change will integrate these legacy features into the agentic workflow, transforming the app from a simulation into a production-ready AI product builder.

## What Changes

- **Sections & Section Management**: Implement the roadmap-driven section views (Spec, Data, Screen Designs, Screenshots) within the new IDE layout.
- **Screen & Shell Design Previews**: Port the resizable previewer with device presets (Mobile, Tablet, Desktop) and fullscreen modes.
- **Data-UI Synchronization**: Bind the AI-generated `ProductData` (Zustand store) to the migrated UI components so AI modifications reflect instantly in the dashboards.
- **Integrated Export System**: Implement the `/export-product` logic and UI to generate the final handoff package directly from the web interface.
- **Unified Navigation**: Update `AppLayout` and `PhaseNav` to seamlessly switch between the global Product/Design dashboards and the granular Section-level designs.

## Capabilities

### New Capabilities
- `sections-management`: Specification for managing roadmap sections, including spec generation, sample data modeling, and screen design organization.
- `screen-design-preview`: Specification for the interactive screen design previewer, supporting resizable viewports and theme synchronization.
- `shell-design-system`: Specification for designing and previewing the global application shell and navigation structure.
- `export-package-generation`: Specification for the end-to-end export workflow, creating a downloadable production-ready zip.

### Modified Capabilities
- `product-planning`: Extend the roadmap model to support granular section status tracking and deep-linking from the AI chat.

## Impact

- `src/lib/store.tsx`: Expanded to support section-level nested data and status persistence.
- `src/components/AppLayout.tsx`: Updated to handle the dual-mode (Dashboard vs. Section Design) UI.
- `src/pages/`: Addition of `SectionsPage`, `SectionPage`, `ScreenDesignPage`, `ShellDesignPage`, and `ExportPage`.
- `src/lib/ai.ts`: Updated prompts and intent detection to handle section-specific commands.

## Test Strategy

- **Store Integrity**: Verify that `useDesignStore` correctly persists and retrieves section-specific data after AI generation.
- **Reactive UI**: Confirm that the Sections dashboard updates in real-time when the AI adds or modifies a section spec.
- **Viewport Logic**: Test the resizing handles and device presets in the Screen Design preview to ensure correct aspect ratios.
- **Export Validation**: Verify that the generated export zip contains all expected files (specs, data.json, prompts) for a multi-section product.

## ADDED/MODIFIED/REMOVED

- **Modified**: `src/lib/store.tsx`
- **Modified**: `src/components/AppLayout.tsx`
- **Modified**: `src/lib/ai.ts`
- **Added**: `openspec/specs/sections-management/spec.md`
- **Added**: `openspec/specs/screen-design-preview/spec.md`
- **Added**: `openspec/specs/shell-design-system/spec.md`
- **Added**: `openspec/specs/export-package-generation/spec.md`
- **Added**: `src/pages/SectionsPage.tsx`
- **Added**: `src/pages/SectionPage.tsx`
- **Added**: `src/pages/ScreenDesignPage.tsx`
- **Added**: `src/pages/ShellDesignPage.tsx`
- **Added**: `src/pages/ExportPage.tsx`
