import { GoogleGenerativeAI } from "@google/generative-ai";

function getGemini() {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini is not configured');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const SCHEMA = {
  type: "object",
  properties: {
    language_detected: { type: "string" },
    chief_complaint: { type: "string" },
    symptoms: { type: "array", items: { type: "string" } },
    duration: { type: "string" },
    diagnosis: { type: "string" },
    medications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          dosage: { type: "string" },
          frequency: { type: "string" },
          duration: { type: "string" },
          flag: { type: "boolean" }
        },
        required: ["name"]
      }
    },
    follow_up: { type: "string" },
    possible_suggestions: { 
      type: "array", 
      items: { 
        type: "object",
        properties: {
          label: { type: "string" }, // e.g. "Paracetamol 500mg"
          reason: { type: "string" }  // e.g. "Standard for fever > 101F"
        }
      } 
    },
    flags: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["language_detected", "chief_complaint", "diagnosis", "medications"]
};

export async function getEmbeddings(text) {
  const model = getGemini().getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType: "RETRIEVAL_QUERY",
    outputDimensionality: 768
  });
  return result.embedding.values;
}
