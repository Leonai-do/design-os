
import { Type } from "@google/genai";
import { generateStructured } from "../client";
import { PRODUCT_VISION_PROMPT, PRODUCT_ROADMAP_PROMPT } from "../../prompts";
import { ProductOverview, ProductRoadmap } from "../../../types";

// 1. Product Vision (Create or Edit)
export async function generateProductVision(
    input: string, 
    currentOverview: ProductOverview | null, 
    history: any[],
    onStream?: (chunk: string) => void
) {
  const context = `
    Current Product Overview: ${JSON.stringify(currentOverview || {})}
    User Input: ${input}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      problems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            solution: { type: Type.STRING }
          },
          required: ["title", "solution"]
        }
      },
      features: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["name", "description", "problems", "features"]
  };

  return generateStructured<ProductOverview>(context, schema, PRODUCT_VISION_PROMPT, history, [], onStream);
}

// 2. Product Roadmap (Create or Edit)
export async function generateRoadmap(
    input: string, 
    overview: ProductOverview, 
    currentRoadmap: ProductRoadmap | null,
    history: any[],
    onStream?: (chunk: string) => void
) {
  const context = `
    Product Overview: ${JSON.stringify(overview)}
    Current Roadmap: ${JSON.stringify(currentRoadmap || {})}
    User Input: ${input}
  `;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            order: { type: Type.NUMBER }
          },
          required: ["id", "title", "description", "order"]
        }
      }
    },
    required: ["sections"]
  };

  return generateStructured<ProductRoadmap>(context, schema, PRODUCT_ROADMAP_PROMPT, history, [], onStream);
}
