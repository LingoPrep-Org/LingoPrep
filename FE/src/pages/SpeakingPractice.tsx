import React, { useState } from 'react';
import { Question, Submission } from '../types';
import { api } from '../services/api';
import { AudioRecorder } from '../components/AudioRecorder';
import { ArrowLeft, Clock, Info, Sparkles, Mic, HelpCircle } from 'lucide-react';

interface SpeakingPracticeProps {
  question: Question;
  onBack: () => void;
  onAssessmentCompleted: (submission: Submission) => void;
}

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({
  question,
  onBack,
  onAssessmentCompleted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitAudio = async (
    audioBlob: Blob | undefined,
    durationSeconds: number,
    transcript: string
  ) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const submission = await api.submitSpeaking(
        question.id,
        durationSeconds,
        transcript,
        audioBlob
      );
      onAssessmentCompleted(submission);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to evaluate audio submission. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Question Bank
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`badge ${question.exam_type === 'IELTS' ? 'badge-ielts' : 'badge-aptis'}`}>
            {question.exam_type}
          </span>
          <span className="badge badge-speaking">
            <Mic size={12} /> {question.part}
          </span>
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="glass-card" style={{ borderLeft: '4px solid #a855f7' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{question.title}</h2>

        <div
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            marginBottom: '20px',
            color: 'var(--text-primary)',
          }}
        >
          {question.prompt}
        </div>

        {/* Photographic stimulus for Aptis tasks */}
        {question.image_url && (
          <div style={{ marginBottom: '20px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '360px' }}>
            <img
              src={question.image_url}
              alt={question.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {question.instructions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Info size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{question.instructions}</div>
          </div>
        )}
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fda4af',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Audio Recorder Studio */}
      <AudioRecorder
        timeLimitSeconds={question.time_limit_seconds}
        prepTimeSeconds={question.prep_time_seconds}
        onSubmit={handleSubmitAudio}
        isSubmitting={isSubmitting}
      />

      {/* Submitting Loading Overlay Banner */}
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
          <h3 style={{ marginBottom: '8px' }}>AI Speech Assessment in Progress...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Transcribing audio signals, computing speaking rate (WPM), and scoring Fluency, Pronunciation, Grammar, and Lexical Resource.
          </p>
        </div>
      )}
    </div>
  );
};
