import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Send, Volume2, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
  timeLimitSeconds: number;
  prepTimeSeconds?: number;
  onSubmit: (audioBlob: Blob | undefined, durationSeconds: number, transcript: string) => void;
  isSubmitting?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  timeLimitSeconds,
  prepTimeSeconds = 15,
  onSubmit,
  isSubmitting = false,
}) => {
  const [phase, setPhase] = useState<'idle' | 'prep' | 'recording' | 'recorded'>('idle');
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(prepTimeSeconds);
  const [speakingTime, setSpeakingTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Browser Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        setLiveTranscript(fullText.trim());
      };

      recognition.onerror = () => {};
      recognitionRef.current = recognition;
    }
  }, []);

  // Prep Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (phase === 'prep') {
      interval = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Speaking Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (phase === 'recording') {
      interval = setInterval(() => {
        setSpeakingTime((prev) => {
          if (prev >= timeLimitSeconds) {
            stopRecording();
            return timeLimitSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, timeLimitSeconds]);

  const startPrep = () => {
    setPhase('prep');
    setPrepTimeLeft(prepTimeSeconds);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Web Audio API visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#ec4899');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, 3);
          ctx.fill();

          x += barWidth + 1;
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setPhase('recording');
      setSpeakingTime(0);

      // Start Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required for Speaking practice. Please allow access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setPhase('recorded');
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    audioBlobRef.current = null;
    setSpeakingTime(0);
    setLiveTranscript('');
    setPhase('idle');
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = () => {
    onSubmit(audioBlobRef.current || undefined, speakingTime || 45, liveTranscript);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-card" style={{ padding: '28px', border: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Header status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: phase === 'recording' ? '#f43f5e' : phase === 'prep' ? '#f59e0b' : '#10b981',
              boxShadow: phase === 'recording' ? '0 0 12px #f43f5e' : 'none',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {phase === 'idle' && 'Ready to Record'}
            {phase === 'prep' && 'Preparation Time'}
            {phase === 'recording' && 'Recording Active'}
            {phase === 'recorded' && 'Recording Complete'}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          {phase === 'prep' ? `Prep: ${prepTimeLeft}s` : `${formatTime(speakingTime)} / ${formatTime(timeLimitSeconds)}`}
        </div>
      </div>

      {/* Waveform Canvas / Preparation Area */}
      <div className="waveform-container" style={{ marginBottom: '20px' }}>
        {phase === 'prep' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
              {prepTimeLeft}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get your ideas ready...</div>
          </div>
        )}

        {phase === 'recording' && (
          <canvas ref={canvasRef} className="waveform-canvas" width={600} height={90} />
        )}

        {(phase === 'idle' || phase === 'recorded') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <Volume2 size={24} />
            <span>{phase === 'idle' ? 'Click "Start Prep" or "Record Now" below' : 'Audio recorded successfully'}</span>
          </div>
        )}
      </div>

      {/* Live Transcript Box (Speech to Text) */}
      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          minHeight: '60px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Live Speech-To-Text Preview:
        </div>
        <div style={{ fontSize: '0.95rem', color: liveTranscript ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: liveTranscript ? 'normal' : 'italic' }}>
          {liveTranscript || (phase === 'recording' ? 'Listening to your voice...' : 'Transcript will appear here as you speak.')}
        </div>
      </div>

      {/* Audio Player (Hidden or visible when recorded) */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {phase === 'idle' && (
          <>
            {prepTimeSeconds > 0 && (
              <button className="btn btn-secondary" onClick={startPrep}>
                Start Preparation ({prepTimeSeconds}s)
              </button>
            )}
            <button className="btn btn-primary" onClick={startRecording}>
              <Mic size={18} /> Record Now
            </button>
          </>
        )}

        {phase === 'prep' && (
          <button className="btn btn-primary" onClick={startRecording}>
            <Mic size={18} /> Skip Prep & Record Now
          </button>
        )}

        {phase === 'recording' && (
          <button className="btn btn-primary recording-active" onClick={stopRecording}>
            <Square size={18} /> Stop Recording
          </button>
        )}

        {phase === 'recorded' && (
          <>
            <button className="btn btn-secondary" onClick={togglePlayback}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pause Playback' : 'Listen to Recording'}
            </button>

            <button className="btn btn-secondary" onClick={resetRecording}>
              <RotateCcw size={18} /> Re-record
            </button>

            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>Evaluating with AI...</>
              ) : (
                <>
                  <Send size={18} /> Submit for AI Assessment
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
