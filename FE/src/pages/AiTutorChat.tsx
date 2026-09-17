import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { api } from '../services/api';
import {
  MessageSquare, Send, Mic, Volume2, Sparkles, User,
  Bot, RefreshCw, PlusCircle, Headphones
} from 'lucide-react';

export const AiTutorChat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [persona, setPersona] = useState<'IELTS_EXAMINER' | 'APTIS_INTERVIEWER' | 'CONVERSATION_PARTNER'>('IELTS_EXAMINER');
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Voice Input SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${text}` : text));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const loadSessions = async () => {
    try {
      const data = await api.getChatSessions();
      setSessions(data);
      if (data.length > 0) {
        const first = await api.getChatSession(data[0].id);
        setActiveSession(first);
      } else {
        createNewSession('IELTS_EXAMINER');
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  const createNewSession = async (
    chosenPersona: 'IELTS_EXAMINER' | 'APTIS_INTERVIEWER' | 'CONVERSATION_PARTNER' = persona
  ) => {
    try {
      const titles: Record<string, string> = {
        IELTS_EXAMINER: 'IELTS Speaking Simulation',
        APTIS_INTERVIEWER: 'Aptis Interview Practice',
        CONVERSATION_PARTNER: 'Casual English Chat',
      };
      const title = titles[chosenPersona] || 'Speaking Practice';
      const newSession = await api.createChatSession(title, chosenPersona);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistically append user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setActiveSession((prev) => prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : null);

    try {
      const aiReply = await api.sendChatMessage(activeSession.id, text);
      setActiveSession((prev) => {
        if (!prev) return null;
        // Replace or append
        return {
          ...prev,
          messages: [...prev.messages.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, aiReply],
        };
      });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '24px', height: '82vh' }}>
      {/* Left Sidebar: Sessions & Persona Selector */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>AI Tutor Room</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Interactive English conversation partner with real-time feedback.
          </p>
        </div>

        {/* Persona Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
            SELECT TUTOR ROLE:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'IELTS_EXAMINER', label: '🎓 IELTS Examiner' },
              { id: 'APTIS_INTERVIEWER', label: '💼 Aptis Interviewer' },
              { id: 'CONVERSATION_PARTNER', label: '☕ Casual English Partner' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const targetPersona = p.id as 'IELTS_EXAMINER' | 'APTIS_INTERVIEWER' | 'CONVERSATION_PARTNER';
                  setPersona(targetPersona);
                  createNewSession(targetPersona);
                }}
                className={`btn ${activeSession?.persona === p.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '8px 12px' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* New Session Button */}
        <button className="btn btn-secondary" onClick={() => createNewSession(persona)}>
          <PlusCircle size={16} /> New Session
        </button>

        {/* Previous Sessions */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            CONVERSATION HISTORY:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={async () => {
                  const full = await api.getChatSession(s.id);
                  setActiveSession(full);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: activeSession?.id === s.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Chat Conversation Stream */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>
                {activeSession?.persona === 'IELTS_EXAMINER' && 'IELTS Examiner Davis'}
                {activeSession?.persona === 'APTIS_INTERVIEWER' && 'Aptis Specialist Karen'}
                {activeSession?.persona === 'CONVERSATION_PARTNER' && 'Alex (Language Partner)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>● Active & Ready to Assist</div>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {activeSession?.messages?.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: isUser ? 'var(--gradient-primary)' : 'var(--bg-card-hover)',
                    color: '#ffffff',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    lineHeight: 1.6,
                    fontSize: '0.98rem',
                    position: 'relative',
                  }}
                >
                  {msg.content}

                  {/* Audio Listen button for assistant */}
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.content)}
                      style={{
                        position: 'absolute',
                        bottom: '-10px',
                        right: '10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        padding: '4px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                      title="Listen with Text-to-Speech"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>

                {/* Instant Micro-Correction / Tip */}
                {msg.corrections && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>
                      <strong>{msg.corrections.type}:</strong> {msg.corrections.tip}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${isListening ? 'btn-primary recording-active' : 'btn-secondary'}`}
            onClick={toggleVoiceInput}
            title={isListening ? 'Listening... click to stop' : 'Click to speak (Voice Input)'}
          >
            <Mic size={18} />
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening to your voice...' : 'Type your English response or query...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 18px',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSending || !inputText.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
