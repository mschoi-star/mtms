import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Bar } from '../components/ui/Bar';
import { Tag } from '../components/ui/Tag';
import { projectsApi, teamApi } from '../services/api';
import type { ProjectOut, TeamMemberOut } from '../types';

// Capacity and activity remain static — no backend endpoint yet
const CAPACITY = [
  { label: 'Engineering', value: 84 },
  { label: 'Design',      value: 62 },
  { label: 'Operations',  value: 71 },
  { label: 'QA / Validation', value: 45 },
];

const ACTIVITY: [string, string, string, string][] = [
  ['09:42', 'Kim S.',  'closed',    'PRJ-204 · CAE postprocessor'],
  ['09:18', 'Lee J.',  'opened',    'PRJ-219 · meshing benchmarks'],
  ['08:55', 'Park H.', 'approved',  'RPT-118 · Q2 reliability'],
  ['08:30', 'Choi M.', 'commented', 'PRJ-201 · solver migration'],
];

export const DashboardApp = () => {
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [members, setMembers] = useState<TeamMemberOut[]>([]);

  useEffect(() => {
    projectsApi.list().then((r) => setProjects(r.data)).catch(() => {});
    teamApi.list().then((r) => setMembers(r.data)).catch(() => {});
  }, []);

  const active  = projects.filter((p) => p.status === 'active').length;
  const pending = projects.filter((p) => p.status === 'in review').length;
  const total   = projects.length;

  const stats = [
    { k: 'ACTIVE',  v: total   ? String(active)  : '—', s: 'projects' },
    { k: 'PENDING', v: total   ? String(pending)  : '—', s: 'reviews'  },
    { k: 'TEAM',    v: members.length ? String(members.length) : '—', s: 'members' },
    { k: 'UPTIME',  v: '99.8',  s: 'percent' },
  ];

  return (
    <div>
      <Section title="Overview" right="2026.05.13  ·  Wed">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {stats.map((c) => (
            <div
              key={c.k}
              style={{ border: '1.5px solid #1f2430', padding: '12px 14px', background: '#ffffff' }}
            >
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#4a5160' }}>{c.k}</div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginTop: 2 }}>
                {c.v}
              </div>
              <div style={{ fontSize: 10.5, color: '#4a5160' }}>{c.s}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Capacity by team" right="weekly">
        {CAPACITY.map((c) => (
          <Bar key={c.label} value={c.value} label={c.label} />
        ))}
      </Section>

      <Section title="Recent activity">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12.5 }}>
          {ACTIVITY.map((r, i) => (
            <li
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 90px 80px 1fr',
                padding: '8px 0',
                borderTop: i ? '1px dashed #d6d1c5' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4a5160' }}>
                {r[0]}
              </span>
              <span style={{ fontWeight: 600 }}>{r[1]}</span>
              <Tag tone={r[2] === 'approved' ? 'warm' : 'ink'}>{r[2]}</Tag>
              <span style={{ paddingLeft: 8 }}>{r[3]}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};
