# Specification: Refinement Studio

## ADDED Requirements

### Requirement: Split-Screen Interface

The system MUST provide a comprehensive workspace showing the artifact preview/editor and a chat interface simultaneously.

#### Scenario: Dual View Visualization

WHEN the refinement studio is active
THEN the left pane displays the rendered markdown artifact (or raw editor)
AND the right pane displays the context-aware chat interface

### Requirement: AI-Driven Refinement

The system MUST allow users to modify the artifact via natural language chat commands. The AI must have access to the current document state to make intelligent edits.

#### Scenario: Refine Section via Chat

WHEN the user requests a change to a specific section via the chat interface
THEN the system sends the request along with the current document content to the AI
AND the AI generates a modified version of the document
AND the system updates the artifact content with the new version

### Requirement: Direct Editing and Preview

The system MUST allow users to toggle between viewing the rendered markdown and directly editing the raw source code.

#### Scenario: Toggle Edit Mode

WHEN the user toggles to "Edit Mode"
THEN the preview pane switches to a markdown editor containing the raw text
AND changes made in the editor are reflected in the preview when switched back

#### Scenario: Toggle Preview Mode

WHEN the user toggles to "Preview Mode"
THEN the editor pane switches to a rendered HTML/Markdown view of the content
