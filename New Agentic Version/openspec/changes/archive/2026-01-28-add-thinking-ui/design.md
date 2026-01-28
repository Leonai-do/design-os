## Context

The current chat interface renders messages as raw strings. With the introduction of "Thinking" models (like Qwen-2.5-Thinking), messages often contain verbose chain-of-thought data enclosed in `<think>` tags. We need to display this data without cluttering the main response, while also providing better visibility into which model is active and what it can do.

## Goals / Non-Goals

**Goals:**

- **Parse Capabilities**: Robustly detect and separate `<think>` blocks from standard message content, even during active streaming (unclosed tags).
- **UI Enhancements**:
  - Add a collapsible "Thinking Process" section within the chat bubble.
  - Add a "Model Identity" header showing the active model name.
  - Add "Capability Badges" (Vision, Tools, Thinking) to the header.
- **Backwards Compatibility**: Ensure existing messages (without thinking tags) render exactly as they do now.

**Non-Goals:**

- **Backend Storage Changes**: We will NOT modify the database schema or `ChatMessage` type definition to store thoughts separately. Parsing happens at render time.
- **Deep Model Switching**: This change is purely UI; it does not change how models are selected or configured, only how they are displayed.

## Decisions

### 1. Render-Time Parsing

We will parse the message content into segments at render time using a custom hook or utility function (`useMessageParser`).

- **Rationale**: Keeps the data layer simple. The raw message string remains the source of truth. It avoids complex migrations for existing message history.
- **Approach**: A regex-based splitter that identifies `<think>...</think>` (and `<think>...` for streaming) and produces an array of segments: `[{ type: 'think', content: string }, { type: 'text', content: string }]`.

### 2. Collapsible UI State

The thinking section will be collapsible.

- **Default State**:
  - During streaming: **Expanded** (auto-scrolls with thought generation).
  - After completion: **Collapsed** (user must click to review thoughts).
- **Rationale**: Users want to see the thinking happen live (it builds trust/patience), but once the answer is ready, the thought process is secondary noise.

### 3. Header Integration

We will modify the `ChatInterface` header to display the model information.

- **Data Source**: We will read the `selectedModel` directly from `settingsStore`.
- **Capabilities**: We will infer capabilities from the provider configurations or metadata (e.g., if the model ID contains "vision" or "qwen", or if the `provider.type` implies specific features).

## Risks / Trade-offs

**Risk: Streaming Jitter**
Parsing incomplete HTML/XML-like tags during streaming can be flaky.

- **Mitigation**: The parser must explicitly handle the case where `<think>` is present but `</think>` is missing (implies "currently thinking").

**Risk: Model Metadata Availability**
We might not have rich metadata for every local model (e.g., capability lists).

- **Mitigation**: Use heuristics (regex on model name) as a fallback for capability badges if explicit metadata is missing from the provider.
