import React, { useState, useRef, useEffect } from 'react';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';

export default function RAGChatbot({ patientId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Patient Intelligence active. Awaiting clinical query.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const { isRecording, transcript, startRecording, stopRecording } = useVoiceRecorder();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const currentInput = input.trim() || transcript.trim();
    if (!currentInput) return;

    const userMessage = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, question: currentInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Query failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Query failed: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border-[0.5px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-4 border-b-[0.5px] border-black bg-black text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Interface v1.0</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-1 h-3 bg-white opacity-20"></div>
          <div className="w-1 h-3 bg-white opacity-40"></div>
          <div className="w-1 h-3 bg-white opacity-60"></div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-white border-b-2 border-black p-0 text-right' 
                : 'bg-white border-l-4 border-black pl-4 py-1'
            }`}>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${
                m.role === 'user' ? 'text-gray-400' : 'text-black'
              }`}>
                {m.role === 'assistant' ? 'Intelligence Response' : 'Analyst Query'}
              </p>
              <p className={`text-sm leading-relaxed antialiased ${
                m.role === 'user' ? 'font-black text-xl italic tracking-tighter' : 'font-light italic text-gray-800'
              }`}>
                {m.content}
              </p>
            </div>
          </div>
        ))}
        
        {isRecording && (
          <div className="flex justify-end">
            <div className="bg-white border-b-2 border-gray-200 p-0 text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 text-gray-300">Listening...</p>
              <p className="text-xl font-black italic tracking-tighter text-gray-300 animate-pulse">
                {transcript || "Speak now..."}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-l-4 border-gray-200 pl-4 py-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 text-gray-300">Neural Sync</p>
              <p className="text-sm font-light text-gray-300 italic">Accessing clinical vectors...</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t-[0.5px] border-black bg-gray-50">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            value={input || transcript}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "LISTENING..." : "ENTER COMMAND..."}
            className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none placeholder:text-gray-300"
            disabled={isRecording}
          />
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 transition-all border-[0.5px] ${
                isRecording 
                  ? 'bg-black text-white border-black animate-pulse' 
                  : 'bg-white text-black border-black hover:bg-black hover:text-white'
              }`}
              title={isRecording ? "Stop Recording" : "Voice Query"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={isRecording || !(input.trim() || transcript.trim())}
              className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              Execute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
