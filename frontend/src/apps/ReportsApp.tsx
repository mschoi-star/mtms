import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { reportsApi } from '../services/api';
import type { ReportOut } from '../types';

const CHART_DATA = [38, 54, 41, 72, 65, 88, 76, 92, 81, 95, 70, 83];

export const ReportsApp = () => {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi
      .list()
      .then((r) => setReports(r.data))
      .catch(() => setError('보고서를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Section title="Reliability index" right="12-month">
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            padding: '10px 4px',
            borderBottom: '1.5px solid #1f2430',
          }}
        >
          {CHART_DATA.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${(v / 100) * 170}px`,
                  background: i === CHART_DATA.length - 1 ? '#1f2430' : '#c8a57a',
                  border: '1.5px solid #1f2430',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#4a5160',
                }}
              >
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Latest reports">
        {loading && <Loading />}
        {error && <ApiError message={error} />}
        {!loading && !error &&
          reports.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderTop: i ? '1px dashed #d6d1c5' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: '#4a5160',
                  }}
                >
                  {r.code}
                </div>
                <div style={{ fontWeight: 600 }}>{r.title}</div>
              </div>
              <Tag tone={r.status === 'approved' ? 'warm' : 'ink'}>{r.status}</Tag>
            </div>
          ))}
      </Section>
    </div>
  );
};
