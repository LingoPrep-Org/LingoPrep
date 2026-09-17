import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Mic, FileText, BarChart2, ShieldCheck, ArrowRight,
  Brain, Award, CheckCircle2, Headphones, PlayCircle
} from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string, questionId?: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
      {/* Hero Section */}
      <section
        className="glass-card"
        style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, rgba(16, 21, 34, 0.8) 70%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div
          className="badge"
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            marginBottom: '20px',
          }}
        >
          <Sparkles size={14} /> AI-Powered Formative Assessment • IELTS & Aptis ESOL
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '900px',
            margin: '0 auto 20px',
          }}
        >
          Master IELTS & Aptis <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Speaking & Writing</span> with Instant AI Feedback
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 36px',
          }}
        >
          Practice authentic exam tasks with real-time browser audio recording, live transcription,
          examiner-grade rubric evaluation, and transparent Teacher Review verification.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1.05rem' }}
            onClick={() => onNavigate('questions')}
          >
            Explore Question Bank <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem' }}
            onClick={() => onNavigate('tutor')}
          >
            <Headphones size={18} /> AI Speaking Partner
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '50px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '30px',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-heading)' }}>
              &lt; 15s
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Instant AI Rubric Evaluation</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
              4 Criteria
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>IELTS & Aptis CEFR Breakdown</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
              Dual-Check
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI Feedback + Teacher Override</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-heading)' }}>
              Band 8.5+
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Model High-Scoring Samples</div>
          </div>
        </div>
      </section>

      {/* 2 Exam Pillars: IELTS & Aptis */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Designed Specifically for Your Exam Format</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            LingoPrep is not a generic English chatbot; it strictly mirrors official Cambridge & British Council task structures.
          </p>
        </div>

        <div className="grid-2">
          {/* IELTS Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-ielts">IELTS Academic & General</span>
              <Award size={24} color="#f87171" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>IELTS Speaking & Writing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Complete coverage of Speaking Part 1, Part 2 (Cue Card), Part 3 (Discussion), Writing Task 1 (Data & Charts), and Writing Task 2 (Discursive Essays).
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> 4 Official Criteria: FC, LR, GRA, PR / TR, CC, LR, GRA
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Accurate 0.5 step Band Scoring (Band 4.0 to 9.0)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Timed Prep countdowns and strict word limit benchmarks
              </li>
            </ul>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('questions')}
            >
              Browse IELTS Tasks
            </button>
          </div>

          {/* Aptis Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-aptis">British Council Aptis ESOL</span>
              <Award size={24} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Aptis General Skills</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Tailored workflow for Aptis computer-based test tasks: Picture Description, Photograph Comparisons, Club Social Interaction, and Formal/Informal Email register shifts.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> CEFR Benchmark Alignment (A1, A2, B1, B2, C1/C2)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> High-resolution photographic stimulus support
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Strict 30s / 45s audio pacing signals and word constraints
              </li>
            </ul>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('questions')}
            >
              Browse Aptis Tasks
            </button>
          </div>
        </div>
      </section>

      {/* Core Workflow Steps */}
      <section className="glass-card" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '36px' }}>
          Formative Practice Workflow: Closed-Loop Learning
        </h2>

        <div className="grid-4">
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <FileText size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>1. Select & Practice</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Choose targeted tasks by part, topic, or difficulty. Record audio or type essays directly.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(168, 85, 247, 0.2)',
                color: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Brain size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>2. AI Evaluation</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              AI engine processes grammar, vocabulary, fluency, pronunciation signals, and task response.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <BarChart2 size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>3. Detailed Report</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Review inline diff corrections, vocabulary upgrades, band breakdown, and Band 8.5 model answers.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>4. Teacher Review</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Request certified teacher review to audit AI scores and receive personalized human coaching.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
