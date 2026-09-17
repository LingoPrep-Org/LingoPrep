import React, { useState, useEffect } from 'react';
import { Submission, TeacherReview } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import {
  UserCheck, ArrowLeft, Send, CheckCircle2, Clock,
  Mic, FileText, AlertCircle, Edit3, ShieldAlert
} from 'lucide-react';

interface TeacherQueueProps {
  onViewSubmission: (id: number) => void;
}

export const TeacherQueue: React.FC<TeacherQueueProps> = ({ onViewSubmission }) => {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [teacherBand, setTeacherBand] = useState<number>(7.0);
  const [teacherCefr, setTeacherCefr] = useState<string>('C1');
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getReviewQueue();
      setQueue(data);
      if (data.length > 0 && !selectedSub) {
        selectSubmission(data[0]);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    const aiBand = sub.assessment?.overall_band || 6.5;
    const aiCefr = sub.assessment?.overall_cefr || 'B2';
    setTeacherBand(sub.teacher_review?.overall_band || aiBand);
    setTeacherCefr(sub.teacher_review?.overall_cefr || aiCefr);
    setTeacherNotes(sub.teacher_review?.teacher_notes || '');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!teacherNotes.trim()) {
      alert('Please enter teacher feedback notes before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitTeacherReview(selectedSub.id, {
        overall_band: Number(teacherBand),
        overall_cefr: teacherCefr,
        teacher_notes: teacherNotes.trim(),
      });
      alert('Teacher review submitted successfully!');
      loadQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Teacher Review Queue</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Inspect candidate submissions, audit AI assessments, and provide certified human feedback.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading queue...
        </div>
      ) : queue.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <UserCheck size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
          <h3>All Caught Up!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            No submissions currently awaiting examiner review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '24px' }}>
          {/* Left Column: Submissions Queue List */}
          <div className="glass-card" style={{ padding: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', padding: '0 8px' }}>
              Submissions ({queue.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queue.map((item) => {
                const isSelected = selectedSub?.id === item.id;
                const isReviewRequested = item.status === 'REVIEW_REQUESTED';
                return (
                  <div
                    key={item.id}
                    onClick={() => selectSubmission(item)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'var(--bg-glass)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className={`badge ${item.question?.exam_type === 'IELTS' ? 'badge-ielts' : 'badge-aptis'}`}>
                        {item.question?.exam_type} • {item.question?.part}
                      </span>
                      {isReviewRequested && (
                        <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                          ● Urgent Review
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                      {item.question?.title || `Submission #${item.id}`}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>AI: Band {item.assessment?.overall_band.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Inspection & Grading Form */}
          {selectedSub && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
                    {selectedSub.question?.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-ielts">{selectedSub.question?.exam_type}</span>
                    <span className="badge badge-writing">{selectedSub.submission_type}</span>
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                      Status: {selectedSub.status}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => onViewSubmission(selectedSub.id)}
                  style={{ fontSize: '0.85rem' }}
                >
                  Open Full Learner Report
                </button>
              </div>

              {/* Candidate Submission View */}
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  CANDIDATE RESPONSE:
                </h4>
                {selectedSub.audio_path && (
                  <div style={{ marginBottom: '12px' }}>
                    <audio controls src={`http://localhost:8000${selectedSub.audio_path}`} style={{ width: '100%' }} />
                  </div>
                )}
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.98rem',
                    lineHeight: 1.7,
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedSub.content_text}
                </div>
              </div>

              {/* AI Assessment Baseline */}
              {selectedSub.assessment && (
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Baseline Evaluation</span>
                    <ScoreBadge
                      band={selectedSub.assessment.overall_band}
                      cefr={selectedSub.assessment.overall_cefr}
                      size="sm"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    {selectedSub.assessment.task_response_score && <span>TR: {selectedSub.assessment.task_response_score}</span>}
                    {selectedSub.assessment.coherence_score && <span>CC: {selectedSub.assessment.coherence_score}</span>}
                    {selectedSub.assessment.fluency_score && <span>FC: {selectedSub.assessment.fluency_score}</span>}
                    {selectedSub.assessment.lexical_score && <span>LR: {selectedSub.assessment.lexical_score}</span>}
                    {selectedSub.assessment.grammar_score && <span>GRA: {selectedSub.assessment.grammar_score}</span>}
                    {selectedSub.assessment.pronunciation_score && <span>PR: {selectedSub.assessment.pronunciation_score}</span>}
                  </div>
                </div>
              )}

              {/* Teacher Grading & Override Form */}
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} color="#10b981" /> Certified Examiner Grading & Feedback
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Overall Band Score:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="9.0"
                      value={teacherBand}
                      onChange={(e) => setTeacherBand(parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      CEFR Level:
                    </label>
                    <select
                      value={teacherCefr}
                      onChange={(e) => setTeacherCefr(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Examiner Notes & Guidance:
                  </label>
                  <textarea
                    rows={4}
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Provide constructive feedback, explain score adjustments, and give the student specific pointers for their next practice attempt..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      resize: 'vertical',
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ alignSelf: 'flex-start', padding: '12px 28px' }}
                >
                  <Send size={16} /> {isSubmitting ? 'Saving Review...' : 'Save & Certify Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
