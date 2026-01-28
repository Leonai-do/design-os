export const EXPORT_PRODUCT_PROMPT = `# Export Product

You are helping the user export their complete product design as a handoff package for implementation. This generates all files needed to build the product in a real codebase.

## Step 1: Check Prerequisites

Verify the minimum requirements exist:

**Required:**
- \`/product/product-overview.md\` — Product overview
- \`/product/product-roadmap.md\` — Sections defined
- At least one section with screen designs in \`src/sections/[section-id]/\`

**Recommended (show warning if missing):**
- \`/product/data-model/data-model.md\` — Global data model
- \`/product/design-system/colors.json\` — Color tokens
- \`/product/design-system/typography.json\` — Typography tokens
- \`src/shell/components/AppShell.tsx\` — Application shell

If required files are missing:

"To export your product, you need at minimum:
- A product overview (\`/product-vision\`)
- A roadmap with sections (\`/product-roadmap\`)
- At least one section with screen designs

Please complete these first."

Stop here if required files are missing.

If recommended files are missing, show warnings but continue:

"Note: Some recommended items are missing:
- [ ] Data model — Run \`/data-model\` for consistent entity definitions
- [ ] Design tokens — Run \`/design-tokens\` for consistent styling
- [ ] Application shell — Run \`/design-shell\` for navigation structure

You can proceed without these, but they help ensure a complete handoff."

## Step 2: Gather Export Information

Read all relevant files:

1. \`/product/product-overview.md\` — Product name, description, features
2. \`/product/product-roadmap.md\` — List of sections in order
3. \`/product/data-model/data-model.md\` (if exists)
4. \`/product/design-system/colors.json\` (if exists)
5. \`/product/design-system/typography.json\` (if exists)
6. \`/product/shell/spec.md\` (if exists)
7. For each section: \`spec.md\`, \`data.json\`, \`types.ts\`
8. List screen design components in \`src/sections/\` and \`src/shell/\`

## Step 3: Create Export Directory Structure

Create the \`product-plan/\` directory with this structure:

\`\`\`
product-plan/
├── README.md                    # Quick start guide
├── product-overview.md          # Product summary (always provide)
│
├── prompts/                     # Ready-to-use prompts for coding agents
│   ├── one-shot-prompt.md       # Prompt for full implementation
│   └── section-prompt.md        # Prompt template for section-by-section
│
├── instructions/                # Implementation instructions
│   ├── one-shot-instructions.md # All milestones combined
│   └── incremental/             # For milestone-by-milestone implementation
│       ├── 01-foundation.md
│       ├── 02-[first-section].md
│       ├── 03-[second-section].md
│       └── ...
│
├── design-system/               # Design tokens
│   ├── tokens.css
│   ├── tailwind-colors.md
│   └── fonts.md
│
├── data-model/                  # Data model
│   ├── README.md
│   ├── types.ts
│   └── sample-data.json
│
├── shell/                       # Shell components
│   ├── README.md
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── MainNav.tsx
│   │   ├── UserMenu.tsx
│   │   └── index.ts
│   └── screenshot.png (if exists)
│
└── sections/                    # Section components
    └── [section-id]/
        ├── README.md
        ├── tests.md               # Test-writing instructions for TDD
        ├── components/
        │   ├── [Component].tsx
        │   └── index.ts
        ├── types.ts
        ├── sample-data.json
        └── screenshot.png (if exists)
\`\`\`

## Step 4: Generate Product Overview

Create \`product-plan/product-overview.md\` summarizing the product with:
- Product description
- Planned sections (ordered list)
- Data model entities (if defined)
- Design system colors and typography
- Implementation sequence as milestones

## Step 5: Generate Milestone Instructions

### 01-foundation.md

Create foundation instructions covering:
- Design tokens configuration
- Data model types
- Routing structure
- Application shell components
- Wire-up instructions for navigation

### [NN]-[section-id].md (for each section)

Create section-specific instructions with:
- Goal and overview
- Key functionality bullets
- TDD approach guidance (reference tests.md)
- Components to copy
- Data layer requirements
- Callback props to wire up
- Empty state implementation
- Expected user flows
- Done when checklist

### one-shot-instructions.md

Combine all milestones into a single document with:
- Preamble explaining what the implementer receives vs builds
- TDD guidance
- All milestone content combined
- Section-by-section instructions

## Step 6: Copy and Transform Components

### Shell Components

Copy from \`src/shell/components/\` to \`product-plan/shell/components/\`:
- Transform import paths from \`@/...\` to relative paths
- Remove Design OS-specific imports
- Ensure components are self-contained

### Section Components

For each section, copy from \`src/sections/[section-id]/components/\` to \`product-plan/sections/[section-id]/components/\`:
- Transform import paths: \`@/../product/sections/[section-id]/types\` → \`../types\`
- Remove Design OS-specific imports
- Keep only exportable components (not preview wrappers)

### Supporting Files

Copy and transform:
- \`types.ts\` → \`product-plan/sections/[section-id]/types.ts\`
- \`data.json\` → \`product-plan/sections/[section-id]/sample-data.json\`
- Screenshots if they exist

## Step 7: Generate Supporting Documentation

For each section, create:
- \`README.md\` — Feature overview, design decisions, callbacks reference
- \`tests.md\` — Framework-agnostic test instructions for TDD

For the design system, create:
- \`tokens.css\` — CSS custom properties
- \`tailwind-colors.md\` — Tailwind configuration guide
- \`fonts.md\` — Google Fonts setup instructions

For the data model:
- \`README.md\` — Entity descriptions and relationships
- \`types.ts\` — TypeScript interfaces
- \`sample-data.json\` — Test data

## Step 8: Generate Prompt Files

### one-shot-prompt.md

Create ready-to-use prompt for full implementation with:
- Instructions to read product-overview.md and one-shot-instructions.md
- List of clarifying questions about auth, user modeling, tech stack, backend logic
- Guidance to create implementation plan before coding

### section-prompt.md

Create template prompt for section-by-section implementation with:
- Variable placeholders (SECTION_NAME, SECTION_ID, NN)
- Instructions to read section-specific files
- Clarifying questions for that section
- TDD approach guidance

## Step 9: Generate README.md

Create \`product-plan/README.md\` with:
- What's included (prompts, instructions, design assets)
- How to use (Option A: Incremental, Option B: One-Shot)
- Test-driven development guidance
- Tips for implementation

## Step 10: Copy Screenshots

Copy any \`.png\` files from:
- \`product/shell/\` → \`product-plan/shell/\`
- \`product/sections/[section-id]/\` → \`product-plan/sections/[section-id]/\`

## Step 11: Create Zip File

Create a zip archive of the product-plan folder:

\`\`\`bash
rm -f product-plan.zip
cd . && zip -r product-plan.zip product-plan/
\`\`\`

This creates \`product-plan.zip\` for download.

## Step 12: Confirm Completion

Let the user know:

"I've created the complete export package at \`product-plan/\` and \`product-plan.zip\`.

**What's Included:**

**Ready-to-Use Prompts:**
- \`prompts/one-shot-prompt.md\` — Prompt for full implementation
- \`prompts/section-prompt.md\` — Prompt template for section-by-section

**Instructions:**
- \`product-overview.md\` — Product summary (always provide with instructions)
- \`instructions/one-shot-instructions.md\` — All milestones combined
- \`instructions/incremental/\` — [N] milestone instructions (foundation, then sections)

**Design Assets:**
- \`design-system/\` — Colors, fonts, tokens
- \`data-model/\` — Entity types and sample data
- \`shell/\` — Application shell components
- \`sections/\` — [N] section component packages with test instructions

**Download:**

Restart your dev server and visit the Export page to download \`product-plan.zip\`.

**How to Use:**

1. Copy \`product-plan/\` to your implementation codebase
2. Open \`prompts/one-shot-prompt.md\` or \`prompts/section-prompt.md\`
3. Add any additional notes, then copy/paste into your coding agent
4. Answer the agent's clarifying questions about auth, data modeling, etc.
5. Let the agent implement based on the instructions

The components are props-based and portable — they accept data and callbacks, letting your implementation agent handle routing, data fetching, and state management however fits your stack."

## Important Notes

- Always transform import paths when copying components
- Include \`product-overview.md\` context with every implementation session
- Use the pre-written prompts — they prompt for important clarifying questions
- Screenshots provide visual reference for fidelity checking
- Sample data files are for testing before real APIs are built
- The export is self-contained — no dependencies on Design OS
- Components are portable — they work with any React setup
- Include test-writing instructions (tests.md) for TDD approach
`;