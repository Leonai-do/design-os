
import type { ProductData, SectionDetail } from "../types";

// Helper to indent text
const indent = (str: string, spaces = 2) => 
  str.split('\n').map(line => ' '.repeat(spaces) + line).join('\n');

export const generateFileContent = (path: string, data: ProductData): string => {
  // Normalize lookup path
  const cleanPath = path.replace(/^\/+/, '');

  // 1. Check custom files first (with normalized comparison)
  const customFile = data.customFiles?.find(f => f.path.replace(/^\/+/, '') === cleanPath);
  if (customFile) return customFile.content;

  // 2. Parse section paths
  if (path.startsWith('product/sections/')) {
    const parts = path.split('/');
    if (parts.length >= 4) {
      const sectionId = parts[2];
      const filename = parts[3];
      const section = data.sections[sectionId];

      if (section) {
        if (filename === 'spec.md' && section.spec) {
          return `# ${section.spec.title} Specification

## Overview
${section.spec.description}

## User Flows
${section.spec.userFlows.map(f => `- ${f}`).join('\n')}

## UI Requirements
${section.spec.uiRequirements.map(r => `- ${r}`).join('\n')}

## Configuration
- shell: ${section.spec.useShell ?? true}
`;
        }
        if (filename === 'data.json' && section.sampleData) {
          try {
            // Re-format JSON for display
            return JSON.stringify(JSON.parse(section.sampleData), null, 2);
          } catch {
            return section.sampleData;
          }
        }
      }
    }
  }

  // 3. Parse src/sections component paths
  if (path.startsWith('src/sections/')) {
    const parts = path.split('/');
    if (parts.length >= 4) {
      const sectionId = parts[2];
      const filename = parts[3];
      const section = data.sections[sectionId];
      
      if (section) {
        // Try to find matching screen design
        // Filename could be 'index.ts' or '[ComponentName].tsx'
        if (filename === 'index.ts') {
           return section.screens.map(s => `export * from './${s.componentName}';`).join('\n');
        }
        
        // Find component
        const screen = section.screens.find(s => s.name === filename || `${s.componentName}.tsx` === filename);
        if (screen) {
          return screen.code;
        }
      }
    }
  }

  // 4. Fallback to generated content based on filename (basename)
  const filename = path.split('/').pop() || path;

  switch (filename) {
    case 'product-vision.md': {
      if (!data.overview) return '# Product Vision\n\nRun `/product-vision` to generate this file.';
      
      const problems = data.overview.problems
        .map(p => `### ${p.title}\n${p.solution}`)
        .join('\n\n');
        
      const features = data.overview.features
        .map(f => `- ${f}`)
        .join('\n');

      return `# ${data.overview.name}

${data.overview.description}

## Key Problems & Solutions
${problems}

## Core Features
${features}
`;
    }

    case 'roadmap.md': {
      if (!data.roadmap) return '# Product Roadmap\n\nRun `/product-roadmap` to generate this file.';
      
      return `# Roadmap

${data.roadmap.sections.map(s => `## Phase ${s.order}: ${s.title}\n${s.description}`).join('\n\n')}
`;
    }

    case 'schema.prisma': {
      if (!data.dataModel) return '// Run `/data-model` to generate schema';
      
      const entities = data.dataModel.entities.map(e => `model ${e.name.replace(/\s+/g, '')} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ${e.description}
}`).join('\n\n');

      return `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${entities}
`;
    }

    case 'types.ts': {
      if (!data.dataModel) return '// Run `/data-model` to generate types';
      
      return data.dataModel.entities.map(e => `export interface ${e.name.replace(/\s+/g, '')} {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other fields based on description: ${e.description}
}`).join('\n\n');
    }

    case 'colors.ts': {
      if (!data.designSystem?.colors) return '// Run `/design-tokens` to generate colors';
      const c = data.designSystem.colors;
      return `export const colors = {
  primary: "${c.primary}",
  secondary: "${c.secondary}",
  neutral: "${c.neutral}",
  // Generated tokens
  background: "var(--background)",
  foreground: "var(--foreground)",
};`;
    }

    case 'typography.ts': {
      if (!data.designSystem?.typography) return '// Run `/design-tokens` to generate typography';
      const t = data.designSystem.typography;
      return `export const typography = {
  fonts: {
    heading: "${t.heading}",
    body: "${t.body}",
    mono: "${t.mono}",
  },
  // Font stack definitions
};`;
    }

    case 'package.json': {
      return JSON.stringify({
        name: data.overview?.name.toLowerCase().replace(/\s+/g, '-') || "design-os-app",
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "tsc && vite build",
          "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
          "preview": "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom": "^5.3.0",
          "lucide-react": "^0.292.0",
          "clsx": "^2.0.0",
          "tailwind-merge": "^2.0.0"
        },
        devDependencies: {
          "@types/react": "^18.2.37",
          "@types/react-dom": "^18.2.15",
          "@vitejs/plugin-react": "^4.2.0",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31",
          "tailwindcss": "^3.3.5",
          "typescript": "^5.2.2",
          "vite": "^5.0.0"
        }
      }, null, 2);
    }
    
    case 'global.css': {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Generated from Design System */
  --primary: ${data.designSystem?.colors?.primary || 'indigo'};
  --secondary: ${data.designSystem?.colors?.secondary || 'teal'};
  
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --border: 240 5.9% 90%;
}`;
    } 

    default:
      return `// Content for ${filename}`;
  }
};

export const getLanguage = (filename: string): string => {
  if (filename.endsWith('.md')) return 'markdown';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.prisma')) return 'clike'; 
  return 'clike';
};
