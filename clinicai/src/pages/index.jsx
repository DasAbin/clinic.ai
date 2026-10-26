import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const [patientId, setPatientId] = useState('');
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans antialiased text-black overflow-hidden">
      <Head>
        <title>CLINICAI | REGISTRY</title>
      </Head>

      {/* Left Side: Branding & Editorial */}
      <div className="lg:w-1/2 bg-black text-white p-12 lg:p-24 flex flex-col justify-between relative border-r-[0.5px] border-black">
        <div>
          <div className="flex items-center space-x-4 mb-24">
             <div className="w-12 h-1 bg-white"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.6em]">Protocol Alpha-1</span>
          </div>
          <h1 className="text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Clinic<br/>AI
          </h1>
          <p className="text-sm font-light uppercase tracking-[0.3em] opacity-60 max-w-xs leading-relaxed">
            Neural Intake Registry & Clinical Intelligence Orchestrator.
          </p>
        </div>

        <div className="space-y-4">
           <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Seminar Prototype</span>
           </div>
           <p className="text-[9px] font-light text-gray-500 uppercase tracking-widest">
             Powered by Groq Whisper Turbo & GPT-OSS 20B.
           </p>
        </div>

        {/* Decorative Newspaper Stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-[0.5px] bg-white/20"></div>
      </div>

      {/* Right Side: Operations */}
      <div className="lg:w-1/2 bg-white p-12 lg:p-24 flex flex-col justify-center items-start">
        <div className="max-w-md w-full space-y-16">
          {/* Section: New Entry */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b-[0.5px] border-gray-100 pb-4">
              I. Initiation
            </h3>
            <div className="group">
              <button 
                onClick={handleCreateNew}
                className="w-full bg-black text-white py-8 font-black uppercase tracking-[0.3em] transform hover:bg-gray-900 transition-all active:scale-[0.98] border-[0.5px] border-black group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]"
              >
                Start New Consultation
              </button>
              <p className="mt-4 text-[9px] font-light text-gray-400 italic">Generates a unique clinical identifier (PID) for the session.</p>
            </div>
          </div>

          {/* Section: Patient Registry */}
          <div className="space-y-8 pt-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b-[0.5px] border-gray-100 pb-4">
              II. Database Access
            </h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="patientId" className="block text-[10px] font-black uppercase tracking-widest text-black mb-4">
                  Patient Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="patientId"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="ENTER ID (E.G. P12345)"
                    className="w-full bg-white border-b-2 border-black py-4 text-2xl font-light uppercase tracking-tighter outline-none focus:placeholder:text-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border-[0.5px] border-black">
                <Link 
                  href={`/consult?patientId=${patientId}`}
                  className={`py-8 text-center text-[11px] font-black uppercase tracking-widest border-r-[0.5px] border-black transition-all ${
                    patientId ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-gray-200 cursor-not-allowed'
                  }`}
                  onClick={(e) => !patientId && e.preventDefault()}
                >
                  Resume
                </Link>
                
                <Link 
                  href={`/history/${patientId}`}
                  className={`py-8 text-center text-[11px] font-black uppercase tracking-widest transition-all ${
                    patientId ? 'bg-white text-black hover:bg-gray-50' : 'bg-white text-gray-200 cursor-not-allowed'
                  }`}
                  onClick={(e) => !patientId && e.preventDefault()}
                >
                  History
                </Link>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Quick Access:</span>
                <button 
                  onClick={() => setPatientId('P12345')}
                  className="text-[10px] font-black uppercase tracking-widest text-black border-b-[2px] border-black hover:bg-black hover:text-white transition-all px-2 py-1"
                >
                  Load Mock ID: P12345
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Newspaper Footer Decoration */}
      <div className="hidden">
         <p className="text-[10px] font-black uppercase tracking-[0.8em] text-black">
            ClinicAI System v1.0
         </p>
      </div>
    </div>
  );
}
