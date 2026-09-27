import { queryRAGGroq } from '@/services/groq';
import { getEmbeddings } from '@/services/gemini';
import { getSessions, getPatientProfile } from '@/services/supabase';
import { queryMedicalKB } from '@/services/pinecone';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { patientId, question } = req.body || {};
  if (typeof patientId !== 'string' || !patientId.trim() || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: 'patientId and question are required' });
  }

  try {
    // 1. Fetch History from Supabase
    const history = await getSessions(patientId);
    
    // 2. Fetch Medical Wisdom from Pinecone (Semantic)
    const vector = await getEmbeddings(question);
    const medicalReference = await queryMedicalKB(vector);
    
    // 3. Combined Query
    const patientProfile = await getPatientProfile(patientId);
    
    const combinedContext = {
      patient_profile: patientProfile,
      patient_history: history,
      medical_protocols: medicalReference
    };
    
    const answer = await queryRAGGroq(patientId, question, combinedContext);
    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
