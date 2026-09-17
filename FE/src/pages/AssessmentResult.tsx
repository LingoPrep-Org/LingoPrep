import React, { useState } from 'react';
import { Submission } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { RadarChart } from '../components/RadarChart';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, CheckCircle2, AlertCircle, Sparkles, UserCheck,
  BookOpen, Volume2, FileText, Lightbulb, Share2, HelpCircle
} from 'lucide-react';

interface AssessmentResultProps {
  submission: Submission;
  onBack: () => void;
  onRefresh: (updatedSub: Submission) => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  submission,
  onBack,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'original' | 'model' | 'recommendations'>('feedback');
  const [isRequestingReview, setIsRequestingReview] = useState<boolean>(false);
  const [reviewRequestedSuccess, setReviewRequestedSuccess] = useState<boolean>(false);

  const assessment = submission.assessment;
  const review = submission.teacher_review;

  // Trigger confetti if high band score
  React.useEffect(() => {
    if (assessment && assessment.overall_band >= 7.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [assessment]);

  if (!assessment) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Assessment In Progress or Pending</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          This submission is currently in status: <strong>{submission.status}</strong>.
        </p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  const handleRequestReview = async () => {
    setIsRequestingReview(true);
    try {
      await api.requestTeacherReview(submission.id);
      setReviewRequestedSuccess(true);
      const updated = await api.getSubmission(submission.id);
      onRefresh(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to request teacher review');
    } finally {
      setIsRequestingReview(false);
    }
  };

  // Prepare radar data
  const radarData = [
    { skill_name: 'Task Response', score: assessment.task_response_score || assessment.overall_band, max_score: 9.0 },
    { skill_name: 'Coherence', score: assessment.coherence_score || assessment.overall_band, max_score: 9.0 },
    { skill_name: 'Lexical Resource', score: assessment.lexical_score || assessment.overall_band, max_score: 9.0 },
    { skill_name: 'Grammar', score: assessment.grammar_score || assessment.overall_band, max_score: 9.0 },
  ];

  if (submission.submission_type === 'SPEAKING') {
    radarData[0] = { skill_name: 'Fluency', score: assessment.fluency_score || assessment.overall_band, max_score: 9.0 };
    radarData[1] = { skill_name: 'Pronunciation', score: assessment.pronunciation_score || assessment.overall_band, max_score: 9.0 };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-ielts">{submission.question?.exam_type || 'IELTS'}</span>
          <span className="badge badge-writing">{submission.submission_type}</span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: review ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
              color: review ? '#34d399' : '#818cf8',
            }}
          >
            {review ? '✓ Teacher Reviewed' : submission.status === 'REVIEW_REQUESTED' ? '⏳ Review Queued' : '🤖 AI Evaluated'}
          </span>
        </div>
      </div>

      {/* Hero Score Banner */}
      <div
        className="glass-card"
        style={{
          padding: '36px 40px',
          background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.18) 0%, rgba(16, 21, 34, 0.9) 70%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '30px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            ASSESSMENT REPORT • {new Date(assessment.evaluated_at).toLocaleDateString()}
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '14px', lineHeight: 1.2 }}>
            {submission.question?.title || 'Practice Task Evaluation'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Evaluated by LingoPrep AI Engine according to official Cambridge & British Council band descriptors.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <ScoreBadge band={assessment.overall_band} cefr={assessment.overall_cefr} size="lg" />
            {review && review.is_overridden && (
              <span style={{ fontSize: '0.85rem', color: '#38bdf8', background: 'rgba(14,165,233,0.15)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
                Teacher adjusted: Band {review.overall_band} ({review.overall_cefr})
              </span>
            )}
          </div>
        </div>

        {/* Radar Chart in Hero */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RadarChart data={radarData} size={280} />
        </div>
      </div>

      {/* Teacher Review Alert / Request Block */}
      {review ? (
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid #10b981',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <UserCheck size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', color: '#34d399' }}>Certified Examiner Review Completed</h3>
          </div>
          <p style={{ fontStyle: 'italic', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '12px' }}>
            "{review.teacher_notes}"
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Reviewed by: <strong>{review.teacher_name || 'Senior IELTS/Aptis Examiner'}</strong> • Status: Verified
          </div>
        </div>
      ) : submission.status === 'REVIEW_REQUESTED' || reviewRequestedSuccess ? (
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.08)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h4 style={{ color: '#fbbf24', marginBottom: '4px' }}>Teacher Review Requested</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your submission is in the teacher grading queue. An examiner will verify your score shortly.
            </p>
          </div>
          <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            In Queue
          </span>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '20px 28px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Want a Certified Teacher to Double-Check?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Request a certified human examiner to review your attempt, audit AI feedback, and provide personalized tips.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleRequestReview}
            disabled={isRequestingReview}
          >
            <UserCheck size={16} /> {isRequestingReview ? 'Queuing...' : 'Request Teacher Review'}
          </button>
        </div>
      )}

      {/* Criteria Breakdown Grid */}
      <div className="grid-4">
        {assessment.criteria_breakdown &&
          Object.entries(assessment.criteria_breakdown).map(([key, item]: [string, any]) => (
            <div key={key} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.95rem' }}>
                  {key.replace('_', ' ')}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    fontSize: '1.15rem',
                  }}
                >
                  {item.score?.toFixed(1) || assessment.overall_band.toFixed(1)}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.feedback}
              </p>
            </div>
          ))}
      </div>

      {/* Navigation Tabs for Detailed Analysis */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('feedback')}
        >
          <Lightbulb size={16} /> Strengths & Inline Corrections
        </button>
        <button
          className={`btn ${activeTab === 'original' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('original')}
        >
          {submission.submission_type === 'SPEAKING' ? <Volume2 size={16} /> : <FileText size={16} />}
          Your Submission
        </button>
        <button
          className={`btn ${activeTab === 'model' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('model')}
        >
          <BookOpen size={16} /> Band 8.5+ Model Answer
        </button>
        <button
          className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles size={16} /> Study Action Plan
        </button>
      </div>

      {/* Tab 1: Feedback & Inline Corrections */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Strengths & Weaknesses */}
          <div className="grid-2">
            <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#34d399' }}>
                <CheckCircle2 size={18} /> What You Did Well (Strengths)
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {assessment.strengths?.map((s, idx) => (
                  <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#10b981' }}>•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#fbbf24' }}>
                <AlertCircle size={18} /> Areas for Growth (Weaknesses)
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {assessment.weaknesses?.map((w, idx) => (
                  <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#f59e0b' }}>•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inline Linguistic Diff Corrections */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>
              Grammar & Vocabulary Upgrades (Sentence-by-Sentence)
            </h3>

            {assessment.inline_feedback && assessment.inline_feedback.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assessment.inline_feedback.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                        {item.category || 'Language Accuracy'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>
                        YOUR PHRASING:
                      </span>
                      <span className="diff-del">{item.original}</span>
                    </div>

                    <div style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>
                        ACADEMIC BAND 8.5 UPGRADE:
                      </span>
                      <span className="diff-add">{item.improved}</span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', borderTop: '1px solid var(--border-color)', paddingTop: '8px', margin: 0 }}>
                      <strong>Why this helps:</strong> {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No major grammatical mistakes detected!</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Candidate's Original Submission */}
      {activeTab === 'original' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>Candidate Response</h3>

          {submission.audio_path && (
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Recorded Audio ({submission.duration_seconds} seconds):
              </div>
              <audio controls src={`http://localhost:8000${submission.audio_path}`} style={{ width: '100%' }} />
            </div>
          )}

          <div
            style={{
              padding: '20px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              lineHeight: 1.8,
              fontSize: '1.05rem',
              whiteSpace: 'pre-line',
            }}
          >
            {submission.content_text}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Word Count: <strong>{submission.word_count} words</strong></span>
            <span>Duration: <strong>{submission.duration_seconds}s</strong></span>
          </div>
        </div>
      )}

      {/* Tab 3: Model Answer */}
      {activeTab === 'model' && (
        <div className="glass-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Examiner Model Response (Band 8.5+ / CEFR C2)</h3>
            <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
              Benchmark Sample
            </span>
          </div>

          <div
            style={{
              padding: '24px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              lineHeight: 1.9,
              fontSize: '1.05rem',
              whiteSpace: 'pre-line',
              color: 'var(--text-primary)',
            }}
          >
            {assessment.model_answer || 'Model response currently generating for this task.'}
          </div>
        </div>
      )}

      {/* Tab 4: Study Action Plan */}
      {activeTab === 'recommendations' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>Personalized Next Steps & Drills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {assessment.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                    fontSize: '0.85rem',
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {rec}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
