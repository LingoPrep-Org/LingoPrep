import {
  User, Question, Submission, Assessment, TeacherReview,
  ChatSession, ChatMessage, LearnerDashboardStats, NotificationItem,
  UserRole, ExamType, SkillType
} from '../types';

const API_BASE = 'http://localhost:8000/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('lingoprep_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('lingoprep_token', data.access_token);
    localStorage.setItem('lingoprep_user', JSON.stringify(data.user));
    return data;
  },

  async register(full_name: string, email: string, password: string, role: UserRole = 'LEARNER'): Promise<{ access_token: string; user: User }> {
    const data = await request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, role }),
    });
    localStorage.setItem('lingoprep_token', data.access_token);
    localStorage.setItem('lingoprep_user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  logout() {
    localStorage.removeItem('lingoprep_token');
    localStorage.removeItem('lingoprep_user');
  },

  // Questions
  async getQuestions(params?: { exam_type?: string; skill?: string; part?: string; difficulty?: string; search?: string }): Promise<Question[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return request<Question[]>(`/questions?${query.toString()}`);
  },

  async getQuestion(id: number): Promise<Question> {
    return request<Question>(`/questions/${id}`);
  },

  async createQuestion(data: Partial<Question>): Promise<Question> {
    return request<Question>('/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateQuestion(id: number, data: Partial<Question>): Promise<Question> {
    return request<Question>(`/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteQuestion(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/questions/${id}`, {
      method: 'DELETE',
    });
  },

  // Submissions
  async submitWriting(questionId: number, contentText: string): Promise<Submission> {
    return request<Submission>('/submissions/writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, content_text: contentText }),
    });
  },

  async submitSpeaking(questionId: number, durationSeconds: number, transcript?: string, audioBlob?: Blob): Promise<Submission> {
    const formData = new FormData();
    formData.append('question_id', questionId.toString());
    formData.append('duration_seconds', durationSeconds.toString());
    if (transcript) {
      formData.append('transcript', transcript);
    }
    if (audioBlob) {
      formData.append('audio_file', audioBlob, 'recording.webm');
    }

    const token = localStorage.getItem('lingoprep_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/submissions/speaking`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit speaking' }));
      throw new Error(err.detail || 'Failed to submit speaking');
    }

    return res.json();
  },

  async getMySubmissions(): Promise<Submission[]> {
    return request<Submission[]>('/submissions');
  },

  async getSubmission(id: number): Promise<Submission> {
    return request<Submission>(`/submissions/${id}`);
  },

  async requestTeacherReview(submissionId: number): Promise<{ message: string; status: string }> {
    return request<{ message: string; status: string }>(`/submissions/${submissionId}/request-review`, {
      method: 'POST',
    });
  },

  // Reviews (Teacher)
  async getReviewQueue(): Promise<Submission[]> {
    return request<Submission[]>('/reviews/queue');
  },

  async submitTeacherReview(submissionId: number, review: {
    overall_band: number;
    overall_cefr: string;
    criteria_scores?: Record<string, number>;
    teacher_notes: string;
  }): Promise<TeacherReview> {
    return request<TeacherReview>(`/reviews/${submissionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
  },

  // Dashboard
  async getLearnerDashboard(): Promise<LearnerDashboardStats> {
    return request<LearnerDashboardStats>('/dashboard/learner');
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/dashboard/notifications');
  },

  async markNotificationRead(id: number): Promise<{ status: string }> {
    return request<{ status: string }>(`/dashboard/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  // AI Tutor Chat
  async createChatSession(title: string, persona: string): Promise<ChatSession> {
    return request<ChatSession>('/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, persona }),
    });
  },

  async getChatSessions(): Promise<ChatSession[]> {
    return request<ChatSession[]>('/chat/sessions');
  },

  async getChatSession(id: number): Promise<ChatSession> {
    return request<ChatSession>(`/chat/sessions/${id}`);
  },

  async sendChatMessage(sessionId: number, content: string): Promise<ChatMessage> {
    return request<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  },

  // Admin
  async getAdminStats(): Promise<{
    total_users: number;
    total_questions: number;
    total_submissions: number;
    average_band: number;
    ai_gateway_provider: string;
    gemini_configured: boolean;
    openai_configured: boolean;
  }> {
    return request('/admin/stats');
  },

  async getAllUsers(): Promise<User[]> {
    return request<User[]>('/admin/users');
  },

  async updateUserRole(userId: number, role: UserRole): Promise<{ message: string; new_role: string }> {
    return request(`/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT',
    });
  },
};
