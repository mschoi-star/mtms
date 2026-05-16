import axios from 'axios';
import type {
  ProjectOut, ProjectCreate, ReportOut, ReportCreate, ReportUpdate, ScheduleEventOut,
  ScheduleEventCreate, MessageOut, TeamMemberOut, FileEntryOut, DashboardSummary, ProjectUpdate,
} from '../types';

const TOKEN_KEY = 'mtms_token';
const USER_KEY  = 'mtms_user';

// ── Token persistence ────────────────────────────────────────────

export const saveSession = (token: string, user: { id: string; name: string }, remember: boolean) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): { id: string; name: string } | null => {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
  });
};

// ── Axios instance ───────────────────────────────────────────────

const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user_email: string; user_name: string }>(
      '/auth/login/json',
      { email, password },
    ),
};

// ── Dashboard ────────────────────────────────────────────────────
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary'),
};

// ── Projects ──────────────────────────────────────────────────────

export const projectsApi = {
  list: () => api.get<ProjectOut[]>('/projects'),
  create: (data: ProjectCreate) => api.post<ProjectOut>('/projects', data),
  update: (id: string, data: ProjectUpdate) =>
    api.patch<ProjectOut>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ── Reports ───────────────────────────────────────────────────────

export const reportsApi = {
  list: (projectId?: string) =>
    api.get<ReportOut[]>('/reports', projectId ? { params: { project_id: projectId } } : undefined),
  create: (data: ReportCreate) => api.post<ReportOut>('/reports', data),
  update: (id: string, data: ReportUpdate) => api.patch<ReportOut>(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  submit: (id: string) => api.post<ReportOut>(`/reports/${id}/submit`),
  approve: (id: string, comment?: string) => api.post<ReportOut>(`/reports/${id}/approve`, { comment }),
  reject: (id: string, comment?: string) => api.post<ReportOut>(`/reports/${id}/reject`, { comment }),
};

// ── Schedule ──────────────────────────────────────────────────────

export const scheduleApi = {
  getWeek: (weekStart: string) =>
    api.get<ScheduleEventOut[]>('/schedule', { params: { week: weekStart } }),
  create: (data: ScheduleEventCreate) => api.post<ScheduleEventOut>('/schedule', data),
};

// ── Inbox ─────────────────────────────────────────────────────────

export const inboxApi = {
  list: () => api.get<MessageOut[]>('/inbox'),
  markRead: (id: string) => api.patch<MessageOut>(`/inbox/${id}/read`),
};

// ── Team ──────────────────────────────────────────────────────────

export const teamApi = {
  list: () => api.get<TeamMemberOut[]>('/team'),
};

// ── Files ─────────────────────────────────────────────────────────

export const filesApi = {
  list: (path = '/') => api.get<FileEntryOut[]>('/files', { params: { path } }),
};

export default api;
