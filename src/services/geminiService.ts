import { GoogleGenAI } from "@google/genai";
import { REPORT_SCHEMA, ReportData, CompanyInfo, EmployeeInfo } from "../types";

const SYSTEM_PROMPT = `You are a Daily Work Report Assistant for a company. Convert user notes into a structured daily report. Follow schema strictly. If image text is unclear mark (unclear). Keep writing professional and concise. No extra text outside JSON.`;

const IMAGE_EXTRACTION_PROMPT = `Extract all readable text from this image accurately. Preserve bullets and line breaks. If uncertain, mark (unclear). Output as plain text.`;

export async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(",")[1],
            mimeType: mimeType,
          },
        },
        { text: IMAGE_EXTRACTION_PROMPT },
      ],
    },
  });

  return response.text || "";
}

export async function generateStructuredReport(
  company: CompanyInfo,
  employee: EmployeeInfo,
  textNotes?: string,
  extractedImageText?: string
): Promise<ReportData> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const userPrompt = `
Inputs:
- Company: ${company.name} ${company.address ? `(${company.address})` : ""}
- Employee: ${employee.name}, Role: ${employee.role || "N/A"}, Dept: ${employee.department || "N/A"}
- Date: ${employee.date}
- Project: ${employee.project || "N/A"}
- Working Hours: ${employee.workingHours || "N/A"}
- Text Notes: ${textNotes || "None"}
- Extracted Image Text: ${extractedImageText || "None"}

Instruction:
Merge notes, remove duplicates, create a clean daily report JSON using the schema. Ensure the summary is outcome-focused.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: REPORT_SCHEMA as any,
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as ReportData;
}

export async function polishText(text: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Polish and professionally rephrase the following work notes. Keep it concise but professional. Use bullet points if appropriate.
    
    Notes:
    ${text}`,
  });
  return response.text || text;
}
