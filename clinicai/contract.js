/**
 * contract.js
 * LOCK: Do not change these signatures.
 * Shared between Frontend and Backend.
 */

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, audioBlob.type.includes('webm') ? 'consultation.webm' : audioBlob.type.includes('ogg') ? 'consultation.ogg' : 'consultation.wav');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}

export async function extractStructured(transcript, patientId) {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, patientId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}

export async function saveSession(patientId, sessionData) {
  const response = await fetch(`/api/sessions?patientId=${encodeURIComponent(patientId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionData })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}

export async function getSessions(patientId) {
  const response = await fetch(`/api/sessions?patientId=${encodeURIComponent(patientId)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}

export async function queryRAG(patientId, question) {
  const response = await fetch('/api/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, question })
  });
  const data = await response.json();
  return data.answer;
}

export async function getPatientProfile(patientId) {
  const response = await fetch(`/api/patients?patientId=${encodeURIComponent(patientId)}`);
  if (response.status === 404) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}

export async function registerPatient(patientData) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}
