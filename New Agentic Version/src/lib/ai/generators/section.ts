
import { Type } from "@google/genai";
import { generateStructured } from "../client";
import { SECTION_SPEC_PROMPT, SECTION_DATA_PROMPT, SCREEN_DESIGN_PROMPT } from "../../prompts";
import { ProductRoadmap, SectionSpec, DataModel, DesignSystem, ScreenDesign } from "../../../types";

// 5. Section Spec
export async function generateSectionSpec(
  input: string,
  roadmap: ProductRoadmap,
  history: any[],
  images: string[] = []
) {
  const context = `
    Roadmap: ${JSON.stringify(roadmap)}
    User Input: ${input}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      userFlows: { type: Type.ARRAY, items: { type: Type.STRING } },
      uiRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
      useShell: { type: Type.BOOLEAN }
    },
    required: ["title", "description", "userFlows", "uiRequirements", "useShell"]
  };

  return generateStructured<SectionSpec>(context, schema, SECTION_SPEC_PROMPT, history, images);
}

// 6. Section Data
export async function generateSectionData(
  sectionSpec: SectionSpec,
  dataModel: DataModel,
  history: any[],
  images: string[] = []
) {
  const context = `
    Section Spec: ${JSON.stringify(sectionSpec)}
    Global Data Model: ${JSON.stringify(dataModel)}
  `;

  const schema = {
    type: Type.STRING,
    description: "Stringified JSON object of the sample data"
  };

  return generateStructured<string>(context, schema, SECTION_DATA_PROMPT, history, images);
}

// 7. Screen Design (Vision Supported)
export async function generateScreenDesign(
  sectionSpec: SectionSpec,
  sampleData: string,
  designSystem: DesignSystem | null,
  history: any[],
  images: string[] = []
) {
  const context = `
    Section Spec: ${JSON.stringify(sectionSpec)}
    Sample Data: ${sampleData}
    Design System: ${JSON.stringify(designSystem || {})}
    ${images.length > 0 ? 'NOTE: The user has attached images. Use the layout, style, and structure from the images to build the React component.' : ''}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      componentName: { type: Type.STRING },
      description: { type: Type.STRING },
      code: { type: Type.STRING }
    },
    required: ["name", "componentName", "code"]
  };

  return generateStructured<ScreenDesign>(context, schema, SCREEN_DESIGN_PROMPT, history, images);
}
