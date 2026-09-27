import React from 'react';

export default function ConsultationView({ transcript, isRecording, startRecording, stopRecording }) {
  return (
    <div className="bg-white p-0 border-[0.5px] border-black transition-all">
      <div className="flex items-center justify-between border-b-[0.5px] border-black p-4 bg-black text-white">
        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Consultation Registry</h2>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-1.5 border-[0.5px] font-black text-[10px] uppercase tracking-widest transition-all ${
            isRecording 
              ? 'bg-white text-black animate-pulse border-white' 
              : 'bg-white text-black hover:bg-gray-100 border-white'
          }`}
        >
          {isRecording ? 'Terminate Audio' : 'Begin Intake'}
        </button>
      </div>
      
      <div className="p-6 min-h-[350px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-none ${isRecording ? 'bg-black animate-pulse' : 'bg-gray-200'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
              {isRecording ? 'Monitoring Signal' : 'Signal Standby'}
            </span>
          </div>
          {isRecording && (
            <span className="text-[9px] font-black uppercase tracking-widest text-black animate-pulse">
              Recording in Progress...
            </span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {isRecording ? (
            /* Newspaper-style Audio Animation */
            <div className="flex items-end space-x-1 h-32">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-black animate-[bounce_1s_infinite]" 
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: `${25 + (i * 37) % 70}%`
                  }}
                ></div>
              ))}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none w-full">
              <p className="text-black font-light text-2xl leading-[1.4] tracking-tight whitespace-pre-wrap antialiased">
                {transcript || "Clinical session awaiting initialization..."}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {isRecording && (
        <div className="h-1 bg-black w-full overflow-hidden">
          <div className="h-full bg-gray-400 animate-[shimmer_2s_infinite] w-1/3"></div>
        </div>
      )}
    </div>
  );
}
