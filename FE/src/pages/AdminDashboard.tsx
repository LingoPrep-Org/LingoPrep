import React, { useState, useEffect } from 'react';
import { User, UserRole, Question, ExamType, SkillType } from '../types';
import { api } from '../services/api';
import {
  ShieldAlert, Users, BookOpen, BarChart3, PlusCircle,
  CheckCircle2, Server, Key, Cpu
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New question form modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExam, setNewExam] = useState<ExamType>('IELTS');
  const [newSkill, setNewSkill] = useState<SkillType>('WRITING');
  const [newPart, setNewPart] = useState('Task 2');
  const [newPrompt, setNewPrompt] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(2400);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, role: UserRole) => {
    try {
      await api.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      alert('User role updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createQuestion({
        title: newTitle,
        exam_type: newExam,
        skill: newSkill,
        part: newPart,
        prompt: newPrompt,
        instructions: newInstructions,
        time_limit_seconds: Number(newTimeLimit),
        difficulty: 'Medium',
      });
      alert('New question added to Question Bank!');
      setShowAddModal(false);
      setNewTitle('');
      setNewPrompt('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create question');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Administration Portal...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Administration Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            System configuration, user role management, and question bank maintenance.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={18} /> Add New Question
        </button>
      </div>

      {/* System Stats Bar */}
      <div className="grid-4">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Users size={28} color="#6366f1" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL USERS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_users || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BookOpen size={28} color="#a855f7" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUESTIONS IN BANK</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_questions || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BarChart3 size={28} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SUBMISSIONS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_submissions || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Cpu size={28} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI GATEWAY</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              ● {stats?.ai_gateway_provider?.toUpperCase()} MODE
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats?.gemini_configured ? 'Gemini: Active' : 'Offline NLP: Active'}
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>User Role Management</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>User ID</th>
                <th style={{ padding: '12px 14px' }}>Full Name</th>
                <th style={{ padding: '12px 14px' }}>Email</th>
                <th style={{ padding: '12px 14px' }}>Target Score</th>
                <th style={{ padding: '12px 14px' }}>Assigned Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '14px', fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '14px' }}>
                    {u.target_exam} ({u.target_score})
                  </td>
                  <td style={{ padding: '14px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-glass)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <option value="LEARNER">LEARNER</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Add Question to Question Bank</h2>

            <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Exam:</label>
                  <select
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white' }}
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="APTIS">APTIS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Skill:</label>
                  <select
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white' }}
                  >
                    <option value="SPEAKING">SPEAKING</option>
                    <option value="WRITING">WRITING</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Part/Task:</label>
                  <input
                    type="text"
                    required
                    value={newPart}
                    onChange={(e) => setNewPart(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Question Prompt:</label>
                <textarea
                  rows={4}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Instructions:</label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
