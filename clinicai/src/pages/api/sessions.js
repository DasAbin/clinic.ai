import { saveSession, getSessions } from '@/services/supabase';

export default async function handler(req, res) {
  const patientId = Array.isArray(req.query.patientId) ? req.query.patientId[0] : req.query.patientId;

  if (!patientId) {
    console.error("ERROR: Missing patientId in /api/sessions");
    return res.status(400).json({ message: "patientId is required" });
  }

  if (req.method === 'GET') {
    try {
      console.log(`[ClinicAI | API] - Fetching history for Patient: ${patientId}`);
      const data = await getSessions(patientId);
      console.log(`[ClinicAI | API] - Successfully retrieved ${data?.length || 0} sessions.`);
      res.status(200).json(data);
    } catch (error) {
      console.error("DEBUG: GET /api/sessions error:", error);
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { sessionData } = req.body || {};
      if (!sessionData || typeof sessionData !== 'object' || Array.isArray(sessionData)) {
        return res.status(400).json({ message: 'sessionData is required' });
      }
      console.log(`[ClinicAI | API] - Incoming persistence request for Patient: ${patientId}`);
      const data = await saveSession(patientId, sessionData);
      res.status(200).json(data);
    } catch (error) {
      console.error(`[ClinicAI | API] - Persistence error for Patient: ${patientId}:`, error.message);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
