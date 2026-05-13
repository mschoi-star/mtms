import type { AppId, Tab } from '../types';
import { DashboardApp } from './DashboardApp';
import { ProjectsApp } from './ProjectsApp';
import { ReportsApp } from './ReportsApp';
import { ScheduleApp } from './ScheduleApp';
import { InboxApp } from './InboxApp';
import { TeamApp } from './TeamApp';
import { FilesApp } from './FilesApp';
import { SettingsApp } from './SettingsApp';

type AppMeta = Omit<Tab, 'id'>;

export const APP_REGISTRY: Record<AppId, AppMeta> = {
  dashboard: { title: 'Dashboard', url: 'home/dashboard',     content: <DashboardApp /> },
  projects:  { title: 'Projects',  url: 'work/projects',      content: <ProjectsApp /> },
  reports:   { title: 'Reports',   url: 'analytics/reports',  content: <ReportsApp /> },
  schedule:  { title: 'Schedule',  url: 'plan/schedule',      content: <ScheduleApp /> },
  inbox:     { title: 'Inbox',     url: 'comms/inbox',        content: <InboxApp /> },
  team:      { title: 'Team',      url: 'org/team',           content: <TeamApp /> },
  files:     { title: 'Files',     url: 'storage/files',      content: <FilesApp /> },
  settings:  { title: 'Settings',  url: 'system/settings',    content: <SettingsApp /> },
};
