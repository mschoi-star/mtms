import type { AppId } from '../../types';

const DashboardGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="4"  y="4"  width="10" height="10" fill="#1f2430" />
    <rect x="16" y="4"  width="10" height="6"  fill="#c8a57a" />
    <rect x="16" y="12" width="10" height="14" fill="#1f2430" />
    <rect x="4"  y="16" width="10" height="10" fill="#c8a57a" />
  </svg>
);

const ProjectsGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="3"  y="9"  width="24" height="17" fill="#c8a57a" stroke="#1f2430" strokeWidth="1.5"/>
    <rect x="3"  y="6"  width="11" height="5"  fill="#1f2430" />
  </svg>
);

const ReportsGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <line x1="5" y1="25" x2="25" y2="25" stroke="#1f2430" strokeWidth="1.5"/>
    <rect x="6"  y="16" width="4" height="9" fill="#1f2430" />
    <rect x="13" y="11" width="4" height="14" fill="#c8a57a" stroke="#1f2430" strokeWidth="1"/>
    <rect x="20" y="6"  width="4" height="19" fill="#1f2430" />
  </svg>
);

const ScheduleGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="4" y="6" width="22" height="20" fill="#ffffff" stroke="#1f2430" strokeWidth="1.5"/>
    <rect x="4" y="6" width="22" height="5" fill="#1f2430" />
    <circle cx="10" cy="17" r="1.7" fill="#c8a57a" />
    <circle cx="15" cy="17" r="1.7" fill="#1f2430" />
    <circle cx="20" cy="17" r="1.7" fill="#1f2430" />
    <circle cx="10" cy="22" r="1.7" fill="#1f2430" />
    <circle cx="15" cy="22" r="1.7" fill="#c8a57a" />
  </svg>
);

const InboxGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="4" y="7" width="22" height="16" fill="#c8a57a" stroke="#1f2430" strokeWidth="1.5"/>
    <polyline points="4,7 15,18 26,7" fill="none" stroke="#1f2430" strokeWidth="1.5"/>
  </svg>
);

const TeamGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <circle cx="11" cy="12" r="4" fill="#1f2430" />
    <circle cx="20" cy="13" r="3" fill="#c8a57a" stroke="#1f2430" strokeWidth="1"/>
    <rect x="4"  y="18" width="14" height="7" fill="#1f2430" />
    <rect x="16" y="19" width="10" height="6" fill="#c8a57a" stroke="#1f2430" strokeWidth="1"/>
  </svg>
);

const FilesGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="5" y="5" width="15" height="20" fill="#ffffff" stroke="#1f2430" strokeWidth="1.5"/>
    <rect x="10" y="8" width="15" height="20" fill="#c8a57a" stroke="#1f2430" strokeWidth="1.5"/>
    <line x1="13" y1="14" x2="22" y2="14" stroke="#1f2430" strokeWidth="1"/>
    <line x1="13" y1="18" x2="22" y2="18" stroke="#1f2430" strokeWidth="1"/>
    <line x1="13" y1="22" x2="19" y2="22" stroke="#1f2430" strokeWidth="1"/>
  </svg>
);

const SettingsGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="9" fill="#ffffff" stroke="#1f2430" strokeWidth="1.5"/>
    <circle cx="15" cy="15" r="3" fill="#c8a57a" stroke="#1f2430" strokeWidth="1"/>
    <rect x="14" y="3"  width="2" height="4" fill="#1f2430" />
    <rect x="14" y="23" width="2" height="4" fill="#1f2430" />
    <rect x="3"  y="14" width="4" height="2" fill="#1f2430" />
    <rect x="23" y="14" width="4" height="2" fill="#1f2430" />
  </svg>
);

const APPS: { id: AppId; name: string; glyph: React.ReactNode }[] = [
  { id: 'dashboard', name: 'Dashboard', glyph: <DashboardGlyph /> },
  { id: 'projects',  name: 'Projects',  glyph: <ProjectsGlyph /> },
  { id: 'reports',   name: 'Reports',   glyph: <ReportsGlyph /> },
  { id: 'schedule',  name: 'Schedule',  glyph: <ScheduleGlyph /> },
  { id: 'inbox',     name: 'Inbox',     glyph: <InboxGlyph /> },
  { id: 'team',      name: 'Team',      glyph: <TeamGlyph /> },
  { id: 'files',     name: 'Files',     glyph: <FilesGlyph /> },
  { id: 'settings',  name: 'Settings',  glyph: <SettingsGlyph /> },
];

interface ProgramIconProps {
  id: AppId;
  name: string;
  glyph: React.ReactNode;
  active: boolean;
  onOpen: (id: AppId) => void;
}

const ProgramIcon = ({ id, name, glyph, active, onOpen }: ProgramIconProps) => (
  <button
    onClick={() => onOpen(id)}
    style={{
      width: 92,
      padding: '10px 6px 8px',
      border: 'none',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      borderRadius: 14,
      outline: active ? '2px dashed #1f2430' : '2px dashed transparent',
      outlineOffset: -4,
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 16,
        background: '#ffffff',
        border: '1.5px solid #1f2430',
        boxShadow: active
          ? 'inset 0 0 0 3px #ffffff, 3px 3px 0 #1f2430'
          : 'inset 0 0 0 3px #ffffff, 2px 2px 0 #1f2430',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        transform: active ? 'translate(-1px,-1px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {glyph}
    </div>
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: '#1f2430',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '0 1px 0 #ffffff',
      }}
    >
      {name}
    </div>
  </button>
);

interface SidebarProps {
  openIds: AppId[];
  onOpen: (id: AppId) => void;
}

export const Sidebar = ({ openIds, onOpen }: SidebarProps) => (
  <aside
    style={{
      width: 116,
      height: '100%',
      flexShrink: 0,
      background: '#ffffff',
      borderRight: '1.5px solid #1f2430',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
      boxShadow: '2px 0 0 #1f2430, 6px 0 14px -8px rgba(31,36,48,0.25)',
    }}
  >
    <div
      style={{
        height: 44,
        borderBottom: '1.5px solid #1f2430',
        background: '#1f2430',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: 1.5,
      }}
    >
      ▚ MTMS
    </div>

    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 6px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
      }}
    >
      {APPS.map((a) => (
        <ProgramIcon
          key={a.id}
          id={a.id}
          name={a.name}
          glyph={a.glyph}
          active={openIds.includes(a.id)}
          onOpen={onOpen}
        />
      ))}
    </div>

    <div
      style={{
        borderTop: '1.5px solid #1f2430',
        padding: '8px 10px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: '#4a5160',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>v2.6.1</span>
      <span style={{ color: '#c8a57a' }}>●</span>
    </div>
  </aside>
);
