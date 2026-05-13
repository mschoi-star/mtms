import { useState } from 'react';
import { Section } from '../components/ui/Section';

const ITEMS: [string, string, string][] = [
  ['notif', 'Desktop notifications', 'Show alerts when projects update'],
  ['dark',  'Dark window chrome',    'Use darker titlebars for all windows'],
  ['beta',  'Beta features',         'Enable in-development MTMS modules'],
];

export const SettingsApp = () => {
  const [acc, setAcc] = useState({ notif: true, dark: false, beta: true });

  return (
    <Section title="Settings" right="local">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ITEMS.map(([k, title, desc], i) => (
          <label
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderTop: i ? '1px dashed #d6d1c5' : 'none',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
              <div style={{ fontSize: 11.5, color: '#4a5160' }}>{desc}</div>
            </div>
            <div
              onClick={() => setAcc((prev) => ({ ...prev, [k]: !prev[k as keyof typeof prev] }))}
              style={{
                width: 40,
                height: 22,
                border: '1.5px solid #1f2430',
                background: acc[k as keyof typeof acc] ? '#c8a57a' : '#ffffff',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 1,
                  left: acc[k as keyof typeof acc] ? 19 : 1,
                  width: 17,
                  height: 17,
                  background: '#1f2430',
                  transition: 'left 120ms ease',
                }}
              />
            </div>
          </label>
        ))}
      </div>
    </Section>
  );
};
