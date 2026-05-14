import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { reportsApi, projectsApi } from '../services/api';
import type { ReportOut, ProjectOut } from '../types';

const CHART_DATA = [38, 54, 41, 72, 65, 88, 76, 92, 81, 95, 70, 83];

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1.5px solid #1f2430',
  background: '#fff',
  fontFamily: 'Inter, Noto Sans KR, sans-serif',
  fontSize: 13,
  padding: '6px 8px',
  outline: 'none',
};

export const ReportsApp = () => {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([reportsApi.list(), projectsApi.list()])
      .then(([rRes, pRes]) => {
        setReports(rRes.data);
        setProjects(pRes.data);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    reportsApi
      .create({
        title: title.trim(),
        content: content.trim() || undefined,
        project_id: projectId || undefined,
      })
      .then((r) => {
        setReports((prev) => [r.data, ...prev]);
        setTitle('');
        setContent('');
        setProjectId('');
      })
      .catch(() => setSubmitError('보고서 제출에 실패했습니다.'))
      .finally(() => setSubmitting(false));
  };

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
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${(v / 100) * 170}px`,
                  background: i === CHART_DATA.length - 1 ? '#1f2430' : '#c8a57a',
                  border: '1.5px solid #1f2430',
                }}
              />
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#4a5160' }}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="일일보고 작성">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select
            style={inputStyle}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={submitting}
          >
            <option value="">프로젝트 선택 (선택사항)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
          <input
            style={inputStyle}
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            placeholder="오늘 업무 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {submitError && (
              <span style={{ fontSize: 12, color: '#c0392b' }}>{submitError}</span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                style={{
                  padding: '6px 18px',
                  background: submitting || !title.trim() ? '#d6d1c5' : '#1f2430',
                  color: submitting || !title.trim() ? '#888' : '#fff',
                  border: '1.5px solid #1f2430',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  cursor: submitting || !title.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'submitting…' : 'submit'}
              </button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Latest reports">
        {loading && <Loading />}
        {error && <ApiError message={error} />}
        {!loading && !error &&
          reports.map((r, i) => {
            const project = projects.find((p) => p.id === r.project_id);
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '10px 0',
                  borderTop: i ? '1px dashed #d6d1c5' : 'none',
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4a5160' }}>
                    {r.code}
                    {project && (
                      <span style={{ marginLeft: 6, color: '#c8a57a' }}>· {project.code}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  {r.content && (
                    <div style={{ fontSize: 12, color: '#4a5160', marginTop: 3, whiteSpace: 'pre-wrap' }}>
                      {r.content}
                    </div>
                  )}
                </div>
                <Tag tone={r.status === 'approved' ? 'warm' : 'ink'}>{r.status}</Tag>
              </div>
            );
          })}
      </Section>
    </div>
  );
};
