## 1. AI Command Precision

- [x] 1.1 Add `/section-spec [id]` command to `useChatController.ts` to generate/update specific specs.
- [x] 1.2 Add `/section-data [id]` command to generate sample JSON data for a target section.
- [x] 1.3 Add `/section-ui [id] [description]` to trigger the React component generator for a section.
- [x] 1.4 Update intent detection to prioritize the `activeContext` section ID when no ID is provided in the command.

## 2. Legacy Export Refinement

- [x] 2.1 Update `src/lib/export.ts` to generate the `prompts/one-shot-prompt.md` using store data.
- [x] 2.2 Implement generation of the `instructions/incremental/` milestone files (Foundation, Shell, Sections).
- [x] 2.3 Add `product-overview.md` generation to the export root for implementation context.
- [x] 2.4 Bundle the `tests.md` templates for each section in the export package.

## 3. Screenshot Capture System

- [x] 3.1 Create `src/lib/screenshot.ts` utility using `html-to-image` or a browser-native capture bridge.
- [x] 3.2 Add a "Capture Screenshot" button to the `ScreenDesignPage.tsx` toolbar.
- [x] 3.3 Implement the `/screenshot-design` command in the chat to trigger the capture of the currently viewed design.
- [x] 3.4 Wire the captured screenshot (Base64) back into the `useDesignStore` for the specific section.

## 4. Final Integration & Polish

- [x] 4.1 Update `EmptyState.tsx` to handle the new section-level empty states (Missing Spec vs. Missing Data).
- [x] 4.2 Ensure the "Code Editor" properly saves changes back to `customFiles` in the store for persistence.
- [x] 4.3 Verify that the Export checklist in `ExportPage.tsx` correctly tracks "Prompts" and "Instructions" readiness.
