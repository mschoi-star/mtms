import { useState, useEffect, useMemo } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { reportsApi, projectsApi, getStoredUser } from '../services/api';
import type { ReportOut, ProjectOut, ReportStatus } from '../types';

type ReportStatusFilter = 'all' | ReportStatus;
type ReportSortKey = 'created_at' | 'work_date' | 'status' | 'project';
type ReportFormState = {
  title: string;
  summary: string;
  done: string;
  issue: string;
  nextPlan: string;
  workDate: string;
  projectId: string;
};

const STATUS_FILTERS = ['all', 'draft', 'submitted', 'approved', 'rejected'] as const satisfies readonly ReportStatusFilter[];
const SORT_OPTIONS = ['created_at', 'work_date', 'status', 'project'] as const satisfies readonly ReportSortKey[];

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

const mutedMono: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  color: '#4a5160',
};

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyForm = (): ReportFormState => ({
  title: '',
  summary: '',
  done: '',
  issue: '',
  nextPlan: '',
  workDate: today(),
  projectId: '',
});

const statusTone = (status: ReportStatus) => (status === 'approved' ? 'warm' : 'ink');

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

const composeContent = (form: ReportFormState) =>
  [form.summary, form.done, form.issue, form.nextPlan].map((v) => v.trim()).filter(Boolean).join('\n\n') || undefined;

