# thinking-display Specification

## Purpose
TBD - created by archiving change add-thinking-ui. Update Purpose after archive.
## Requirements
### Requirement: Render Thinking Blocks

The system SHALL detect `<think>` tags in chat messages and render the enclosed content in a dedicated, collapsible UI component, separate from the primary message content.

#### Scenario: Display finished thought

- **WHEN** a message containing `<think>Analysis...</think>The answer is 42` is rendered
- **THEN** the "Analysis..." text is hidden behind a "Thinking Process" toggle
- **AND** "The answer is 42" is displayed as the main message
- **AND** clicking the toggle reveals "Analysis..."

#### Scenario: Default collapsed state for finished thoughts

- **WHEN** a historical message with thinking content is loaded
- **THEN** the thinking section is collapsed by default

### Requirement: Handle Streaming Thoughts

The system SHALL recognize open `<think>` tags during message streaming and render the content as it arrives, automatically expanding the thinking section.

#### Scenario: Streaming active thought

- **WHEN** a message stream contains `<think>Processing data...` (without closing tag)
- **THEN** the Thinking UI component is displayed
- **AND** it is automatically expanded
- **AND** "Processing data..." is visible and updates in real-time

#### Scenario: Auto-collapse on completion

- **WHEN** the stream receives the closing `</think>` tag
- **THEN** the Thinking UI component remains visible
- **BUT** it transitions to a state where it can be collapsed (autocollapse logic optional, but manual collapse must be enabled)

