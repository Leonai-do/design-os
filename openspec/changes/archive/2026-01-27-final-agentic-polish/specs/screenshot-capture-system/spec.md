## ADDED Requirements

### Requirement: Programmatic Screen Capture
The system SHALL provide a mechanism to capture a high-resolution screenshot (PNG/JPEG) of the currently rendered design in the preview iframe.

#### Scenario: Manual capture via toolbar
- **WHEN** user clicks the "Capture Screenshot" button in the Screen Design preview toolbar
- **THEN** system captures the iframe contents and downloads the image as a file.

### Requirement: Agent-Driven Screenshot Management
The system SHALL allow the AI to trigger a screenshot capture via a `/screenshot-design` command.

#### Scenario: AI triggers screenshot
- **WHEN** user or AI runs `/screenshot-design`
- **THEN** system captures the current design and automatically associates the resulting image with the active section's screenshot gallery in the store.
