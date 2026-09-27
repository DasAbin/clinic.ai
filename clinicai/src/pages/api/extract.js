import { extractStructuredGroq } from '@/services/groq';
import { getEmbeddings } from '@/services/gemini';
import { queryMedicalKB } from '@/services/pinecone';
import { getSessions, getPatientProfile } from '@/services/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { transcript, patientId } = req.body || {};
  if (typeof transcript !== 'string' || !transcript.trim() || typeof patientId !== 'string' || !patientId.trim()) {
    return res.status(400).json({ message: 'A transcript and patientId are required' });
  }

  try {
    console.log(`[ClinicAI | AI] - Starting extraction pipeline for Patient: ${patientId}`);
    console.log(`[ClinicAI | AI] - Transcript length: ${transcript.length} characters.`);

    // 1. Get embeddings for the transcript
    const vector = await getEmbeddings(transcript);
    
    // 2. Query Pinecone for Medical Wisdom (Parallel-ish)
    const medicalReference = await queryMedicalKB(vector);
    const medicalContext = medicalReference.map(m => m.text).join('\n');
    
    // 3. Query Supabase for Patient Memory
    const historyData = await getSessions(patientId);
    const historyContext = JSON.stringify(historyData);

    // 4. Query Patient Meta (Allergies/Conditions)
    const patientProfile = await getPatientProfile(patientId);
    
    // 5. Extract with Full Context (via Groq)
    const data = await extractStructuredGroq(transcript, medicalContext, historyContext, patientProfile);
    
    console.log(`[ClinicAI | AI] - Extraction SUCCESS for Patient: ${patientId}`);
    res.status(200).json(data);
  } catch (error) {
    console.error(`[ClinicAI | AI] - Extraction FAILED for Patient: ${patientId}. Error:`, error.message);
    res.status(500).json({ message: error.message });
  }
}
