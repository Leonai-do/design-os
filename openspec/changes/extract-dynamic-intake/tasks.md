# Tasks: Extract Dynamic Intake

## 1. Setup & Dependencies

- [ ] 1.1 Install required dependencies (`@google/genai`, `zod`, `react-markdown`, `remark-gfm`, `clsx`, `tailwind-merge`, `file-saver`)
- [ ] 1.2 Create directory structure for feature modules (`src/features/dynamic-intake`, `src/features/refinement`)

## 2. Core Logic & Types

- [ ] 2.1 Port type definitions to `src/features/dynamic-intake/types.ts`
- [ ] 2.2 Implement `GeminiService` in `src/features/dynamic-intake/services/geminiService.ts`
- [ ] 2.3 **Infrastructure:** Initialize `src/store/index.ts` (Root Store) with `productSlice` (data) and `uiSlice` (persisted state).
- [ ] 2.4 **Refactor:** Update `ProductPage.tsx` and loaders to hydrate the Store, rather than components reading loaders directly.
- [ ] 2.5 Port discovery workflow logic to `src/features/dynamic-intake/workflows/discovery.ts`

## 3. Dynamic Intake Engine

- [ ] 3.1 Implement `useDynamicValidation` hook
- [ ] 3.2 Implement `useDynamicIntakeLogic` hook
- [ ] 3.3 Implement `ActiveStep` component (Schema Renderer)
- [ ] 3.4 Implement `DynamicIntake` container component

## 4. Refinement Studio

- [ ] 4.1 Implement `useRefinementLogic` hook
- [ ] 4.2 Implement `ChatInterface` component
- [ ] 4.3 Implement `DocPreview` component
- [ ] 4.4 Implement `RefinementView` container

## 5. Integration

- [ ] 5.1 Add new routes to `src/lib/router.tsx`
- [ ] 5.2 Update `src/components/EmptyState.tsx` to launch Dynamic Intake instead of showing CLI instructions.
- [ ] 5.3 Implement "Download Project" feature in `RefinementView` (using `jszip` to bundle artifacts).
- [ ] 5.4 Validate the full flow (Interview -> Generation -> Refinement -> Export)
