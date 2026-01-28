
import { Type } from "@google/genai";
import { generateStructured } from "../client";
import { DATA_MODEL_PROMPT, DESIGN_SYSTEM_PROMPT } from "../../prompts";
import { ProductOverview, ProductRoadmap, DataModel, DesignSystem } from "../../../types";

// 3. Data Model
export async function generateDataModel(
    input: string, 
    overview: ProductOverview, 
    roadmap: ProductRoadmap, 
    currentDataModel: DataModel | null,
    history: any[],
    images: string[] = [] // Supported, but less common
) {
  const context = `
    Product Overview: ${JSON.stringify(overview)}
    Roadmap: ${JSON.stringify(roadmap)}
    Current Data Model: ${JSON.stringify(currentDataModel || {})}
    User Input: ${input}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      entities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      },
      relationships: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["entities", "relationships"]
  };

  return generateStructured<DataModel>(context, schema, DATA_MODEL_PROMPT, history, images);
}

// 4. Design System (Vision Supported)
export async function generateDesignSystem(
    input: string, 
    overview: ProductOverview, 
    currentSystem: DesignSystem | null,
    history: any[],
    images: string[] = []
) {
  const context = `
    Product Overview: ${JSON.stringify(overview)}
    Current Design System: ${JSON.stringify(currentSystem || {})}
    User Input: ${input}
    ${images.length > 0 ? 'NOTE: The user has attached images. Use the colors and visual style from the images to derive the token values.' : ''}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      colors: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING },
          secondary: { type: Type.STRING },
          neutral: { type: Type.STRING }
        },
        required: ["primary", "secondary", "neutral"]
      },
      typography: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          body: { type: Type.STRING },
          mono: { type: Type.STRING }
        },
        required: ["heading", "body", "mono"]
      }
    },
    required: ["colors", "typography"]
  };

  return generateStructured<DesignSystem>(context, schema, DESIGN_SYSTEM_PROMPT, history, images);
}
