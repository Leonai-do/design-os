## 1. Core Logic & Parsing

- [x] 1.1 Create `src/lib/utils/messageParser.ts` with logic to parse `<think>` tags into content segments.
- [x] 1.2 Implement unit tests (or manual verification script) for the parser to handle streaming (unclosed tags) and complete tags.

## 2. UI Components

- [x] 2.1 Create `src/components/chat/ThinkingDisclosure.tsx` component (collapsible, styled for "thinking" process, supports streaming).
- [x] 2.2 Create `src/components/chat/ModelHeader.tsx` to display model name and capability badges.

## 3. Integration

- [x] 3.1 Refactor message rendering in `ChatInterface.tsx` (or `ChatMessage.tsx` if it exists) to use `messageParser`.
- [x] 3.2 Integrate `ThinkingDisclosure` into the message render loop.
- [x] 3.3 Add `ModelHeader` to the top of `ChatInterface`.
- [x] 3.4 Connect `ModelHeader` to `useDesignStore` (settings) to get the active model and capabilities.

## 4. Verification

- [x] 4.1 Verify "Thinking" section expands during streaming and collapses after completion.
- [x] 4.2 Verify Model Header displays correct name and badges (Vision/Thinking) based on provider state.
