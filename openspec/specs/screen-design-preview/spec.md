## ADDED Requirements

### Requirement: Interactive resizable previewer
The system SHALL provide an interactive previewer for screen designs that allows horizontal resizing via handles.

#### Scenario: Resize previewer
- **WHEN** user drags the resize handle of the preview container
- **THEN** the preview width updates in real-time and displays the current percentage

### Requirement: Device viewport presets
The system SHALL provide quick-action presets for Mobile, Tablet, and Desktop viewport widths.

#### Scenario: Select mobile preset
- **WHEN** user clicks the Mobile device icon
- **THEN** system sets the preview width to 30%

### Requirement: Fullscreen design mode
The system SHALL allow opening any screen design in a dedicated fullscreen view for detailed inspection or screenshot capture.

#### Scenario: Open fullscreen
- **WHEN** user clicks the "Fullscreen" button
- **THEN** system opens the screen design in a new tab without the IDE shell
