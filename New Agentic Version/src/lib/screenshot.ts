
import { toPng } from 'html-to-image';

export async function captureNode(node: HTMLElement): Promise<string> {
  try {
    // We increase quality and pixel ratio for better screenshots
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
    });
    return dataUrl;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
}
