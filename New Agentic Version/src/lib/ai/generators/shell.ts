
import { Type } from "@google/genai";
import { generateStructured } from "../client";
import { SHELL_DESIGN_PROMPT } from "../../prompts";
import { ProductOverview, ProductRoadmap, ShellSpec } from "../../../types";

export async function generateShellSpec(
    input: string, 
    overview: ProductOverview,
    roadmap: ProductRoadmap,
    history: any[],
    images: string[] = []
) {
  const context = `
    Product Overview: ${JSON.stringify(overview)}
    Roadmap: ${JSON.stringify(roadmap)}
    User Input: ${input}
    ${images.length > 0 ? 'NOTE: The user has attached images. Use the layout and navigation structure visible in the images.' : ''}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      overview: { type: Type.STRING },
      navigationItems: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      layoutPattern: { type: Type.STRING },
      raw: { type: Type.STRING, description: "Detailed Markdown description of the shell specification" }
    },
    required: ["overview", "navigationItems", "layoutPattern", "raw"]
  };

  return generateStructured<ShellSpec>(context, schema, SHELL_DESIGN_PROMPT, history, images);
}
