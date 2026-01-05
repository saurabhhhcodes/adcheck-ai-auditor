import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const auditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pass: {
      type: Type.BOOLEAN,
      description: "Whether the ad creative passed all audit checks. Set to FALSE if any rule fails.",
    },
    violations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific guideline violations found in the image. Be precise.",
    },
    corrective_instruction: {
      type: Type.STRING,
      description: "Direct, implementable corrections to fix the violations (e.g., 'Move logo to top-left', 'Change text color to #FFFFFF'). Do not redesign.",
    },
  },
  required: ["pass", "violations", "corrective_instruction"],
};

export const auditCreative = async (base64Image: string, guidelines: string): Promise<AuditResult> => {
  try {
    const systemInstruction = `You are "AdCheck," an enterprise-grade AI Compliance Auditor for retail advertising creatives.
Your task is to perform strict, deterministic, explainable visual and semantic compliance audits on uploaded ad images using the provided retailer guidelines.

You are NOT a creative assistant. You operate as a compliance engine. Your outputs must be consistent, conservative, objective, and legally safe.

AUDIT LOGIC (MANDATORY):
1. Analyze the image visually: extract logos, text, colors, products, background, symbols. Perform OCR-style text detection.
2. Evaluate each guideline INDEPENDENTLY using only visual evidence.
3. For color/contrast: Identify text/background colors. If contrast >= 4.5:1 cannot be confirmed visually, mark as a violation.
4. For logos: Check presence, corner placement, opacity, overlap, and clarity.
5. For products: Ensure realistic, photographic, unwarped, not AI-stylized.
6. Brand safety: Family-friendly, no aggressive imagery or competing brands.
7. If image quality is insufficient, mark as undetermined/fail for safety.
8. Never assume missing information. Never guess.

HARD RULES:
- Do NOT hallucinate details.
- Do NOT be subjective.
- Do NOT suggest creative enhancements, only compliance fixes.
- PASS = 100% adherence. Any deviation is a FAIL.

OUTPUT FORMAT:
You must return a strictly structured JSON object adhering to the provided schema.
Map "Recommended Fixes" to the 'corrective_instruction' field.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            text: `Retailer Guidelines:\n${guidelines}\n\nPerform a strict compliance audit on this ad creative.`,
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: auditSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AuditResult;
    }
    throw new Error("No response text received from Gemini.");
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};

export const fixCreative = async (base64Image: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            text: `You are an expert image editor. Edit this image to strictly comply with the following instruction: "${instruction}".
            
            IMPORTANT:
            - Maintain the original high quality and photorealism.
            - Do not distort products or logos.
            - Only apply the specific changes requested in the instruction.
            - Keep the rest of the layout identical to the original.`,
          },
        ],
      },
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in the response.");
  } catch (error) {
    console.error("Fix creative failed:", error);
    throw error;
  }
};