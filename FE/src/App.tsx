import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { QuestionBank } from './pages/QuestionBank';
import { SpeakingPractice } from './pages/SpeakingPractice';
import { WritingPractice } from './pages/WritingPractice';
import { AssessmentResult } from './pages/AssessmentResult';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { TeacherQueue } from './pages/TeacherQueue';
import { AiTutorChat } from './pages/AiTutorChat';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Question, Submission } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  const handleStartPractice = (question: Question) => {
    setActiveQuestion(question);
    if (question.skill === 'SPEAKING') {
      setCurrentTab('speaking');
    } else {
      setCurrentTab('writing');
    }
  };

  const handleAssessmentCompleted = (submission: Submission) => {
    setActiveSubmission(submission);
    setCurrentTab('assessment');
  };

  const handleViewSubmission = async (submissionId: number) => {
    try {
      const sub = await api.getSubmission(submissionId);
      setActiveSubmission(sub);
      setCurrentTab('assessment');
    } catch (err) {
      console.error('Failed to load submission:', err);
    }
  };

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            onNavigate={(tab, qId) => {
              setCurrentTab(tab);
            }}
          />
        )}

        {currentTab === 'questions' && (
          <QuestionBank onStartPractice={handleStartPractice} />
        )}

        {currentTab === 'speaking' && activeQuestion && (
          <SpeakingPractice
            question={activeQuestion}
            onBack={() => setCurrentTab('questions')}
            onAssessmentCompleted={handleAssessmentCompleted}
          />
        )}

        {currentTab === 'writing' && activeQuestion && (
          <WritingPractice
            question={activeQuestion}
            onBack={() => setCurrentTab('questions')}
            onAssessmentCompleted={handleAssessmentCompleted}
          />
        )}

        {currentTab === 'assessment' && activeSubmission && (
          <AssessmentResult
            submission={activeSubmission}
            onBack={() => setCurrentTab('dashboard')}
            onRefresh={(updated) => setActiveSubmission(updated)}
          />
        )}

        {currentTab === 'dashboard' && (
          <ProgressDashboard
            onViewSubmission={handleViewSubmission}
            onStartPractice={handleStartPractice}
          />
        )}

        {currentTab === 'teacher_queue' && (
          <TeacherQueue onViewSubmission={handleViewSubmission} />
        )}

        {currentTab === 'tutor' && <AiTutorChat />}

        {currentTab === 'admin' && <AdminDashboard />}

        {currentTab === 'login' && (
          <Login onSuccess={() => setCurrentTab('home')} />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '24px 32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          background: 'var(--bg-glass)',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>LingoPrep</strong> • AI English Practice & Assessment Platform (IELTS & Aptis Speaking & Writing)
          </div>
          <div>
            Formative Assessment • PostgreSQL Database • Built with React & FastAPI
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
