import React, { useState, useEffect } from 'react';
import { Question, Submission } from '../types';
import { api } from '../services/api';
import {
  ArrowLeft, Clock, FileText, Send, Sparkles, AlertTriangle,
  RotateCcw, Maximize2, Minimize2, CheckCircle2
} from 'lucide-react';

interface WritingPracticeProps {
  question: Question;
  onBack: () => void;
  onAssessmentCompleted: (submission: Submission) => void;
}

export const WritingPractice: React.FC<WritingPracticeProps> = ({
  question,
  onBack,
  onAssessmentCompleted,
}) => {
  const storageKey = `lingoprep_draft_${question.id}`;
  const [essayText, setEssayText] = useState<string>(() => {
    return localStorage.getItem(storageKey) || '';
  });
  const [timeLeft, setTimeLeft] = useState<number>(question.time_limit_seconds || 2400);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>('Saved');

  // Autosave to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(storageKey, essayText);
      setLastSaved('Autosaved');
    }, 1000);
    return () => clearTimeout(handler);
  }, [essayText, storageKey]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const words = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const minWords = question.min_words || (question.part.includes('Task 1') ? 150 : 250);
  const isLengthAdequate = words >= minWords;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear your current draft?')) {
      setEssayText('');
      localStorage.removeItem(storageKey);
    }
  };

  const handleSubmit = async () => {
    if (words < 10) {
      alert('Please write at least a few sentences before submitting for AI assessment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const submission = await api.submitWriting(question.id, essayText.trim());
      localStorage.removeItem(storageKey);
      onAssessmentCompleted(submission);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to evaluate essay. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      {!zenMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Question Bank
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`badge ${question.exam_type === 'IELTS' ? 'badge-ielts' : 'badge-aptis'}`}>
              {question.exam_type}
            </span>
            <span className="badge badge-writing">
              <FileText size={12} /> {question.part}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: timeLeft < 300 ? 'var(--accent-rose)' : 'var(--accent-primary)',
                background: 'var(--bg-glass)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={16} /> {formatTimer(timeLeft)}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace (Split Screen) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: zenMode ? '1fr' : 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Prompt & Instructions */}
        {!zenMode && (
          <div className="glass-card" style={{ borderLeft: '4px solid #10b981', maxHeight: '82vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '14px' }}>{question.title}</h2>

            <div style={{ fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {question.prompt}
            </div>

            {/* Stimulus diagram / chart if Task 1 */}
            {question.image_url && (
              <div style={{ marginBottom: '20px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={question.image_url}
                  alt={question.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain', background: '#000' }}
                />
              </div>
            )}

            {question.instructions && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <strong>Instructions:</strong> {question.instructions}
              </div>
            )}
          </div>
        )}

        {/* Right Column: Writing Editor & Word Counter */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '82vh' }}>
          {/* Editor Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '14px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: isLengthAdequate ? '#10b981' : '#f59e0b',
                  }}
                >
                  {words}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  / min {minWords} words
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {lastSaved}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 10px' }}
                onClick={() => setZenMode(!zenMode)}
                title={zenMode ? 'Exit Zen Mode' : 'Distraction-free Zen Mode'}
              >
                {zenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 10px' }}
                onClick={handleReset}
                title="Clear Draft"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Text Editor Area */}
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Type your essay or response here. Use clear paragraphs, relevant examples, and academic transition devices..."
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              padding: '8px 4px',
            }}
          />

          {/* Bottom Bar: Word Goal Progress & Submit */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '14px',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ width: '200px' }}>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (words / minWords) * 100)}%`,
                    background: isLengthAdequate ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '10px 24px' }}
            >
              {isSubmitting ? (
                <>
                  <Sparkles size={18} className="pulse-glow" /> AI Evaluating...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit for AI Assessment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Submitting Loading Overlay */}
      {isSubmitting && (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '30px',
            border: '1px solid var(--accent-primary)',
            background: 'rgba(99, 102, 241, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Sparkles size={32} className="pulse-glow" color="#818cf8" />
          </div>
          <h3 style={{ marginBottom: '8px' }}>Evaluating Essay with AI...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Checking Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy according to Cambridge Rubrics.
          </p>
        </div>
      )}
    </div>
  );
};