export const ReportsApp = () => {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ReportFormState>(() => emptyForm());
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<ReportSortKey>('created_at');

  const [workflowBusyId, setWorkflowBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
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

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const summary = useMemo(() => {
    const counts = reports.reduce<Record<ReportStatus, number>>(
      (acc, report) => ({ ...acc, [report.status]: acc[report.status] + 1 }),
      { draft: 0, submitted: 0, approved: 0, rejected: 0 },
    );
    const reviewed = counts.approved + counts.rejected;
    return {
      total: reports.length,
      ...counts,
      approvalRate: reviewed ? Math.round((counts.approved / reviewed) * 100) : 0,
    };
  }, [reports]);

  const chartData = useMemo(() => {
    const last12 = [...reports]
      .sort((a, b) => (a.work_date ?? a.created_at).localeCompare(b.work_date ?? b.created_at))
      .slice(-12);
    if (!last12.length) return [];
    return last12.map((report) => ({
      label: formatDate(report.work_date ?? report.created_at),
      value: report.status === 'approved' ? 100 : report.status === 'submitted' ? 72 : report.status === 'rejected' ? 34 : 48,
      status: report.status,
    }));
  }, [reports]);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((report) => {
        const project = report.project_id ? projectById.get(report.project_id) : undefined;
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesProject = projectFilter === 'all' || report.project_id === projectFilter;
        const matchesDate = !dateFilter || report.work_date === dateFilter;
        const haystack = [
          report.code,
          report.title,
          report.summary ?? '',
          report.done ?? '',
          report.issue ?? '',
          report.next_plan ?? '',
          report.author_name ?? '',
          project?.code ?? '',
          project?.name ?? '',
        ].join(' ').toLowerCase();
        return matchesStatus && matchesProject && matchesDate && (!q || haystack.includes(q));
      })
      .sort((a, b) => {
        if (sortBy === 'work_date') return (b.work_date ?? '').localeCompare(a.work_date ?? '');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'project') {
          const aProject = a.project_id ? projectById.get(a.project_id)?.code ?? '' : '';
          const bProject = b.project_id ? projectById.get(b.project_id)?.code ?? '' : '';
          return aProject.localeCompare(bProject) || b.created_at.localeCompare(a.created_at);
        }
        return b.created_at.localeCompare(a.created_at);
      });
  }, [dateFilter, projectById, projectFilter, query, reports, sortBy, statusFilter]);

  const editingReport = editingReportId ? reports.find((r) => r.id === editingReportId) : undefined;

  const resetForm = () => {
    setForm(emptyForm());
    setEditingReportId(null);
    setSubmitError('');
  };

  const startEdit = (report: ReportOut) => {
    setEditingReportId(report.id);
    setSubmitError('');
    setForm({
      title: report.title,
      summary: report.summary ?? '',
      done: report.done ?? '',
      issue: report.issue ?? '',
      nextPlan: report.next_plan ?? '',
      workDate: report.work_date ?? today(),
      projectId: report.project_id ?? '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.done.trim()) return;
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || undefined,
      done: form.done.trim(),
      issue: form.issue.trim() || undefined,
      next_plan: form.nextPlan.trim() || undefined,
      content: composeContent(form),
      work_date: form.workDate,
      project_id: form.projectId || undefined,
    };

    const request = editingReportId
      ? reportsApi.update(editingReportId, { ...payload, project_id: form.projectId || null })
      : reportsApi.create(payload);

    request
      .then((r) => {
        setReports((prev) => editingReportId
          ? prev.map((report) => (report.id === r.data.id ? r.data : report))
          : [r.data, ...prev]);
        resetForm();
      })
      .catch(() => setSubmitError(editingReportId ? '보고서 수정에 실패했습니다.' : '보고서 제출에 실패했습니다.'))
      .finally(() => setSubmitting(false));
  };

  const updateReport = (report: ReportOut) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
  };

  const handleDelete = (report: ReportOut) => {
    if (!confirm(`"${report.title}" 보고서를 삭제하시겠습니까?`)) return;
    setActionError('');
    setWorkflowBusyId(report.id);
    reportsApi
      .delete(report.id)
      .then(() => {
        setReports((prev) => prev.filter((r) => r.id !== report.id));
        if (editingReportId === report.id) resetForm();
      })
      .catch(() => setActionError('보고서 삭제에 실패했습니다.'))
      .finally(() => setWorkflowBusyId(null));
  };

  const handleWorkflow = (report: ReportOut, action: 'submit' | 'approve' | 'reject') => {
    const fallback = action === 'approve' ? '승인 완료' : action === 'reject' ? '수정 요청' : undefined;
    const comment = action === 'submit' ? undefined : prompt('검토 코멘트를 입력해 주세요.', fallback);
    if (action !== 'submit' && comment === null) return;

    const call = action === 'submit'
      ? reportsApi.submit(report.id)
      : action === 'approve'
        ? reportsApi.approve(report.id, comment || undefined)
        : reportsApi.reject(report.id, comment || undefined);

    setActionError('');
    setWorkflowBusyId(report.id);
    call
      .then((r) => updateReport(r.data))
      .catch(() => setActionError('상태 변경에 실패했습니다.'))
      .finally(() => setWorkflowBusyId(null));
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setProjectFilter('all');
    setDateFilter('');
    setSortBy('created_at');
  };

  return (
    <div>
      <Section title="Report control tower" right={`${filteredReports.length}/${reports.length}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            ['Total', summary.total],
            ['Draft', summary.draft],
            ['Submitted', summary.submitted],
            ['Approved', summary.approved],
            ['Approval', `${summary.approvalRate}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ border: '1.5px solid #1f2430', background: '#fbf9f3', padding: '8px 9px' }}>
              <div style={{ ...mutedMono, fontSize: 10 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            height: 160,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            padding: '10px 4px',
            borderBottom: '1.5px solid #1f2430',
          }}
        >
          {(chartData.length ? chartData : [{ label: 'no data', value: 10, status: 'draft' as ReportStatus }]).map((item, i) => (
            <div key={`${item.label}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                title={`${item.label} · ${item.status}`}
                style={{
                  width: '100%',
                  height: `${Math.max(10, (item.value / 100) * 130)}px`,
                  background: item.status === 'approved' ? '#1f2430' : item.status === 'submitted' ? '#c8a57a' : item.status === 'rejected' ? '#b76e5f' : '#e6e3dd',
                  border: '1.5px solid #1f2430',
                }}
              />
              <span style={{ ...mutedMono, fontSize: 9 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={editingReport ? '일일업무 보고 수정' : '일일업무 보고 작성'} right={editingReport ? editingReport.code : 'draft'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {editingReport && (
            <div style={{ border: '1px dashed #c8a57a', background: '#fff8ea', padding: 8, fontSize: 12 }}>
              <b>{editingReport.code}</b> 수정 중입니다. draft/rejected 상태에서만 저장할 수 있습니다.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 8 }}>
            <select style={inputStyle} value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))} disabled={submitting}>
              <option value="">프로젝트 선택 (선택사항)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            <input style={inputStyle} type="date" value={form.workDate} onChange={(e) => setForm((f) => ({ ...f, workDate: e.target.value }))} disabled={submitting} />
          </div>
          <input style={inputStyle} type="text" placeholder="제목 *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} disabled={submitting} />
          <input style={inputStyle} type="text" placeholder="요약" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="오늘 한 일 *" value={form.done} onChange={(e) => setForm((f) => ({ ...f, done: e.target.value }))} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="이슈 / 리스크" value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} disabled={submitting} />
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="다음 계획" value={form.nextPlan} onChange={(e) => setForm((f) => ({ ...f, nextPlan: e.target.value }))} disabled={submitting} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            {submitError && <span style={{ fontSize: 12, color: '#c0392b' }}>{submitError}</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {editingReport && <button type="button" style={actionBtn} onClick={resetForm} disabled={submitting}>cancel</button>}
              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.done.trim()}
                style={{
                  padding: '6px 18px',
                  background: submitting || !form.title.trim() || !form.done.trim() ? '#d6d1c5' : '#1f2430',
                  color: submitting || !form.title.trim() || !form.done.trim() ? '#888' : '#fff',
                  border: '1.5px solid #1f2430',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  cursor: submitting || !form.title.trim() || !form.done.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'saving…' : editingReport ? 'save changes' : 'save draft'}
              </button>
            </div>
          </div>
        </form>
      </Section>

      <Section title="Latest reports" right="filterable">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 130px 1fr 150px 150px auto', gap: 6, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="Search title/content/project/author" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatusFilter)}>
            {STATUS_FILTERS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select style={inputStyle} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">all projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
          <input style={inputStyle} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <select style={inputStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value as ReportSortKey)}>
            {SORT_OPTIONS.map((option) => <option key={option} value={option}>sort: {option}</option>)}
          </select>
          <button style={actionBtn} onClick={clearFilters}>clear</button>
        </div>
        {actionError && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: 8 }}>{actionError}</div>}
        {loading && <Loading />}
        {error && <ApiError message={error} />}
        {!loading && !error && filteredReports.length === 0 && (
          <div style={{ fontSize: 12, color: '#8a8a8a' }}>조건에 맞는 보고서가 없습니다.</div>
        )}
        {!loading && !error && filteredReports.map((r, i) => {
          const project = r.project_id ? projectById.get(r.project_id) : undefined;
          const isAuthor = r.author_email === currentUser?.id;
          const canEdit = isAuthor && (r.status === 'draft' || r.status === 'rejected');
          const canReview = r.status === 'submitted' && !isAuthor;
          const busy = workflowBusyId === r.id;

          return (
            <div
              key={r.id}
              style={{
                padding: '13px 0',
                borderTop: i ? '1px dashed #d6d1c5' : 'none',
                opacity: busy ? 0.62 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={mutedMono}>
                    {r.code} · {r.work_date ?? r.created_at.slice(0, 10)}
                    {project && <span style={{ marginLeft: 6, color: '#c8a57a' }}>· {project.code} {project.name}</span>}
                    {r.author_name && <span style={{ marginLeft: 6 }}>· {r.author_name}</span>}
                  </div>
                  <div style={{ fontWeight: 800, marginTop: 3, fontSize: 15 }}>{r.title}</div>
                  {r.summary && <div style={{ fontSize: 12.5, color: '#1f2430', marginTop: 4 }}>{r.summary}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                    {r.done && (
                      <div style={{ borderLeft: '3px solid #1f2430', paddingLeft: 8, fontSize: 12, color: '#4a5160', whiteSpace: 'pre-wrap' }}>
                        <b>Done</b><br />{r.done}
                      </div>
                    )}
                    {r.issue && (
                      <div style={{ borderLeft: '3px solid #b76e5f', paddingLeft: 8, fontSize: 12, color: '#8a6a44', whiteSpace: 'pre-wrap' }}>
                        <b>Issue</b><br />{r.issue}
                      </div>
                    )}
                    {r.next_plan && (
                      <div style={{ borderLeft: '3px solid #c8a57a', paddingLeft: 8, fontSize: 12, color: '#4a5160', whiteSpace: 'pre-wrap' }}>
                        <b>Next</b><br />{r.next_plan}
                      </div>
                    )}
                  </div>
                  {r.review_comment && (
                    <div style={{ fontSize: 12, color: '#4a5160', marginTop: 7, background: '#fbf9f3', border: '1px solid #e6e3dd', padding: 7 }}>
                      review: {r.review_comment}
                    </div>
                  )}
                  <div style={{ ...mutedMono, marginTop: 7 }}>
                    submitted {formatDate(r.submitted_at)} · reviewed {formatDate(r.reviewed_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <Tag tone={statusTone(r.status)}>{r.status}</Tag>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {canEdit && <button style={actionBtn} onClick={() => startEdit(r)} disabled={busy}>edit</button>}
                    {canEdit && <button style={actionBtn} onClick={() => handleDelete(r)} disabled={busy}>delete</button>}
                    {isAuthor && (r.status === 'draft' || r.status === 'rejected') && <button style={actionBtn} onClick={() => handleWorkflow(r, 'submit')} disabled={busy}>submit</button>}
                    {canReview && (
                      <>
                        <button style={{ ...actionBtn, background: '#c8a57a' }} onClick={() => handleWorkflow(r, 'approve')} disabled={busy}>approve</button>
                        <button style={actionBtn} onClick={() => handleWorkflow(r, 'reject')} disabled={busy}>reject</button>
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
