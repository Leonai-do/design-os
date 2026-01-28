## ADDED Requirements

### Requirement: Product export status checklist
The system SHALL provide a checklist showing the completion status of all product phases before allowing export.

#### Scenario: Check export readiness
- **WHEN** user navigates to the Export page
- **THEN** system displays the completion status of Overview, Roadmap, Data Model, Design System, Shell, and Sections

### Requirement: Handoff package generation
The system SHALL generate a downloadable zip package containing all specs, data models, and implementation prompts.

#### Scenario: Generate export
- **WHEN** user runs the `/export-product` command and all required phases are complete
- **THEN** system generates a "product-plan.zip" file available for download
