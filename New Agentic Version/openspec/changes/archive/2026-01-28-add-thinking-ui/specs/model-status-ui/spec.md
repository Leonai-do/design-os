## ADDED Requirements

### Requirement: Model Identity Header

The system SHALL display the currently selected model's name in a persistent header or overlay within the chat interface.

#### Scenario: Display active model

- **WHEN** the chat interface is open
- **THEN** the name of the currently selected model (e.g., "qwen3-vl-8b-thinking") is visible at the top of the view

### Requirement: Capability Badges

The system SHALL display visual badges indicating the key capabilities of the active model alongside its name.

#### Scenario: Vision Capability

- **WHEN** the selected model has "vision" (vlm) capability
- **THEN** a "Vision" badge or icon is displayed

#### Scenario: Thinking Capability

- **WHEN** the selected model has "thinking" capability (e.g., deepseek, qwen-thinking)
- **THEN** a "Thinking" badge or icon is displayed
