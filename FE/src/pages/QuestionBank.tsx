import React, { useState, useEffect } from 'react';
import { Question, ExamType, SkillType } from '../types';
import { api } from '../services/api';
import {
  Search, Filter, Mic, FileText, Clock, FileCheck, ArrowRight,
  Sparkles, Layers
} from 'lucide-react';

interface QuestionBankProps {
  onStartPractice: (question: Question) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ onStartPractice }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchQuestions();
  }, [examFilter, skillFilter, difficultyFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (examFilter !== 'ALL') params.exam_type = examFilter;
      if (skillFilter !== 'ALL') params.skill = skillFilter;
      if (difficultyFilter !== 'ALL') params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const data = await api.getQuestions(params);
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Question Bank</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Practice verified IELTS Academic/General & British Council Aptis ESOL Speaking and Writing tasks.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '320px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by topic, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Exam Type Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exam:</span>
          {['ALL', 'IELTS', 'APTIS'].map((e) => (
            <button
              key={e}
              onClick={() => setExamFilter(e)}
              className={`btn ${examFilter === e ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Skill Type Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skill:</span>
          {['ALL', 'SPEAKING', 'WRITING'].map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s)}
              className={`btn ${skillFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {s === 'SPEAKING' && <Mic size={14} />}
              {s === 'WRITING' && <FileText size={14} />}
              {s}
            </button>
          ))}
        </div>

        {/* Difficulty Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
          {['ALL', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`btn ${difficultyFilter === d ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Question Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading Question Bank...
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No questions found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: q.skill === 'SPEAKING' ? '3px solid #a855f7' : '3px solid #10b981',
              }}
            >
              <div>
                {/* Badges Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className={`badge ${q.exam_type === 'IELTS' ? 'badge-ielts' : 'badge-aptis'}`}>
                      {q.exam_type}
                    </span>
                    <span className={`badge ${q.skill === 'SPEAKING' ? 'badge-speaking' : 'badge-writing'}`}>
                      {q.skill === 'SPEAKING' ? <Mic size={12} /> : <FileText size={12} />}
                      {q.part}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {q.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{q.title}</h3>

                {/* Prompt Preview */}
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {q.prompt}
                </p>

                {/* Image Preview if available */}
                {q.image_url && (
                  <div style={{ marginBottom: '14px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '110px' }}>
                    <img
                      src={q.image_url}
                      alt={q.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Metadata */}
                <div style={{ display: 'flex', gap: '14px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {Math.round(q.time_limit_seconds / 60)} mins limit
                  </span>
                  {q.min_words && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileCheck size={14} /> Min {q.min_words} words
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => onStartPractice(q)}
              >
                {q.skill === 'SPEAKING' ? (
                  <>
                    <Mic size={16} /> Start Speaking Practice
                  </>
                ) : (
                  <>
                    <FileText size={16} /> Start Writing Practice
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
