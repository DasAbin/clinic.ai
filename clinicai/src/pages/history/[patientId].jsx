import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PatientHistory from '@/components/PatientHistory';
import RAGChatbot from '@/components/RAGChatbot';
import { getPatientProfile } from '../../../contract';

export default function HistoryPage() {
  const router = useRouter();
  const { patientId } = router.query;
  const [sessions, setSessions] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (patientId) {
      // Fetch History
      fetch(`/api/sessions?patientId=${patientId}`)
        .then(res => { if (!res.ok) throw new Error('Could not load sessions'); return res.json(); })
        .then(data => {
          setSessions(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching history:', err);
          setLoadError(err.message);
          setIsLoading(false);
        });

      // Fetch Patient Profile
      getPatientProfile(patientId).then(setPatientProfile);
    }
  }, [patientId]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black antialiased">
      <Head>
        <title>CLINICAI | HISTORY REGISTRY</title>
      </Head>

      {/* Navbar: Editorial Style */}
      <nav className="bg-white border-b-[0.5px] border-black px-8 py-8 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-8">
          <Link href="/" className="p-2 border-[0.5px] border-black hover:bg-black hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Archive Protocol</h1>
            <div className="flex items-baseline space-x-3">
               <span className="text-xl font-black uppercase tracking-tighter">
                {patientProfile?.name || 'LOADING...'}
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                {patientProfile ? `${patientProfile.age}Y • ${patientProfile.gender}` : ''}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="hidden lg:flex flex-col items-end pr-6 border-r-[0.5px] border-black">
              <span className="text-[9px] font-black uppercase text-gray-400">Master Record</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{patientId}</span>
           </div>
          <Link 
            href={`/consult?patientId=${patientId}`}
            className="px-6 py-2 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all font-sans"
          >
            New Consultation
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-none w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Session Timeline */}
        <div className="lg:col-span-7 p-12 space-y-12 border-r-[0.5px] border-black overflow-y-auto">
          <section className="space-y-12">
            <div className="flex justify-between items-baseline border-b-[0.5px] border-black pb-4">
              <h2 className="text-4xl font-black tracking-tighter uppercase">Visit Timeline</h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Longitudinal Ledger</span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-24 animate-pulse">
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Records...</span>
              </div>
            ) : loadError ? (
              <p role="alert">{loadError}</p>
            ) : (
              <div className="editorial-content">
                <PatientHistory sessions={sessions} />
              </div>
            )}
          </section>
        </div>

        {/* Right: AI RAG Assistant */}
        <aside className="lg:col-span-5 bg-gray-50 flex flex-col min-h-screen">
          <div className="p-8 border-b-[0.5px] border-black bg-white flex justify-between items-center">
             <div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-2">Neural Access</h4>
                <h2 className="text-xl font-black uppercase tracking-tighter text-black leading-none">Intelligence Audit</h2>
             </div>
             <div className="w-12 h-[0.5px] bg-black"></div>
          </div>
          
          <div className="p-8 flex-1">
            <RAGChatbot patientId={patientId} />
          </div>
          
          {/* Static Insight Block - Newspaper Style */}
          <div className="p-8 bg-white border-t-[0.5px] border-black">
             <div className="p-6 border-[0.5px] border-black relative">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[9px] font-black uppercase tracking-widest">Doctor Assist</span>
                <p className="text-xs font-light leading-relaxed italic antialiased text-gray-800">
                  This patient has documented history of persistent symptoms in previous sessions. Use the Neural Interface to cross-reference past medication efficacy before proceeding with new entries.
                </p>
             </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
