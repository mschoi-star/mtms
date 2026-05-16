import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Bar } from '../components/ui/Bar';
import { Tag } from '../components/ui/Tag';
import { dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';

const EMPTY_SUMMARY: DashboardSummary = {
  stats: [
    { key: 'ACTIVE', value: '—', suffix: 'projects' },
    { key: 'PENDING', value: '—', suffix: 'reports' },
    { key: 'UNREAD', value: '—', suffix: 'messages' },
    { key: 'TODAY', value: '—', suffix: 'reports' },
  ],
  capacity: [],
  activities: [],
};

export const DashboardApp = () => {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.summary()
      .then((r) => {
        setSummary(r.data);
        setError('');
      })
      .catch(() => setError('Dashboard data could not be loaded.'));
  }, []);

  return (
    <div>
      <Section title="Overview" right={new Date().toLocaleDateString('ko-KR')}>
        {error ? <p style={{ marginTop: 0, color: '#8a6a44', fontSize: 12 }}>{error}</p> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {summary.stats.map((c) => (
            <div
              key={c.key}
              style={{ border: '1.5px solid #1f2430', padding: '12px 14px', background: '#ffffff' }}
            >
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#4a5160' }}>{c.key}</div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginTop: 2 }}>
                {c.value}
              </div>
              <div style={{ fontSize: 10.5, color: '#4a5160' }}>{c.suffix}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Capacity by team" right="project share">
        {summary.capacity.length ? (
          summary.capacity.map((c) => <Bar key={c.label} value={c.value} label={c.label} />)
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: '#4a5160' }}>No project capacity data yet.</p>
        )}
      </Section>

      <Section title="Recent activity">
        {summary.activities.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12.5 }}>
            {summary.activities.map((r, i) => (
              <li
                key={`${r.time}-${r.target}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 110px 90px 1fr',
                  padding: '8px 0',
                  borderTop: i ? '1px dashed #d6d1c5' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4a5160' }}>
                  {r.time}
                </span>
                <span style={{ fontWeight: 600 }}>{r.actor}</span>
                <Tag tone={r.action === 'approved' ? 'warm' : 'ink'}>{r.action}</Tag>
                <span style={{ paddingLeft: 8 }}>{r.target}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: '#4a5160' }}>No recent activity yet.</p>
        )}
      </Section>
    </div>
  );
};
