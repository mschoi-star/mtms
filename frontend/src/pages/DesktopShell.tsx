import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MenuBar } from '../components/layout/MenuBar';
import { BrowserWindow } from '../components/layout/BrowserWindow';
import { HamsterRun } from '../components/HamsterRun';
import { APP_REGISTRY } from '../apps/registry';
import type { AppId, Tab, User } from '../types';

interface DesktopShellProps {
  user: User;
  onSignOut: () => void;
}

export const DesktopShell = ({ user, onSignOut }: DesktopShellProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<AppId | null>(null);

  const openApp = (id: AppId) => {
    setTabs((prev) => {
      if (prev.find((t) => t.id === id)) {
        setActiveId(id);
        return prev;
      }
      const meta = APP_REGISTRY[id];
      setActiveId(id);
      return [...prev, { id, ...meta }];
    });
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (activeId === id) {
        setActiveId(next.length === 0 ? null : next[Math.max(0, idx - 1)].id);
      }
      return next;
    });
  };

  useEffect(() => {
    openApp('dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openIds = tabs.map((t) => t.id);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#ffffff' }}>
      <Sidebar openIds={openIds} onOpen={openApp} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MenuBar
          activeId={activeId}
          tabCount={tabs.length}
          user={user}
          onSignOut={onSignOut}
        />

        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: '#ffffff',
            backgroundImage: `
              linear-gradient(#f3eee2 1px, transparent 1px),
              linear-gradient(90deg, #f3eee2 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        >
          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 22,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10.5,
              color: '#4a5160',
              letterSpacing: 1.6,
              textAlign: 'right',
              zIndex: 0,
            }}
          >
            MPSE TOTAL MANAGER SYSTEM
            <br />
            <span style={{ color: '#c8a57a' }}>──</span> v2.6.1 · build 240513
          </div>

          <HamsterRun />

          <BrowserWindow
            tabs={tabs}
            activeId={activeId}
            onActivate={(id) => setActiveId(id as AppId)}
            onClose={closeTab}
          />
        </div>
      </main>
    </div>
  );
};
