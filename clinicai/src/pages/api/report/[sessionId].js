// Public, unauthenticated report URLs must not expose private clinical records.
// Implement per-patient/clinician authorization before enabling this endpoint.
export default function handler(req, res) {
  res.status(403).json({ message: 'Report sharing requires authentication' });
}
