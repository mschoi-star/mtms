import { useState, useEffect, useMemo } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { projectsApi, reportsApi } from '../services/api';
import type { ProjectOut, ProjectStatus, ReportOut } from '../types';

type ProjectStatusFilter = 'all' | ProjectStatus;
type ProjectSortKey = 'code' | 'name' | 'progress' | 'updated_at';

const STATUS_OPTIONS = ['active', 'in review', 'on hold', 'complete'] as const satisfies readonly ProjectStatus[];
const FILTER_STATUS_OPTIONS = ['all', ...STATUS_OPTIONS] as const satisfies readonly ProjectStatusFilter[];
const SORT_OPTIONS = ['code', 'name', 'progress', 'updated_at'] as const satisfies readonly ProjectSortKey[];

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));
const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

const inp: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1.5px solid #1f2430',
  background: '#fff',
  fontFamily: 'Inter, Noto Sans KR, sans-serif',
  fontSize: 13,
  padding: '6px 8px',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '5px 14px',
  background: '#1f2430',
  color: '#fff',
  border: '1.5px solid #1f2430',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  padding: '5px 14px',
  background: '#fff',
  color: '#1f2430',
  border: '1.5px solid #1f2430',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  cursor: 'pointer',
};

export const ProjectsApp = () => {
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<ProjectOut | null>(null);
  const [projectReports, setProjectReports] = useState<ReportOut[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  const [sortBy, setSortBy] = useState<ProjectSortKey>('code');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    team: '',
    description: '',
    progress: 0,
    status: 'active' as ProjectStatus,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editForm, setEditForm] = useState({ name: '', team: '', description: '', progress: 0, status: 'active' as ProjectStatus });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const openCreateForm = () => {
    setShowCreate(true);
    setCreateError('');
  };

  const closeCreateForm = () => {
    setShowCreate(false);
    setCreateError('');
  };

  useEffect(() => {
    projectsApi
      .list()
      .then((r) => setProjects(r.data))
      .catch(() => setError('프로젝트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    inReview: projects.filter((p) => p.status === 'in review').length,
    complete: projects.filter((p) => p.status === 'complete').length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const haystack = [p.code, p.name, p.team, p.description ?? ''].join(' ').toLowerCase();
        return matchesStatus && (!q || haystack.includes(q));
      })
      .sort((a, b) => {
        if (sortBy === 'progress') return b.progress - a.progress;
        if (sortBy === 'updated_at') return b.updated_at.localeCompare(a.updated_at);
        return a[sortBy].localeCompare(b[sortBy]);
      });
  }, [projects, query, sortBy, statusFilter]);

  const selectedIsVisible = !selected || filteredProjects.some((p) => p.id === selected.id);
  const approvedReports = projectReports.filter((r) => r.status === 'approved').length;
  const pendingReports = projectReports.filter((r) => r.status !== 'approved').length;

  const selectProject = (p: ProjectOut) => {
    setSelected(p);
    setSaveError('');
    setDeleteError('');
    setEditForm({
      name: p.name,
      team: p.team,
      description: p.description ?? '',
      progress: p.progress,
      status: p.status,
    });
    setLoadingReports(true);
    reportsApi
      .list(p.id)
      .then((r) => setProjectReports(r.data))
      .finally(() => setLoadingReports(false));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    setCreateError('');
    const code = createForm.code.trim().toUpperCase();
    projectsApi
      .create({
        ...(code ? { code } : {}),
        name: createForm.name.trim(),
        team: createForm.team.trim() || undefined,
        description: createForm.description.trim() || undefined,
        progress: clampProgress(createForm.progress),
        status: createForm.status,
      })
      .then((r) => {
        setProjects((prev) => [...prev, r.data]);
        setCreateForm({ code: '', name: '', team: '', description: '', progress: 0, status: 'active' as ProjectStatus });
        setShowCreate(false);
        setQuery('');
        setStatusFilter('all');
        setSortBy('updated_at');
        selectProject(r.data);
      })
      .catch(() => setCreateError('생성에 실패했습니다. 코드가 중복되었을 수 있습니다.'))
      .finally(() => setCreating(false));
  };

  const handleDelete = (p: ProjectOut, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${p.name}" 프로젝트를 삭제하시겠습니까?`)) return;
    setDeleteError('');
    projectsApi.delete(p.id)
      .then(() => {
        setProjects((prev) => prev.filter((x) => x.id !== p.id));
        if (selected?.id === p.id) {
          setSelected(null);
          setProjectReports([]);
        }
      })
      .catch(() => setDeleteError('삭제에 실패했습니다. 다시 시도해 주세요.'));
  };

  const handleSave = () => {
    if (!selected || !editForm.name.trim()) return;
    setSaving(true);
    setSaveError('');
    projectsApi
      .update(selected.id, {
        name: editForm.name.trim(),
        team: editForm.team.trim(),
        description: editForm.description.trim(),
        progress: clampProgress(editForm.progress),
        status: editForm.status,
      })
      .then((r) => {
        setProjects((prev) => prev.map((p) => (p.id === r.data.id ? r.data : p)));
        setSelected(r.data);
      })
      .catch(() => setSaveError('저장에 실패했습니다. 입력값을 확인해 주세요.'))
      .finally(() => setSaving(false));
  };

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 0 }}>
      {/* ── Left panel: project list ── */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          borderRight: '1.5px solid #1f2430',
          minHeight: '100%',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid #e6e3dd',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#1f2430',
            }}
          >
            Projects
            <span style={{ marginLeft: 8, fontFamily: 'JetBrains Mono, monospace', color: '#8a8a8a', fontWeight: 500 }}>
              {filteredProjects.length}/{projects.length}
            </span>
          </span>
          <button
            onClick={() => (showCreate ? closeCreateForm() : openCreateForm())}
            style={{
              ...btnPrimary,
              padding: '3px 10px',
              fontSize: 11,
              background: showCreate ? '#c8a57a' : '#1f2430',
              border: `1.5px solid ${showCreate ? '#c8a57a' : '#1f2430'}`,
            }}
          >
            {showCreate ? '×' : '+ New'}
          </button>
        </div>

        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e6e3dd', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['Total', summary.total],
            ['Active', summary.active],
            ['In Review', summary.inReview],
            ['Complete', summary.complete],
          ].map(([label, value]) => (
            <div key={label} style={{ border: '1px solid #e6e3dd', background: '#fbf9f3', padding: '6px 7px' }}>
              <div style={{ fontSize: 9, color: '#4a5160', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e6e3dd', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            style={inp}
            placeholder="Search code/name/team/description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <select style={inp} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatusFilter)}>
              {FILTER_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select style={inp} value={sortBy} onChange={(e) => setSortBy(e.target.value as ProjectSortKey)}>
              {SORT_OPTIONS.map((s) => (
                <option key={s} value={s}>sort: {s}</option>
              ))}
            </select>
          </div>
          {deleteError && <span style={{ fontSize: 11, color: '#c0392b' }}>{deleteError}</span>}
        </div>

        {/* Create form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            style={{
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              borderBottom: '1px solid #e6e3dd',
              background: '#fbf9f3',
            }}
          >
            <input
              style={inp}
              placeholder="Code (비워두면 자동 생성)"
              value={createForm.code}
              onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value }))}
            />
            <input
              style={inp}
              placeholder="프로젝트명 *"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              style={inp}
              placeholder="팀 (선택)"
              value={createForm.team}
              onChange={(e) => setCreateForm((f) => ({ ...f, team: e.target.value }))}
            />
            <textarea
              style={{ ...inp, minHeight: 60, resize: 'vertical' }}
              placeholder="설명 (선택)"
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={inp}
                type="number"
                min={0}
                max={100}
                placeholder="Progress"
                value={createForm.progress}
                onChange={(e) => setCreateForm((f) => ({ ...f, progress: clampProgress(Number(e.target.value)) }))}
              />
              <select
                style={inp}
                value={createForm.status}
                onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {createError && (
              <span style={{ fontSize: 11, color: '#c0392b' }}>{createError}</span>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" disabled={creating || !createForm.name.trim()} style={{ ...btnPrimary, flex: 1 }}>
                {creating ? '…' : 'Create'}
              </button>
              <button type="button" onClick={closeCreateForm} style={{ ...btnSecondary, flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Project list */}
        {projects.length === 0 ? (
          <div style={{ padding: '20px 16px', fontSize: 12, color: '#8a8a8a' }}>
            프로젝트가 없습니다.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '20px 16px', fontSize: 12, color: '#8a8a8a', lineHeight: 1.6 }}>
            조건에 맞는 프로젝트가 없습니다.
            <button
              type="button"
              onClick={() => { setQuery(''); setStatusFilter('all'); }}
              style={{ ...btnSecondary, display: 'block', marginTop: 10, width: '100%' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => selectProject(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                cursor: 'pointer',
                background: selected?.id === p.id ? '#1f2430' : 'transparent',
                color: selected?.id === p.id ? '#fff' : '#1f2430',
                borderBottom: '1px solid #e6e3dd',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                    opacity: 0.65,
                    marginBottom: 2,
                  }}
                >
                  {p.code}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ fontSize: 10, opacity: 0.75, whiteSpace: 'nowrap' }}>{p.team || 'No team'}</span>
                  <span style={{ fontSize: 10, opacity: 0.75, whiteSpace: 'nowrap' }}>{p.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <div style={{ height: 4, background: selected?.id === p.id ? '#4a5160' : '#e6e3dd', flex: 1 }}>
                    <div style={{ height: '100%', width: `${clampProgress(p.progress)}%`, background: selected?.id === p.id ? '#c8a57a' : '#1f2430' }} />
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.75, fontFamily: 'JetBrains Mono, monospace' }}>{p.progress}%</span>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(p, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: selected?.id === p.id ? '#ffb3a7' : '#c0392b',
                  fontSize: 16,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: '0 2px',
                  marginLeft: 6,
                  flexShrink: 0,
                }}
                title="삭제"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Right panel: project detail ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selected ? (
          <div
            style={{
              padding: '60px 0',
              textAlign: 'center',
              color: '#a0a0a0',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <div style={{ marginBottom: 12 }}>← 프로젝트를 선택하세요</div>
            <button onClick={openCreateForm} style={btnPrimary}>
              + New Project
            </button>
          </div>
        ) : (
          <>
            <Section title={`${selected.code} — 프로젝트 상세`} right={selected.status}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!selectedIsVisible && (
                  <div style={{ border: '1px solid #c8a57a', background: '#fbf3e2', padding: '8px 10px', fontSize: 12, color: '#4a5160' }}>
                    현재 선택한 프로젝트는 왼쪽 필터 결과에는 없지만 상세 편집은 유지됩니다.
                  </div>
                )}

                <div style={{ border: '1.5px solid #1f2430', background: '#fbf9f3', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4a5160', letterSpacing: 1 }}>
                        {selected.code} · {selected.team || 'No team'}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#1f2430' }}>{selected.name}</div>
                      <div style={{ fontSize: 12, color: '#4a5160', marginTop: 6 }}>
                        {selected.description || '프로젝트 설명이 아직 없습니다.'}
                      </div>
                    </div>
                    <Tag tone={selected.status === 'complete' ? 'warm' : 'ink'}>{selected.status}</Tag>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4a5160', marginBottom: 5 }}>
                      <span>PROGRESS</span>
                      <span>{selected.progress}%</span>
                    </div>
                    <div style={{ height: 10, border: '1.5px solid #1f2430', background: '#fff' }}>
                      <div style={{ height: '100%', width: `${clampProgress(selected.progress)}%`, background: '#c8a57a' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
                    {[
                      ['Updated', formatDate(selected.updated_at)],
                      ['Reports', projectReports.length],
                      ['Approved', approvedReports],
                      ['Pending', pendingReports],
                    ].map(([label, value]) => (
                      <div key={label} style={{ border: '1px solid #e6e3dd', background: '#fff', padding: '7px 8px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: '#4a5160' }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>NAME</div>
                    <input
                      style={inp}
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>TEAM</div>
                    <input
                      style={inp}
                      value={editForm.team}
                      onChange={(e) => setEditForm((f) => ({ ...f, team: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>DESCRIPTION</div>
                  <textarea
                    style={{ ...inp, minHeight: 92, resize: 'vertical' }}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="프로젝트 상세 내용을 입력하세요"
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>PROGRESS (%)</div>
                    <input
                      style={inp}
                      type="number"
                      min={0}
                      max={100}
                      value={editForm.progress}
                      onChange={(e) => setEditForm((f) => ({ ...f, progress: clampProgress(Number(e.target.value)) }))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
                    <select
                      style={inp}
                      value={editForm.status}
                      onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {saveError && <span style={{ fontSize: 11, color: '#c0392b' }}>{saveError}</span>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editForm.name.trim()}
                    style={{
                      ...btnPrimary,
                      background: saving || !editForm.name.trim() ? '#d6d1c5' : '#1f2430',
                      color: saving || !editForm.name.trim() ? '#888' : '#fff',
                      cursor: saving || !editForm.name.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </Section>

            <Section title="일일업무 보고" right={`${projectReports.length} items`}>
              {loadingReports && <Loading />}
              {!loadingReports && projectReports.length === 0 && (
                <div style={{ fontSize: 12, color: '#8a8a8a', padding: '4px 0' }}>
                  이 프로젝트의 보고가 없습니다. Reports 앱에서 작성하세요.
                </div>
              )}
              {projectReports.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    padding: '10px 0',
                    borderTop: i ? '1px dashed #d6d1c5' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: '#4a5160' }}>
                        {r.code} · {r.work_date ?? r.created_at.slice(0, 10)}
                        {r.author_name && ` · ${r.author_name}`}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{r.title}</div>
                      {r.summary && (
                        <div style={{ fontSize: 12.5, color: '#1f2430', marginTop: 4 }}>{r.summary}</div>
                      )}
                      {r.done && (
                        <div style={{ fontSize: 12, color: '#4a5160', marginTop: 4, whiteSpace: 'pre-wrap' }}>
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
                      {!r.done && r.content && (
                        <div style={{ fontSize: 12, color: '#4a5160', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                          {r.content}
                        </div>
                      )}
                    </div>
                    <Tag tone={r.status === 'approved' ? 'warm' : 'ink'}>{r.status}</Tag>
                  </div>
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
