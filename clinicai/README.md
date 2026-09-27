# ClinicAI

Prototype clinical-consultation documentation app. It records a consultation, transcribes speech, retrieves medical-reference snippets and past patient records, generates structured clinical data for clinician review, and stores a revised session. **Not a validated diagnostic or prescribing device. Do not use with real patient data without consent, security review, and clinical validation.**

## Run locally

Requires Node.js 20.9 or newer. From `clinicai/`:

```sh
npm ci
npm run lint
npm run build
npm run dev
```

Create `clinicai/.env.local` (never commit it) with these values provided by your own accounts:

```dotenv
GROQ_API_KEY=
GEMINI_API_KEY=
PINECONE_API_KEY=
PINECONE_HOST=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run `sql/001_clinicai.sql` in a fresh Supabase SQL editor and `node scripts/seed_medical_kb.js` to load three synthetic demo references. The application assumes an existing Pinecone index with 768-dimensional Gemini embeddings and namespace `clinical-wisdom`, and Supabase tables `patients` and `sessions`. It does **not** create the cloud resources or seed verified medical references automatically. Missing credentials allow the UI to render but prevent the clinical pipeline from running. Do not put a Supabase service-role key into `NEXT_PUBLIC_` variables or expose it to the browser. The included `mock/` JSON is sample data, not evidence of model accuracy.

## Workflow

1. Register a patient or enter an existing patient ID.
2. On the consultation page, record audio. The browser records its supported container (usually WebM or Ogg); Groq Whisper Large v3 Turbo transcribes it.
3. Gemini `gemini-embedding-001` embeds the transcript. Pinecone returns the nearest three knowledge-base entries. Supabase supplies history and the patient profile. Groq-hosted GPT-OSS 20B generates a JSON clinical summary, medication list, suggestions, flags, and follow-up text.
4. A clinician must check and edit the output before archiving. The record is saved in Supabase and can be exported as a PDF. Public report sharing is disabled pending authentication and per-patient authorization. The assistant endpoint separately embeds a question and uses the same history and reference retrieval before Groq generates its answer.

### Data and safety limitations

- No authentication, clinician authorization, patient consent flow, de-identification or audit trail is implemented here. The schema enables RLS without public policies, and the server uses a privileged key to reach the tables. The patient-ID lookup must not be deployed with real patient records without authentication, access controls, and reviewed RLS policies. The unauthenticated report endpoint returns 403. Never use a service-role key in a public report endpoint.
- Medication and allergy checks are prompt-based, not deterministic validation. The model is told not to suggest alternative medication. The apparent confidence label is a model output, not a calibrated probability.
- The small hand-seeded knowledge base has no provenance guarantees; retrieval is top-3 over a single embedding of the entire transcript. References and generated answers need independent clinical review.
- Whisper is configured for English in the code. Hindi-English and other code-mixed consultations have not been measured for accuracy. A single synthetic API integration check succeeded for registration, extraction, saving, history and RAG. This is not clinical validation. Browser microphone-to-save and spoken audio transcription accuracy remain untested.
