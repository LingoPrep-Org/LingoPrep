import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem, UserRole } from '../types';
import {
  Sparkles, BookOpen, Mic, FileText, BarChart3, MessageSquare,
  ShieldAlert, Bell, Sun, Moon, LogOut, CheckCircle, ChevronDown, UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, loginDemo, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((items) => setNotifications(items))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <div
        className="nav-brand"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectTab('home')}
      >
        <div
          style={{
            background: 'var(--gradient-primary)',
            borderRadius: '10px',
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Sparkles size={20} />
        </div>
        <span>LingoPrep</span>
        <span
          style={{
            fontSize: '0.65rem',
            background: 'rgba(99,102,241,0.2)',
            color: 'var(--accent-primary)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(99,102,241,0.3)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          AI Assessment
        </span>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul className="nav-links">
          <li>
            <button
              className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
              onClick={() => onSelectTab('home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'questions' ? 'active' : ''}`}
              onClick={() => onSelectTab('questions')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <BookOpen size={16} /> Question Bank
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onSelectTab('dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <BarChart3 size={16} /> Progress
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentTab === 'tutor' ? 'active' : ''}`}
              onClick={() => onSelectTab('tutor')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <MessageSquare size={16} /> AI Tutor
            </button>
          </li>

          {/* Teacher Review tab for TEACHER and ADMIN */}
          {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
            <li>
              <button
                className={`nav-link ${currentTab === 'teacher_queue' ? 'active' : ''}`}
                onClick={() => onSelectTab('teacher_queue')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <UserCheck size={16} /> Teacher Review
              </button>
            </li>
          )}

          {/* Admin tab */}
          {user?.role === 'ADMIN' && (
            <li>
              <button
                className={`nav-link ${currentTab === 'admin' ? 'active' : ''}`}
                onClick={() => onSelectTab('admin')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ShieldAlert size={16} /> Admin
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Demo Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Role: <strong style={{ color: 'var(--accent-primary)' }}>{user?.role || 'Guest'}</strong>
            <ChevronDown size={14} />
          </button>

          {showDemoMenu && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '210px',
                padding: '10px',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 8px' }}>
                SWITCH DEMO ACCOUNT:
              </div>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  loginDemo('LEARNER');
                  setShowDemoMenu(false);
                }}
              >
                🧑‍🎓 Learner (Alex)
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  loginDemo('TEACHER');
                  setShowDemoMenu(false);
                }}
              >
                👩‍🏫 Teacher (Sarah)
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '6px 10px' }}
                onClick={() => {
                  loginDemo('ADMIN');
                  setShowDemoMenu(false);
                }}
              >
                ⚡ Admin (System)
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--accent-rose)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                width: '320px',
                maxHeight: '380px',
                overflowY: 'auto',
                padding: '16px',
                zIndex: 200,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.1)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="btn btn-secondary"
          style={{ padding: '8px', borderRadius: '50%' }}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Info / Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
              alt={user.full_name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              onClick={logout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => onSelectTab('login')}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};
