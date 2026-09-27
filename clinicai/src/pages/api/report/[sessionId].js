import { createClient } from '@supabase/supabase-js';

// Public report links expose clinical data. Do not expose the service-role key here.
// The database's RLS policy must explicitly allow only intended report access.
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const { sessionId } = req.query;
  if (typeof sessionId !== 'string' || !sessionId.trim()) return res.status(400).json({ message: 'sessionId is required' });
  let data, error;
  try {
    ({ data, error } = await getSupabase().from('sessions').select('*').eq('id', sessionId).single());
  } catch {
    return res.status(503).json({ message: 'Report service unavailable' });
  }

  if (error) {
    return res.status(404).json({ message: 'Session not found' });
  }

  return res.status(200).json(data);
}
