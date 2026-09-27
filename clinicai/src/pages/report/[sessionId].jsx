import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { generatePatientPDF } from '@/utils/generatePatientPDF';

export default function PatientReportPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/report/${sessionId}`);
        if (!response.ok) {
          throw new Error('Session not found');
        }
        const data = await response.json();
        setSessionData({ ...data, ...data.extracted_data, patient_id: data.patient_id, created_at: data.created_at });
      } catch (err) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'N/A';
    }
    return parsed.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>ClinicAI Patient Report</title>
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold">ClinicAI</h1>
          <p className="text-base text-gray-600">Patient Report</p>
        </header>

        {loading && <p className="text-base">Loading report...</p>}

        {!loading && error && <p className="text-base text-red-700">{error}</p>}

        {!loading && !error && sessionData && (
          <>
            <section className="border border-gray-200 p-4 text-base">
              <p className="font-medium">
                Patient ID: {sessionData.patient_id || 'N/A'} | Date: {formatDate(sessionData.created_at)}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Chief Complaint</h2>
              <p className="text-xl">{sessionData.chief_complaint || 'N/A'}</p>
            </section>

            <section className="space-y-2 border-l-4 border-green-600 pl-4">
              <h2 className="text-lg font-semibold">Diagnosis</h2>
              <p className="text-lg font-bold">{sessionData.diagnosis || 'N/A'}</p>
            </section>

            {!!sessionData.symptoms?.length && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Symptoms</h2>
                <div className="flex flex-wrap gap-2">
                  {sessionData.symptoms.map((symptom, index) => (
                    <span key={`${symptom}-${index}`} className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-base">
                      {symptom}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Medications</h2>
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-left text-base border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">Medicine</th>
                      <th className="p-3">Dose</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Timing</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sessionData.medications || []).map((medication, index) => (
                      <tr key={`${medication.name || 'med'}-${index}`} className="border-t border-gray-200">
                        <td className="p-3">
                          {medication.name || 'N/A'} {medication.flag ? '⚠️' : ''}
                        </td>
                        <td className="p-3">{medication.dose || medication.dosage || 'N/A'}</td>
                        <td className="p-3">{medication.frequency || 'N/A'}</td>
                        <td className="p-3">{medication.timing || 'N/A'}</td>
                        <td className="p-3">{medication.duration || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {!!sessionData.investigations?.length && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Investigations</h2>
                <ul className="list-disc pl-6 text-base space-y-1">
                  {sessionData.investigations.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {(sessionData.bp || sessionData.temp || sessionData.weight) && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Vitals</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-200 p-3 text-base">BP: {sessionData.bp || 'N/A'}</div>
                  <div className="border border-gray-200 p-3 text-base">Temp: {sessionData.temp || 'N/A'}</div>
                  <div className="border border-gray-200 p-3 text-base">Weight: {sessionData.weight || 'N/A'}</div>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Follow-up</h2>
              <p className="text-base">📅 {sessionData.follow_up || 'N/A'}</p>
            </section>

            <button
              onClick={() => generatePatientPDF(sessionData, sessionData.patient_id || 'P12345')}
              className="px-5 py-3 bg-black text-white text-base font-semibold"
            >
              Download PDF
            </button>
          </>
        )}

        <footer className="pt-8 border-t border-gray-200">
          <p className="text-base text-gray-700">
            Generated by ClinicAI — For reference only. Consult your doctor.
          </p>
        </footer>
      </main>
    </div>
  );
}
