import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServerKey) {
  console.warn("⚠️ Clinical DB Credentials Missing. API routes will fail.");
}

function getSupabase() {
  if (!supabaseUrl || !supabaseServerKey) throw new Error('Supabase is not configured');
  return createClient(supabaseUrl, supabaseServerKey);
}

export async function saveSession(patientId, sessionData) {
  const timestamp = new Date().toISOString();
  console.log(`[ClinicAI | DB] - Indexing new session for Patient: ${patientId} at ${timestamp}`);
  
  const { data, error } = await getSupabase()
    .from('sessions')
    .insert([
      {
        patient_id: patientId,
        diagnosis: sessionData.diagnosis,
        summary: sessionData.follow_up, 
        medications: sessionData.medications,
        extracted_data: sessionData
      }
    ])
    .select();

  if (error) {
    console.error(`[ClinicAI | DB] - FAILED recording for Patient: ${patientId}. Error:`, error.message);
    throw error;
  }
  
  console.log(`[ClinicAI | DB] - SUCCESS! Session saved with ID: ${data[0].id}`);
  return data[0];
}

export async function getSessions(patientId) {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPatientProfile(patientId) {
  const { data, error } = await getSupabase()
    .from('patients')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  if (error) {
    console.error(`[ClinicAI | DB] - Profile FETCH FAILED for Patient: ${patientId}. Error:`, error.message);
    return null;
  }
  
  return data;
}

export async function createPatient(patientData) {
  const { data, error } = await getSupabase()
    .from('patients')
    .insert([patientData])
    .select()
    .single();

  if (error) {
    console.error(`[ClinicAI | DB] - Patient REGISTRATION FAILED. Error:`, error.message);
    throw error;
  }
  
  return data;
}
