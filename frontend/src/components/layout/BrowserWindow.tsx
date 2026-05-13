import type { Tab } from '../../types';

const btnSm: React.CSSProperties = {
  width: 26,
  height: 26,
  border: '1.5px solid #1f2430',
  background: '#ffffff',
  fontSize: 13,
  lineHeight: '1',
  cursor: 'pointer',
  padding: 0,
  fontFamily: 'JetBrains Mono, monospace',
};

interface BrowserWindowProps {
  tabs: Tab[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}

export const BrowserWindow = ({ tabs, activeId, onActivate, onClose }: BrowserWindowProps) => {
  const active = tabs.find((t) => t.id === activeId);

  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        top: 20,
        right: 20,
        bottom: 200,
        background: '#ffffff',
        border: '1.5px solid #1f2430',
        boxShadow: '4px 4px 0 #1f2430, 0 24px 50px -20px rgba(31,36,48,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          height: 36,
          flexShrink: 0,
          borderBottom: '1.5px solid #1f2430',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          userSelect: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, #ffffff 0 3px, #f1ede3 3px 4px)',
        }}
      >
        <div style={{ display: 'flex', gap: 7 }}>
          {(['#c8a57a', '#ffffff', '#ffffff'] as const).map((color, i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: color,
                border: '1px solid #1f2430',
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: '#1f2430',
            letterSpacing: 1.4,
          }}
        >
          MTMS Browser — {active ? active.title : 'New Tab'}
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Tabs strip */}
      <div
        style={{
          flexShrink: 0,
          background: '#f1ede3',
          borderBottom: '1.5px solid #1f2430',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '8px 10px 0',
          gap: 2,
          overflowX: 'auto',
          minHeight: 38,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              onClick={() => onActivate(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px 7px 12px',
                background: isActive ? '#ffffff' : '#e6e1d2',
                border: '1.5px solid #1f2430',
                borderBottom: isActive ? '1.5px solid #ffffff' : '1.5px solid #1f2430',
                marginBottom: isActive ? -1.5 : 0,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                maxWidth: 200,
                position: 'relative',
                zIndex: isActive ? 2 : 1,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  background: isActive ? '#c8a57a' : '#1f2430',
                  border: '1px solid #1f2430',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t.id);
                }}
                style={{
                  marginLeft: 4,
                  width: 16,
                  height: 16,
                  border: '1px solid #1f2430',
                  background: isActive ? '#ffffff' : '#e6e1d2',
                  fontSize: 10,
                  lineHeight: '1',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        {tabs.length === 0 && (
          <div
            style={{
              padding: '8px 14px',
              fontSize: 11.5,
              color: '#4a5160',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            no tabs · open a module from the dock
          </div>
        )}
      </div>

      {/* URL bar */}
      <div
        style={{
          height: 42,
          flexShrink: 0,
          borderBottom: '1.5px solid #1f2430',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
        }}
      >
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={btnSm}>‹</button>
          <button style={btnSm}>›</button>
          <button style={btnSm}>↻</button>
        </div>
        <div
          style={{
            flex: 1,
            height: 26,
            border: '1.5px solid #1f2430',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: '#1f2430',
          }}
        >
          <span style={{ color: '#c8a57a', marginRight: 8, fontSize: 11 }}>▸</span>
          mtms://{active ? active.url : 'home'}
        </div>
        <button style={btnSm}>☆</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', background: '#ffffff' }}>
        {active ? (
          active.content
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#4a5160',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            — empty browser · pick a module —
          </div>
        )}
      </div>
    </div>
  );
};
