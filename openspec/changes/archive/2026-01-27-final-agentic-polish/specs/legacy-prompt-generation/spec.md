## ADDED Requirements

### Requirement: Implementation Prompt Generation
The system SHALL automatically generate implementation prompts (`one-shot-prompt.md` and `section-prompt.md`) based on the current product state during the export process.

#### Scenario: One-shot prompt generation
- **WHEN** user triggers an export
- **THEN** system generates a prompt that includes the full product vision, data model, and design tokens for a single implementation session.

### Requirement: Incremental Instruction Set
The system SHALL generate a structured set of milestone-based instructions for step-by-step implementation.

#### Scenario: Incremental guide generation
- **WHEN** user triggers an export
- **THEN** system creates the `instructions/incremental/` directory structure containing Foundation, Shell, and individual Section guides.

### Requirement: Test-Driven Development (TDD) Specs
The system SHALL include framework-agnostic test specifications for each section in the export package.

#### Scenario: Include test specs
- **WHEN** user triggers an export
- **THEN** system generates a `tests.md` file for each section outlining core user flows and edge cases to be tested.
