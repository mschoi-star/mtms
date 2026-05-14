import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Tag } from '../components/ui/Tag';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { projectsApi, reportsApi } from '../services/api';
import type { ProjectOut, ReportOut } from '../types';

const STATUS_OPTIONS = ['active', 'in review', 'on hold', 'complete'];

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

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ code: '', name: '', team: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editForm, setEditForm] = useState({ name: '', team: '', description: '', progress: 0, status: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    projectsApi
      .list()
      .then((r) => setProjects(r.data))
      .catch(() => setError('프로젝트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const selectProject = (p: ProjectOut) => {
    setSelected(p);
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
    if (!createForm.code.trim() || !createForm.name.trim()) return;
    setCreating(true);
    setCreateError('');
    projectsApi
      .create({
        code: createForm.code.trim().toUpperCase(),
        name: createForm.name.trim(),
        team: createForm.team.trim() || undefined,
        description: createForm.description.trim() || undefined,
      })
      .then((r) => {
        setProjects((prev) => [...prev, r.data]);
        setCreateForm({ code: '', name: '', team: '', description: '' });
        setShowCreate(false);
        selectProject(r.data);
      })
      .catch(() => setCreateError('생성에 실패했습니다. 코드가 중복되었을 수 있습니다.'))
      .finally(() => setCreating(false));
  };

  const handleDelete = (p: ProjectOut, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${p.name}" 프로젝트를 삭제하시겠습니까?`)) return;
    projectsApi.delete(p.id).then(() => {
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
      if (selected?.id === p.id) {
        setSelected(null);
        setProjectReports([]);
      }
    });
  };

  const handleSave = () => {
    if (!selected) return;
    setSaving(true);
    projectsApi
      .update(selected.id, {
        name: editForm.name,
        team: editForm.team,
        description: editForm.description,
        progress: editForm.progress,
        status: editForm.status,
      })
      .then((r) => {
        setProjects((prev) => prev.map((p) => (p.id === r.data.id ? r.data : p)));
        setSelected(r.data);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 0 }}>
      {/* ── Left panel: project list ── */}
      <div
        style={{
          width: 230,
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
          </span>
          <button
            onClick={() => { setShowCreate((v) => !v); setCreateError(''); }}
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
              placeholder="Code (e.g. PRJ-001)"
              value={createForm.code}
              onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value }))}
              required
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
            {createError && (
              <span style={{ fontSize: 11, color: '#c0392b' }}>{createError}</span>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" disabled={creating} style={{ ...btnPrimary, flex: 1 }}>
                {creating ? '…' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ ...btnSecondary, flex: 1 }}>
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
        ) : (
          projects.map((p) => (
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
              <div style={{ minWidth: 0 }}>
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
            ← 프로젝트를 선택하세요
          </div>
        ) : (
          <>
            <Section title={`${selected.code} — 상세`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                <div>
                  <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>DESCRIPTION</div>
                  <textarea
                    style={{ ...inp, minHeight: 80, resize: 'vertical' }}
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
                      onChange={(e) => setEditForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: '#4a5160', letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
                    <select
                      style={inp}
                      value={editForm.status}
                      onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...btnPrimary,
                      background: saving ? '#d6d1c5' : '#1f2430',
                      color: saving ? '#888' : '#fff',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'saving…' : 'Save'}
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
                        {r.code} · {r.created_at.slice(0, 10)}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{r.title}</div>
                      {r.content && (
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
