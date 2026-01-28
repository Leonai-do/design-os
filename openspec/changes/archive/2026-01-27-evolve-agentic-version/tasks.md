## 1. Store & AI Integration

- [x] 1.1 Update `ProductData` type in `src/types.ts` to include full section specs and screenshots
- [x] 1.2 Expand `useDesignStore` in `src/lib/store.tsx` with section-specific actions (setSectionSpec, addSampleData, addScreenDesign)
- [x] 1.3 Update `src/lib/ai.ts` to detect section-level intents (e.g., `/section-spec`, `/section-data`) and update the store accordingly
- [x] 1.4 Enhance `src/lib/generators.ts` to generate `spec.md` and `data.json` content for individual sections from the store

## 2. Layout & Navigation Migration

- [x] 2.1 Refactor `src/components/AppLayout.tsx` to support `IDE` and `Preview` layout modes based on active route
- [x] 2.2 Update `src/components/PhaseNav.tsx` to handle deep-linking into sections and designs
- [x] 2.3 Port `PhaseWarningBanner` and `NextPhaseButton` to the agentic version for workflow guidance

## 3. Section & Design Pages

- [x] 3.1 Implement `SectionsPage.tsx` using store data to show roadmap progress
- [x] 3.2 Implement `SectionPage.tsx` with step-by-step indicators for Spec, Data, and Designs
- [x] 3.3 Create `ScreenDesignPage.tsx` with the resizable iframe previewer and device presets
- [x] 3.4 Implement `ShellDesignPage.tsx` for global application shell previewing

## 4. Export System

- [x] 4.1 Implement `ExportPage.tsx` with the readiness checklist linked to store state
- [x] 4.2 Create client-side export logic using `JSZip` to bundle the product plan
- [x] 4.3 Add `/export-product` command handling in `ChatInterface.tsx` to trigger the download

## 5. Polish & Verification

- [x] 5.1 Add theme synchronization logic to the preview iframes
- [x] 5.2 Implement error boundaries and loading states for dynamic screen design loading
- [x] 5.3 Verify the end-to-end "Idea to Export" flow manually in the browser
