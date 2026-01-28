## ADDED Requirements

### Requirement: Resize uses direct DOM manipulation

The chat window SHALL use direct DOM manipulation via refs during resize operations to bypass React's render cycle, providing immediate visual feedback without triggering component re-renders on every mouse movement.

#### Scenario: Dragging resize handle

- **WHEN** the user initiates a resize by clicking and dragging the resize handle
- **THEN** the window dimensions SHALL update directly via DOM style manipulation
- **AND** React state SHALL NOT update until the mouse button is released

#### Scenario: Resize completes

- **WHEN** the user releases the mouse button after resizing
- **THEN** the final dimensions SHALL be synchronized to React state
- **AND** subsequent renders SHALL use the new dimensions

### Requirement: Transitions disabled during resize

CSS transitions SHALL be dynamically disabled during resize operations and only re-enabled for minimize/maximize animations, preventing transition interference with real-time dimension updates.

#### Scenario: During active resize

- **WHEN** the user is actively dragging the resize handle
- **THEN** the `transition-all` class SHALL be removed from the chat window
- **AND** dimension updates SHALL be instantaneous without animation

#### Scenario: Minimize with transition

- **WHEN** the user clicks the minimize button
- **THEN** the `transition-all` class SHALL be present
- **AND** the window SHALL animate smoothly to the minimized state

#### Scenario: Maximize with transition

- **WHEN** the user restores from minimized state
- **THEN** the `transition-all` class SHALL be present
- **AND** the window SHALL animate smoothly to the previous or default dimensions

### Requirement: State persistence after resize

The chat window SHALL preserve resize dimensions across minimize and maximize operations, ensuring the window restores to the user-defined size rather than reverting to defaults.

#### Scenario: Resize then minimize

- **WHEN** the user resizes the window to custom dimensions
- **AND** the user minimizes the window
- **THEN** the custom dimensions SHALL be preserved in state

#### Scenario: Restore after resize

- **WHEN** the user restores the window after a resize and minimize sequence
- **THEN** the window SHALL restore to the custom resized dimensions
- **AND** NOT revert to default dimensions (600x800)

### Requirement: Resize constraints

The resize operation SHALL enforce minimum and maximum dimension constraints to prevent the window from becoming unusable or exceeding screen bounds.

#### Scenario: Minimum size constraint

- **WHEN** the user attempts to resize below 350px width or 400px height
- **THEN** the window SHALL stop at the minimum dimensions

#### Scenario: Maximum size constraint

- **WHEN** the user attempts to resize beyond 90% of screen dimensions
- **THEN** the window SHALL stop at the maximum allowed dimensions
- **AND** maintain 16px margins from screen edges
