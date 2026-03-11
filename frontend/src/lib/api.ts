const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smile_token');
        localStorage.removeItem('smile_user');
        window.location.href = '/login';
      }
    }
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role: string }) =>
    apiFetch<{ access_token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: (token: string) =>
    apiFetch<any>('/auth/me', { token }),

  updateProfile: (data: { name?: string; email?: string }, token: string) =>
    apiFetch<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  updatePassword: (data: { current_password: string; new_password: string }, token: string) =>
    apiFetch<any>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
};

// Prediction
export const predictAPI = {
  predict: (data: any, token: string) =>
    apiFetch<any>('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getHistory: (token: string) =>
    apiFetch<any[]>('/predict/history', { token }),

  getModelInfo: () =>
    apiFetch<any>('/predict/model-info'),
};

// Dashboard
export const dashboardAPI = {
  getStats: (token: string) =>
    apiFetch<any>('/dashboard/stats', { token }),

  getStudents: (token: string, riskFilter?: string) => {
    const query = riskFilter ? `?risk_filter=${riskFilter}` : '';
    return apiFetch<any[]>(`/dashboard/students${query}`, { token });
  },

  getStudentDetails: (id: number, token: string) =>
    apiFetch<any>(`/dashboard/student/${id}`, { token }),

  exportUserData: (token: string) => {
    return apiFetch<any>(`/dashboard/export`, { token });
  },

  getSystemUsers: (token: string) =>
    apiFetch<any[]>('/dashboard/admin/users', { token }),

  updateUserRole: (id: number, role: string, token: string) =>
    apiFetch<any>(`/dashboard/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
      token,
    }),

  getCounselors: (token: string) =>
    apiFetch<any[]>('/dashboard/admin/counselors', { token }),

  assignCounselor: (userId: number, counselorId: number | null, token: string) =>
    apiFetch<any>(`/dashboard/admin/users/${userId}/counselor`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselor_id: counselorId }),
      token,
    }),

  getMyWellness: (token: string) =>
    apiFetch<any>('/dashboard/my-wellness', { token }),
};

// Journal
export const journalAPI = {
  analyze: (data: { text_content: string; title?: string; self_reported_mood?: string }, token: string) =>
    apiFetch<any>('/journal', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getHistory: (token: string) =>
    apiFetch<any[]>('/journal/history', { token }),
};

// AI Insights
export const aiAPI = {
  chat: (question: string, token: string) =>
    apiFetch<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
      token,
    }),

  getInsights: (token: string) =>
    apiFetch<any>('/ai/insights', { token }),
};

// Counselor Management
export const counselorAPI = {
  getAll: (token: string) =>
    apiFetch<any[]>('/counselors', { token }),

  getMine: (token: string) =>
    apiFetch<any>('/counselors/my-counselor', { token }),

  rate: (data: { counselor_id: number; rating: number; feedback?: string }, token: string) =>
    apiFetch<any>('/counselors/rate', {
      method: 'POST',
      body: JSON.stringify(data),
      token
    }),

  logHelp: (data: { student_id: number; activity_type: string; notes?: string }, token: string) =>
    apiFetch<any>('/counselors/help', {
      method: 'POST',
      body: JSON.stringify(data),
      token
    }),
};

// Conversational AI
export const conversationAPI = {
  chat: (message: string, conversation_history: any[], token: string) =>
    apiFetch<any>('/conversation/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history }),
      token,
    }),

  extract: (conversation_history: any[], token: string) =>
    apiFetch<any>('/conversation/extract', {
      method: 'POST',
      body: JSON.stringify({ conversation_history }),
      token,
    }),
};
