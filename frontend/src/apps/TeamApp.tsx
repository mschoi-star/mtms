import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { teamApi } from '../services/api';
import type { TeamMemberOut } from '../types';

export const TeamApp = () => {
  const [members, setMembers] = useState<TeamMemberOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teamApi
      .list()
      .then((r) => setMembers(r.data))
      .catch(() => setError('팀 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <Section title="Team" right={`${members.length} members`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {members.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              border: '1.5px solid #1f2430',
              padding: 12,
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                border: '1.5px solid #1f2430',
                background: '#c8a57a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {p.name
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#4a5160' }}>
                {p.role} · {p.department}
              </div>
            </div>
            <Tag tone={p.status === 'online' ? 'warm' : 'ink'}>{p.status}</Tag>
          </div>
        ))}
      </div>
    </Section>
  );
};
