import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

// Demonstration-only references. These are not sourced treatment guidelines.
// Never label generated or hand-written notes as ICMR or StatPearls.
const MEDICAL_DATA = [
  { id: 'demo_fever_01', text: 'Demo reference: Document the duration and measured temperature of fever. Record warning symptoms and ask a clinician to review the assessment.', metadata: { source: 'ClinicAI synthetic demo note', condition: 'Fever' } },
  { id: 'demo_allergy_01', text: 'Demo reference: Before finalizing a medication list, compare each drug with the patient allergy record. Any uncertain match needs clinician review.', metadata: { source: 'ClinicAI synthetic demo note', condition: 'Allergy documentation' } },
  { id: 'demo_followup_01', text: 'Demo reference: A structured consultation note includes chief complaint, symptoms, relevant history, reviewed medicines and follow-up.', metadata: { source: 'ClinicAI synthetic demo note', condition: 'Documentation' } }
];

async function seed() {
  console.log("Seeding Medical Knowledge Base to Pinecone (REST)...");
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const vectors = [];
  for (const item of MEDICAL_DATA) {
    console.log(`Embedding: ${item.id}`);
    const result = await model.embedContent({
      content: { parts: [{ text: item.text }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768
    });
    
    vectors.push({
      id: item.id,
      values: result.embedding.values,
      metadata: { text: item.text, ...item.metadata }
    });
  }

  console.log(`Prepared ${vectors.length} vectors. Sending to Pinecone at ${PINECONE_HOST}...`);

  const response = await fetch(`https://${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      namespace: 'clinical-wisdom',
      vectors: vectors
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Pinecone Upsert failed: ${JSON.stringify(error)}`);
  }

  console.log("Seeding complete! Medical Knowledge Base is now live in 'clinical-wisdom' namespace.");
}

seed().catch(error => { console.error(error); process.exitCode = 1; });
