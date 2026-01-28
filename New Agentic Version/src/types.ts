
// Product Overview Types
export interface Problem {
  title: string;
  solution: string;
}

export interface ProductOverview {
  name: string;
  description: string;
  problems: Problem[];
  features: string[];
}

// Product Roadmap Types
export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface ProductRoadmap {
  sections: Section[];
}

// Data Model Types
export interface Entity {
  name: string;
  description: string;
}

export interface DataModel {
  entities: Entity[];
  relationships: string[];
}

// Design System Types
export interface ColorTokens {
  primary: string;
  secondary: string;
  neutral: string;
}

export interface TypographyTokens {
  heading: string;
  body: string;
  mono: string;
}

export interface DesignSystem {
  colors: ColorTokens | null;
  typography: TypographyTokens | null;
}

// Shell Types
export interface ShellSpec {
  raw: string;
  overview: string;
  navigationItems: string[];
  layoutPattern: string;
}

export interface ShellInfo {
  spec: ShellSpec | null;
  code?: string;
  hasComponents: boolean;
}

// Section Implementation Types
export interface SectionSpec {
  raw: string;
  title: string;
  description: string;
  userFlows: string[];
  uiRequirements: string[];
  useShell?: boolean;
}

export interface ScreenDesign {
  id: string;
  name: string;
  description: string;
  componentName: string;
  code: string;
  screenshot?: string; // Base64 data URI
}

export interface SectionDetail {
  id: string;
  spec: SectionSpec | null;
  sampleData: string | null; // Stored as JSON string
  screens: ScreenDesign[];
}

// Custom Files (User created/uploaded)
export interface CustomFile {
  path: string;
  content: string;
}

// Trash
export interface TrashItem {
  id: string;
  path: string;
  content: string;
  deletedAt: number;
}

// Combined Data Type
export interface ProductData {
  overview: ProductOverview | null;
  roadmap: ProductRoadmap | null;
  dataModel: DataModel | null;
  designSystem: DesignSystem | null;
  shell: ShellInfo | null;
  sections: Record<string, SectionDetail>;
  customFiles?: CustomFile[];
  trash?: TrashItem[];
  hiddenFiles?: string[]; // Paths of generated files that are "deleted"
}
