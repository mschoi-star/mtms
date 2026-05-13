import { useState, useEffect } from 'react';
import type { AppId, User } from '../../types';

const APP_TITLES: Record<AppId, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  reports: 'Reports',
  schedule: 'Schedule',
  inbox: 'Inbox',
  team: 'Team',
  files: 'Files',
  settings: 'Settings',
};

interface MenuBarProps {
  activeId: AppId | null;
  tabCount: number;
  user: User | null;
  onSignOut: () => void;
}

export const MenuBar = ({ activeId, tabCount, user, onSignOut }: MenuBarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const focused = activeId ? APP_TITLES[activeId] : 'Desktop';

  return (
    <div
      style={{
        height: 28,
        flexShrink: 0,
        borderBottom: '1.5px solid #1f2430',
        background: '#1f2430',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: 1,
      }}
    >
      <span style={{ fontWeight: 700, marginRight: 18 }}>▚ MTMS</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>{focused}</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>File</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>View</span>
      <span style={{ opacity: 0.7 }}>Window</span>
      <div style={{ flex: 1 }} />
      <span style={{ opacity: 0.7, marginRight: 16 }}>
        {tabCount} tab{tabCount === 1 ? '' : 's'}
      </span>
      {user && (
        <button
          onClick={onSignOut}
          title="Sign out"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10.5,
            padding: '2px 8px',
            marginRight: 12,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          <span style={{ color: '#c8a57a', marginRight: 5 }}>●</span>
          {user.id} · sign out
        </button>
      )}
      <span>
        {time.toLocaleString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        })}
      </span>
    </div>
  );
};
