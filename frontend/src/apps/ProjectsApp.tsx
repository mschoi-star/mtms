import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { projectsApi } from '../services/api';
import type { ProjectOut } from '../types';

export const ProjectsApp = () => {
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi
      .list()
      .then((r) => setProjects(r.data))
      .catch(() => setError('프로젝트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <div>
      <Section title="Projects" right={`${projects.length} items`}>
        <div style={{ border: '1.5px solid #1f2430' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 80px 140px 110px',
              background: '#1f2430',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: 10.5,
              letterSpacing: 1.5,
            }}
          >
            <span>ID</span>
            <span>NAME</span>
            <span>TEAM</span>
            <span>PROGRESS</span>
            <span>STATUS</span>
          </div>
          {projects.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 80px 140px 110px',
                padding: '10px 12px',
                fontSize: 12.5,
                alignItems: 'center',
                borderTop: i ? '1px solid #e6e3dd' : 'none',
                background: i % 2 ? '#ffffff' : '#fbf9f3',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.code}</span>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span>{r.team}</span>
              <span>
                <div
                  style={{
                    height: 8,
                    border: '1.5px solid #1f2430',
                    background: '#ffffff',
                    width: 110,
                  }}
                >
                  <div style={{ height: '100%', width: `${r.progress}%`, background: '#c8a57a' }} />
                </div>
              </span>
              <Tag tone={r.status === 'in review' ? 'warm' : 'ink'}>{r.status}</Tag>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};
