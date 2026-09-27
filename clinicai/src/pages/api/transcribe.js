import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { transcribeGroq } from '@/services/groq';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const form = formidable({ maxFileSize: 25 * 1024 * 1024 });
  let uploadPath;
  let originalPath;
  
  try {
    const [, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const audioFile = files.file ? files.file[0] : null;
    if (!audioFile) return res.status(400).json({ message: 'No audio file provided' });
    
    originalPath = audioFile.filepath;
    // MediaRecorder usually produces WebM or Ogg, not WAV. Preserve the real
    // container extension so the transcription API decodes the bytes correctly.
    const extension = path.extname(audioFile.originalFilename || '').toLowerCase();
    const supported = ['.webm', '.ogg', '.wav', '.mp3', '.m4a', '.mp4'];
    if (!supported.includes(extension)) {
      return res.status(400).json({ message: 'Unsupported audio format' });
    }
    uploadPath = `${audioFile.filepath}${extension}`;
    fs.renameSync(audioFile.filepath, uploadPath);
    const result = await transcribeGroq(uploadPath);

    console.log(`[ClinicAI | Groq Turbo] - Transcription SUCCESS`);
    res.status(200).json(result);

  } catch (error) {
    console.error(`[ClinicAI | Groq Turbo] - Error details:`, error.message);
    res.status(500).json({ message: error.message });
  } finally {
    if (uploadPath && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
    else if (originalPath && fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
  }
}
