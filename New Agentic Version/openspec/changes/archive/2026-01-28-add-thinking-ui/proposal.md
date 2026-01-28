## Why

As users increasingly rely on "reasoning" models (like Qwen-2.5-Thinking or DeepSeek-R1) via local providers like LM Studio, the raw output often contains verbose `<think>` blocks. Currently, these are either hidden or clutter the response. This change aims to elevate the user experience by treating the "thought process" as a first-class UI element—collapsible, streaming, and distinct from the final answer—while also improving visibility of the active model and its capabilities.

## What Changes

- **Thinking UI Component**: A new UI element within chat bubbles to parse and render content between `<think>` tags.
  - Collapsible by default (or user preference).
  - Supports streaming updates (thinking appearing in real-time).
  - distinct visual style (e.g., different background, monospaced font).
- **Model Identity Header**: A persistent header or overlay in the chat interface displaying the currently selected model.
- **Capability Badges**: Visual indicators (icons/tags) next to the model name showing active capabilities (e.g., "Vision", "Thinking", "Tools").
- **Message Parsing**: Enhanced frontend parsing to separate "thoughts" from "content" in incoming streamed or complete messages.

## Capabilities

### New Capabilities

- `thinking-display`: Managing the parsing, state, and rendering of chain-of-thought data in the chat stream.
- `model-status-ui`: Display components for active model identity and capability indicators.

### Modified Capabilities

<!-- No existing high-level specs define the chat message structure strictly enough to require a delta spec, but we are enhancing the 'chat-interface' implicitly. Since we don't have a formal 'chat-interface' spec yet, we will treat these as new capabilities for the purpose of this change to be explicit. -->

## Impact

- **Components**:
  - `src/components/ChatInterface.tsx`: Update header area.
  - `src/components/ChatMessage.tsx` (or equivalent message renderer): Needs logic to split `<think>` content.
  - `src/lib/types.ts`: May need to update message types if we decide to store thoughts structurally (though parsing at render time is likely sufficient).
- **Stores**:
  - `useDesignStore` or `settingsStore`: Ensure specific model capabilities are accessible to the chat component.
