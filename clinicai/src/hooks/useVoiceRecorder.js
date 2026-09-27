import { useState, useRef, useEffect } from 'react';

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingRef = useRef(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize Web Speech API for live feedback (Optional browser-level STT)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onend = () => {
        // Restart if we're still in recording mode (prevents timeout on long pauses)
        if (recordingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) { /* already started */ }
        }
      };
    }
  }, []);

  const startRecording = async () => {
    if (typeof window === 'undefined') return;
    chunksRef.current = [];
    setTranscript('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType });
        setAudioBlob(blob);
      };
      
      mediaRecorderRef.current.start();
      recognitionRef.current?.start();
      recordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    recordingRef.current = false;
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  return {
    isRecording,
    transcript,
    audioBlob,
    startRecording,
    stopRecording
  };
}
