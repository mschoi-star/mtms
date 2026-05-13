import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { filesApi } from '../services/api';
import type { FileEntryOut } from '../types';

export const FilesApp = () => {
  const [entries, setEntries] = useState<FileEntryOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    filesApi
      .list('/')
      .then((r) => setEntries(r.data))
      .catch(() => setError('파일 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <Section title="Files" right="/ root">
      <div
        style={{
          border: '1.5px solid #1f2430',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 90px 110px',
            background: '#1f2430',
            color: '#ffffff',
            padding: '7px 12px',
            fontSize: 10.5,
            letterSpacing: 1.5,
          }}
        >
          <span />
          <span>NAME</span>
          <span>SIZE</span>
          <span>MODIFIED</span>
        </div>
        {entries.map((t, i) => (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 90px 110px',
              padding: '8px 12px',
              borderTop: i ? '1px solid #e6e3dd' : 'none',
              background: i % 2 ? '#ffffff' : '#fbf9f3',
            }}
          >
            <span
              style={{
                color: t.entry_type === 'dir' ? '#c8a57a' : '#4a5160',
                fontWeight: t.entry_type === 'dir' ? 700 : 400,
              }}
            >
              {t.entry_type === 'dir' ? '▸' : '·'}
            </span>
            <span style={{ fontWeight: t.entry_type === 'dir' ? 600 : 400 }}>{t.name}</span>
            <span style={{ color: '#4a5160' }}>{t.size_label}</span>
            <span style={{ color: '#4a5160' }}>{t.modified_at}</span>
          </div>
        ))}
      </div>
    </Section>
  );
};
