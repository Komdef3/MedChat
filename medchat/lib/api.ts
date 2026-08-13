export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4003';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  summary: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── token helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('medchat_token') : null;

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('medchat_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const saveAuth = (token: string, user: AuthUser) => {
  localStorage.setItem('medchat_token', token);
  localStorage.setItem('medchat_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('medchat_token');
  localStorage.removeItem('medchat_user');
};

// ── fetch wrapper that injects Bearer token ──────────────────────────────────
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
  }
  return res;
}

// ── api object ───────────────────────────────────────────────────────────────
export const api = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Registration failed');
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Login failed');
    return data;
  },

  async getAllSessions(): Promise<ChatSession[]> {
    const res = await authFetch(`${BACKEND_URL}/api/session`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const res = await authFetch(`${BACKEND_URL}/api/chat/${sessionId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(sessionId: string, message: string): Promise<{ reply: string; timestamp: string }> {
    const res = await authFetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, message }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
};

