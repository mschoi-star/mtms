import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { reportsApi, projectsApi, getStoredUser } from '../services/api';
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

const actionBtn: React.CSSProperties = {
  padding: '4px 9px',
  border: '1.5px solid #1f2430',
  background: '#fff',
  color: '#1f2430',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10.5,
  cursor: 'pointer',
};

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReportsApp = () => {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [done, setDone] = useState('');
  const [issue, setIssue] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [workDate, setWorkDate] = useState(today());
  const [projectId, setProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const currentUser = getStoredUser();

  useEffect(() => {
    Promise.all([reportsApi.list(), projectsApi.list()])
      .then(([rRes, pRes]) => {
        setReports(rRes.data);
        setProjects(pRes.data);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setDone('');
    setIssue('');
    setNextPlan('');
    setProjectId('');
    setWorkDate(today());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !done.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    reportsApi
      .create({
        title: title.trim(),
        summary: summary.trim() || undefined,
        done: done.trim(),
        issue: issue.trim() || undefined,
        next_plan: nextPlan.trim() || undefined,
        content: [summary, done, issue, nextPlan].filter(Boolean).join('\n\n') || undefined,
        work_date: workDate,
        project_id: projectId || undefined,
      })
      .then((r) => {
        setReports((prev) => [r.data, ...prev]);
        resetForm();
      })
      .catch(() => setSubmitError('보고서 제출에 실패했습니다.'))
      .finally(() => setSubmitting(false));
  };

  const updateReport = (report: ReportOut) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
  };

  const handleWorkflow = (report: ReportOut, action: 'submit' | 'approve' | 'reject') => {
    const call = action === 'submit'
      ? reportsApi.submit(report.id)
      : action === 'approve'
        ? reportsApi.approve(report.id, '승인 완료')
        : reportsApi.reject(report.id, '수정 요청');
    call.then((r) => updateReport(r.data)).catch(() => alert('상태 변경에 실패했습니다.'));
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
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: '100%',
                  height: `${(v / 100) * 170}px`,
                  background: i === CHART_DATA.length - 1 ? '#1f2430' : '#c8a57a',
                  border: '1.5px solid #1f2430',
                }}
              />
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#4a5160' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="일일업무 보고 작성" right="structured">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 8 }}>
            <select style={inputStyle} value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={submitting}>
              <option value="">프로젝트 선택 (선택사항)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            <input style={inputStyle} type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} disabled={submitting} />
          </div>
          <input style={inputStyle} type="text" placeholder="제목 *" value={title} onChange={(e) => setTitle(e.target.value)} disabled={submitting} />
          <input style={inputStyle} type="text" placeholder="요약" value={summary} onChange={(e) => setSummary(e.target.value)} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="오늘 한 일 *" value={done} onChange={(e) => setDone(e.target.value)} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="이슈 / 리스크" value={issue} onChange={(e) => setIssue(e.target.value)} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="다음 계획" value={nextPlan} onChange={(e) => setNextPlan(e.target.value)} disabled={submitting} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {submitError && <span style={{ fontSize: 12, color: '#c0392b' }}>{submitError}</span>}
            <button
              type="submit"
              disabled={submitting || !title.trim() || !done.trim()}
              style={{
                marginLeft: 'auto',
                padding: '6px 18px',
                background: submitting || !title.trim() || !done.trim() ? '#d6d1c5' : '#1f2430',
                color: submitting || !title.trim() || !done.trim() ? '#888' : '#fff',
                border: '1.5px solid #1f2430',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                cursor: submitting || !title.trim() || !done.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'submitting…' : 'save draft'}
            </button>
          </div>
        </form>
      </Section>

      <Section title="Latest reports">
        {loading && <Loading />}
        {error && <ApiError message={error} />}
        {!loading && !error && reports.length === 0 && (
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>보고서가 없습니다.</div>
        )}
        {!loading && !error && reports.map((r, i) => {
          const project = projects.find((p) => p.id === r.project_id);
          const isAuthor = r.author_email === currentUser?.id;
          const canReview = r.status === 'submitted' && !isAuthor;

          return (
            <div
              key={r.id}
              style={{
                padding: '12px 0',
                borderTop: i ? '1px dashed #d6d1c5' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4a5160' }}>
                    {r.code} · {r.work_date ?? r.created_at.slice(0, 10)}
                    {project && <span style={{ marginLeft: 6, color: '#c8a57a' }}>· {project.code}</span>}
                    {r.author_name && <span style={{ marginLeft: 6 }}>· {r.author_name}</span>}
                  </div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{r.title}</div>
                  {r.summary && <div style={{ fontSize: 12.5, color: '#1f2430', marginTop: 4 }}>{r.summary}</div>}
                  {r.done && (
                    <div style={{ fontSize: 12, color: '#4a5160', marginTop: 5, whiteSpace: 'pre-wrap' }}>
                      <b>Done</b> — {r.done}
                    </div>
                  )}
                  {r.issue && (
                    <div style={{ fontSize: 12, color: '#8a6a44', marginTop: 3, whiteSpace: 'pre-wrap' }}>
                      <b>Issue</b> — {r.issue}
                    </div>
                  )}
                  {r.next_plan && (
                    <div style={{ fontSize: 12, color: '#4a5160', marginTop: 3, whiteSpace: 'pre-wrap' }}>
                      <b>Next</b> — {r.next_plan}
                    </div>
                  )}
                  {r.review_comment && (
                    <div style={{ fontSize: 12, color: '#4a5160', marginTop: 5 }}>
                      review: {r.review_comment}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Tag tone={r.status === 'approved' ? 'warm' : 'ink'}>{r.status}</Tag>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {isAuthor && (r.status === 'draft' || r.status === 'rejected') && <button style={actionBtn} onClick={() => handleWorkflow(r, 'submit')}>submit</button>}
                    {canReview && (
                      <>
                        <button style={{ ...actionBtn, background: '#c8a57a' }} onClick={() => handleWorkflow(r, 'approve')}>approve</button>
                        <button style={actionBtn} onClick={() => handleWorkflow(r, 'reject')}>reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Section>
    </div>
  );
};
