import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ConsultationView from '@/components/ConsultationView';
import StructuredOutput from '@/components/StructuredOutput';
import FlagsPanel from '@/components/FlagsPanel';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import RAGChatbot from '@/components/RAGChatbot';
import { transcribeAudio, extractStructured, saveSession, getPatientProfile } from '../../contract';
import QRCode from 'react-qr-code';
import { generatePatientPDF } from '@/utils/generatePatientPDF';

export default function ConsultPage() {
  const router = useRouter();
  const { patientId } = router.query;

  const { isRecording, transcript, audioBlob, startRecording, stopRecording } = useVoiceRecorder();

  const [liveTranscript, setLiveTranscript] = useState('');
  const [structuredData, setStructuredData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    if (patientId) {
      getPatientProfile(patientId).then(setPatientProfile);
    }
  }, [patientId]);

  useEffect(() => {
    if (!audioBlob || isRecording) return;
    let active = true;
    const processAudio = async () => {
      setIsProcessing(true);
      try {
        const transResult = await transcribeAudio(audioBlob);
        const finalTranscript = transResult.transcript;
        if (!finalTranscript?.trim()) throw new Error('No speech was transcribed');
        const clinicalData = await extractStructured(finalTranscript, patientId || 'P12345');
        if (active) {
          setLiveTranscript(finalTranscript);
          setStructuredData(clinicalData);
        }
      } catch (error) {
        console.error('AI Pipeline Error:', error);
        if (active) alert(`Consultation processing failed: ${error.message}`);
      } finally {
        if (active) setIsProcessing(false);
      }
    };
    processAudio();
    return () => { active = false; };
  }, [audioBlob, isRecording, patientId]);

  const handleUpdateData = (newData) => {
    setStructuredData(newData);
  };

  const handleRemoveMed = (idx) => {
    setStructuredData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };

  const handleAddMed = () => {
    setStructuredData(prev => ({
      ...prev,
      medications: [
        ...(prev.medications || []),
        { name: '', dosage: '', frequency: '', timing: '', duration: '', flag: false }
      ]
    }));
  };

  const handleAddSuggestion = (suggestion) => {
    setStructuredData(prev => ({
      ...prev,
      medications: [
        ...(prev.medications || []),
        { name: suggestion.label, dosage: "As per protocol", frequency: "Check guidelines", duration: "Check guidelines", flag: false }
      ],
      possible_suggestions: prev.possible_suggestions.filter(s => s.label !== suggestion.label)
    }));
  };

  const handleSave = async () => {
    try {
      const saved = await saveSession(patientId || 'P12345', structuredData);
      setSavedSessionId(saved.id);
      setIsSaved(true);
      alert('Session saved successfully!');
      setIsEditingData(false);
    } catch (error) {
      alert('Failed to save session');
    }
  };

  const reportUrl = typeof window !== 'undefined' ? `${window.location.origin}/report/${savedSessionId}` : '';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-black">
      <Head>
        <title>CLINICAI | CONSULTATION</title>
      </Head>

      <nav className="bg-white border-b-[0.5px] border-black px-8 py-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-12">
          <Link href="/" className="group flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tighter uppercase">ClinicAI</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">Consultation Protocol</h1>
            <p className="text-sm font-black text-black">CASE: {patientId || 'P12345'} — {patientProfile?.name || 'LOADING...'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isSaved && (
            <button
              onClick={() => generatePatientPDF(structuredData, patientId || 'P12345', patientProfile)}
              className="px-6 py-2 bg-black text-white text-[12px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all font-sans"
            >
              Export PDF
            </button>
          )}
          {structuredData && (
            <button
              onClick={() => setIsEditingData(!isEditingData)}
              className={`px-6 py-2 text-[12px] font-black uppercase tracking-widest border-[0.5px] border-black transition-all ${
                isEditingData ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {isEditingData ? 'Finish Revision' : 'Enter Revision'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!structuredData || isSaved}
            className="px-6 py-2 bg-black text-white text-[12px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSaved ? 'Archived' : 'Archive Record'}
          </button>
        </div>
      </nav>
      {savedSessionId && (
        <div className="px-8 py-4 border-b-[0.5px] border-black bg-white">
          <div className="inline-flex flex-col items-center gap-2 border-[0.5px] border-black p-4">
            <QRCode value={reportUrl} size={96} />
            <p className="text-xs text-gray-700">Scan to share with patient</p>
            <a href={reportUrl} target="_blank" rel="noreferrer" className="text-xs underline break-all">
              {reportUrl}
            </a>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-none w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Recording & Output */}
        <div className="lg:col-span-8 p-12 space-y-12 border-r-[0.5px] border-black overflow-y-auto">
          <section className="space-y-12">
            <div className="flex justify-between items-baseline border-b-[0.5px] border-black pb-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase">Intake Registry</h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Document</span>
            </div>

            <ConsultationView
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              transcript={liveTranscript || transcript}
            />

            {isProcessing && (
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.5em] text-black">
                <span className="animate-pulse">Analyzing Neural Stream...</span>
              </div>
            )}
          </section>

          {structuredData && (
            <section className="space-y-12 animate-in fade-in duration-700">
               <div className="flex justify-between items-baseline border-b-[0.5px] border-black pb-4">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Clinical Evidence</h2>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-1">
                      {[1,2,3,4,5].map(dot => (
                        <div key={dot} className={`w-1 h-3 ${structuredData.confidence === 'high' || dot <= 3 ? 'bg-black' : 'bg-gray-100'}`}></div>
                      ))}
                   </div>
                   <span className="text-[10px] font-black text-black uppercase tracking-widest">Confidence Registry</span>
                </div>
              </div>

              <StructuredOutput
                data={{...structuredData, onAddSuggestion: handleAddSuggestion}}
                isEditing={isEditingData}
                onUpdate={handleUpdateData}
                onRemoveMed={handleRemoveMed}
                onAddMed={handleAddMed}
              />

              <FlagsPanel flags={structuredData.flags} />
            </section>
          )}
        </div>

        {/* Right Column: RAG Assistant */}
        <aside className="lg:col-span-4 bg-gray-50 flex flex-col min-h-screen">
          <div className="p-8 border-b-[0.5px] border-black bg-white">
             <h4 className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-2 font-light">Archive Access</h4>
             <h2 className="text-xl font-black uppercase tracking-tighter text-black leading-none">Neural Assistant</h2>
          </div>
          <div className="p-8 flex-1">
            <RAGChatbot patientId={patientId || 'P12345'} />
          </div>
          <div className="p-8 bg-white border-t-[0.5px] border-black">
             <p className="text-[9px] text-gray-400 font-light uppercase tracking-widest leading-loose">
               This interface is a secure gateway to patient history (Supabase) and medical knowledge (Pinecone). All queries are vectorized via Gemini.
             </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
