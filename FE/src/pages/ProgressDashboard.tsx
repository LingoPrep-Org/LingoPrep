import React, { useState, useEffect } from 'react';
import { LearnerDashboardStats, Submission, Question } from '../types';
import { api } from '../services/api';
import { RadarChart } from '../components/RadarChart';
import { HistoryChart } from '../components/HistoryChart';
import { ScoreBadge } from '../components/ScoreBadge';
import {
  BarChart3, Flame, Clock, Award, TrendingUp, CheckCircle,
  Mic, FileText, ArrowRight, BookOpen
} from 'lucide-react';

interface ProgressDashboardProps {
  onViewSubmission: (submissionId: number) => void;
  onStartPractice: (question: Question) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onViewSubmission,
  onStartPractice,
}) => {
  const [stats, setStats] = useState<LearnerDashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashData, subsData] = await Promise.all([
        api.getLearnerDashboard(),
        api.getMySubmissions(),
      ]);
      setStats(dashData);
      setSubmissions(subsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        Loading your learning progress...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Learning Progress & Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track your formative progression across IELTS & Aptis speaking and writing criteria.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid-4">
        {/* Average Band Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT AVERAGE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                Band {stats.average_band.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {stats.cefr_level}
              </span>
            </div>
          </div>
        </div>

        {/* Submissions count */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-secondary)',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SUBMISSIONS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {stats.total_submissions}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.speaking_count} Speaking • {stats.writing_count} Writing
            </div>
          </div>
        </div>

        {/* Practice Streak */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRACTICE STREAK</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {stats.current_streak_days} <span style={{ fontSize: '1rem', fontWeight: 600 }}>days</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Keep going!</div>
          </div>
        </div>

        {/* Total Time */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIME PRACTICED</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {stats.total_practiced_minutes} <span style={{ fontSize: '1rem', fontWeight: 600 }}>mins</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peak Band: {stats.highest_band.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Visual Charts (Radar & Line Trend) */}
      <div className="grid-2">
        {/* Radar Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>6-Criteria Skill Balance</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Identify your strengths and pinpoint areas needing targeted drill practice.
          </p>
          <RadarChart data={stats.skill_radar} size={320} />
        </div>

        {/* History Trend Line */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Score Progression History</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Historical band trajectory across all evaluated attempts.
          </p>
          <HistoryChart data={stats.trend_history} width={520} height={260} />
        </div>
      </div>

      {/* Recommended Practice Tasks */}
      {stats.recommended_questions && stats.recommended_questions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Recommended for Next Practice</h2>
          <div className="grid-3">
            {stats.recommended_questions.map((q) => (
              <div key={q.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span className={`badge ${q.exam_type === 'IELTS' ? 'badge-ielts' : 'badge-aptis'}`}>
                      {q.exam_type}
                    </span>
                    <span className="badge badge-writing">
                      {q.skill} • {q.part}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{q.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
                    {q.prompt.substring(0, 100)}...
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={() => onStartPractice(q)}>
                  Start This Task <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Submissions Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>All Attempt Records</h3>

        {submissions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No attempts recorded yet. Start practicing!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Exam & Task</th>
                  <th style={{ padding: '12px 14px' }}>Skill</th>
                  <th style={{ padding: '12px 14px' }}>Band Score</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  >
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>
                      {sub.question?.title || `Question #${sub.question_id}`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sub.question?.exam_type} • {sub.question?.part}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${sub.submission_type === 'SPEAKING' ? 'badge-speaking' : 'badge-writing'}`}>
                        {sub.submission_type === 'SPEAKING' ? <Mic size={12} /> : <FileText size={12} />}
                        {sub.submission_type}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {sub.assessment ? (
                        <ScoreBadge band={sub.assessment.overall_band} cefr={sub.assessment.overall_cefr} size="sm" showLabel={false} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: sub.teacher_review ? '#34d399' : sub.status === 'REVIEW_REQUESTED' ? '#fbbf24' : '#818cf8',
                        }}
                      >
                        {sub.teacher_review ? 'Reviewed' : sub.status === 'REVIEW_REQUESTED' ? 'In Queue' : 'Evaluated'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                        onClick={() => onViewSubmission(sub.id)}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
