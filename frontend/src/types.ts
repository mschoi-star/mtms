export type AppId =
  | 'dashboard'
  | 'projects'
  | 'reports'
  | 'schedule'
  | 'inbox'
  | 'team'
  | 'files'
  | 'settings';

export interface Tab {
  id: AppId;
  title: string;
  url: string;
  content: React.ReactNode;
}

export interface User {
  id: string;      // email
  name: string;    // display name
  remember: boolean;
}

// ── API response types ──────────────────────────────────────────

export interface ProjectOut {
  id: string;
  code: string;
  name: string;
  team: string;
  description: string | null;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  code: string;
  name: string;
  team?: string;
  description?: string;
}

export interface ReportOut {
  id: string;
  code: string;
  title: string;
  content: string | null;
  status: string;
  project_id: string | null;
  created_at: string;
}

export interface ReportCreate {
  title: string;
  content?: string;
  project_id?: string;
}

export interface ScheduleEventOut {
  id: string;
  title: string;
  event_date: string;  // YYYY-MM-DD
  hour: string;
}

export interface MessageOut {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  is_unread: boolean;
  sent_at: string;
}

export interface TeamMemberOut {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
}

export interface FileEntryOut {
  id: string;
  entry_type: string;
  name: string;
  path: string;
  size_label: string;
  modified_at: string;
}
