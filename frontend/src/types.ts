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

export type ProjectStatus = 'active' | 'in review' | 'on hold' | 'complete';

export interface ProjectOut {
  id: string;
  code: string;
  name: string;
  team: string;
  description: string | null;
  progress: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  code?: string;
  name: string;
  team?: string;
  description?: string;
  progress?: number;
  status?: ProjectStatus;
}

export interface ProjectUpdate {
  name?: string;
  team?: string;
  description?: string;
  progress?: number;
  status?: ProjectStatus;
}

export interface ReportOut {
  id: string;
  code: string;
  title: string;
  content: string | null;
  summary: string | null;
  done: string | null;
  issue: string | null;
  next_plan: string | null;
  status: string;
  project_id: string | null;
  author_email: string | null;
  author_name: string | null;
  work_date: string | null;
  review_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ReportCreate {
  title: string;
  content?: string;
  project_id?: string;
  work_date?: string;
  summary?: string;
  done?: string;
  issue?: string;
  next_plan?: string;
}

export interface ReportUpdate extends Partial<ReportCreate> {}

export interface ScheduleEventOut {
  id: string;
  title: string;
  event_date: string;  // YYYY-MM-DD
  hour: string;
}

export interface ScheduleEventCreate {
  title: string;
  event_date: string;
  hour?: string;
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

export interface DashboardStat {
  key: string;
  value: number | string;
  suffix: string;
}

export interface TeamCapacity {
  label: string;
  value: number;
}

export interface DashboardActivity {
  time: string;
  actor: string;
  action: string;
  target: string;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  capacity: TeamCapacity[];
  activities: DashboardActivity[];
}
