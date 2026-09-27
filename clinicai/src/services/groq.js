import Groq from "groq-sdk";
import fs from "fs";

function getGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('Groq is not configured');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
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
          timing: { type: "string" }, // e.g., "After Lunch", "Morning & Night"
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
          label: { type: "string" }, 
          reason: { type: "string" }  
        }
      } 
    },
    flags: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["language_detected", "chief_complaint", "diagnosis", "medications"]
};

export async function extractStructuredGroq(transcript, medicalContext = "", historyContext = "", patientProfile = null) {
  const completion = await getGroq().chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a clinical documentation AI. Extract structured medical data from clinical transcripts. 
STRICT REQUIREMENT: Always respond in English.
Return ONLY valid JSON according to this SCHEMA: ${JSON.stringify(SCHEMA)}

PRESCRIPTION PRECISION:
- For medications, strictly capture the drug name (name), dosage (dosage), frequency (frequency: prefer plain English like "Once a day", "Twice a day" - AVOID abbreviations like BD/OD/TDS), and TIMING (timing: e.g., "After Lunch").
- Example mapping:
  Input: "Take Paracetamol 500mg twice a day after lunch for 3 days"
  Output Part: {"name": "Paracetamol", "dosage": "500mg", "frequency": "Twice a day", "timing": "After Lunch", "duration": "3 days"}
- STRICT FORBIDDEN ITEMS: NEVER include clinical protocols, management steps, or general advice (e.g., "Fever Management", "Rest", "Increase fluids") in the 'medications' array. Only include valid drug or syrup names.

RESILIENCE RULES:
1. BACKGROUND NOISE: Ignore linguistic 'noise'. Prioritize clinical logic.
2. AMBIGUITY: Check PATIENT HISTORY for "old medicine" references.
3. PHONETIC SAFETY: Do not guess a medicine from similar-sounding words. If drug identity, dose, or timing is unclear, flag it for clinician review rather than inventing details.
4. Do not suggest alternative medications or treatments. Set possible_suggestions to an empty array.
5. SAFETY AUDIT: Compare new medications against PATIENT PROFILE (Allergies/Conditions). If a conflict exists (e.g., prescribing a drug the patient is allergic to), set "flag": true for that medication and add a clear warning in the 'flags' array.`
      },
      {
        role: "user",
        content: `
        RETRIEVED DEMONSTRATION REFERENCES (not verified guidelines):
        ${medicalContext}

        PATIENT PROFILE:
        ${patientProfile ? JSON.stringify({
          allergies: patientProfile.known_allergies,
          conditions: patientProfile.chronic_conditions,
          current_meds: patientProfile.current_medications
        }) : "None Provided"}

        PATIENT HISTORY (Supabase Records):
        ${historyContext}

        CURRENT TRANSCRIPT:
        ${transcript}
        `
      }
    ],
    model: "openai/gpt-oss-20b",
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content);
}

export async function queryRAGGroq(patientId, query, historyContext) {
  const completion = await getGroq().chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a clinical assistant. Use the PATIENT PROFILE (Allergies, History, Background), PAST SESSIONS, and MEDICAL PROTOCOLS to answer queries concisely. 
        PRIORITY: If the query relates to medications or treatment, always cross-reference the PATIENT PROFILE for potential risks or allergies. 
        STRICT REQUIREMENT: Always respond in English.`
      },
      {
        role: "user",
        content: `
        Patient ID: ${patientId}
        Combined Context: ${JSON.stringify(historyContext)}
        
        Question: ${query}
        `
      }
    ],
    model: "openai/gpt-oss-20b"
  });

  return completion.choices[0].message.content;
}

export async function transcribeGroq(filePath) {
  try {
    const transcription = await getGroq().audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3-turbo", 
      prompt: "Cetirizine, Paracetamol, Amoxicillin, Amlodipine, Metformin, Atorvastatin, Omeprazole, Azithromycin, Cough Syrup, Saturation, Clinical Prescription, Diagnosis, Symptoms.", // Medical nudge
      response_format: "json",
      language: "en",
      temperature: 0.0,
    });

    return { transcript: transcription.text };
  } catch (error) {
    console.error("Groq Transcription Error:", error);
    throw error;
  }
}
