## Why
The "New Agentic Version" has achieved UI parity, but lacks the high-precision AI commands and the comprehensive handoff package (prompts/instructions) that made the legacy version essential for developers. This change adds the final layer of programmatic screenshot capture, explicit section commands, and the full legacy-style export suite.

## What Changes
- **Explicit Section Commands**: Add `/section-spec`, `/section-data`, and `/section-ui` for targeted AI generation.
- **Enhanced Export Suite**: Update the export logic to generate the full `prompts/` and `instructions/` folders (One-Shot vs. Incremental) instead of just the code.
- **Screenshot Bridge**: Implement a programmatic capture mechanism for Screen Designs to populate the `screenshots/` directory.
- **Refined AI Context**: Ensure the AI "remembers" the active section when navigating via the GUI.

## Capabilities

### New Capabilities
- `explicit-section-commands`: Targeted generation of section-specific artifacts via slash commands.
- `screenshot-capture-system`: Programmatic generation of design screenshots for documentation.
- `legacy-prompt-generation`: Automatic creation of the `prompts/` and `instructions/` implementation guides in the export zip.

## Impact
- `src/lib/export.ts`: Major expansion to include prompt templates.
- `src/hooks/useChatController.ts`: Addition of explicit slash command handlers.
- `src/lib/ai/index.ts`: Updated logic for targeted generation.
- `src/pages/ScreenDesignPage.tsx`: Integration of the screenshot capture bridge.

## Test Strategy
- **Export Integrity**: Verify the ZIP contains `prompts/one-shot-prompt.md` and `instructions/incremental/`.
- **Command Precision**: Ensure `/section-data` only updates the sample data of the *active* section.
- **Screenshot Logic**: Verify that "Capture" triggers the download of the isolated design viewport.

## ADDED/MODIFIED/REMOVED
- **Modified**: `src/lib/export.ts`
- **Modified**: `src/hooks/useChatController.ts`
- **Modified**: `src/lib/ai/index.ts`
- **Added**: `src/lib/screenshot.ts`
