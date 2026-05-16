import { useState, useEffect, useMemo } from 'react';
import { Section } from '../components/ui/Section';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { scheduleApi } from '../services/api';
import type { ScheduleEventOut } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

const btn: React.CSSProperties = {
  padding: '5px 12px',
  border: '1.5px solid #1f2430',
  background: '#fff',
  color: '#1f2430',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  cursor: 'pointer',
};

const primaryBtn: React.CSSProperties = {
  ...btn,
  background: '#1f2430',
  color: '#fff',
};

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const ScheduleApp = () => {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [events, setEvents] = useState<ScheduleEventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    event_date: toDateKey(new Date()),
    hour: '09',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekStartKey = toDateKey(weekStart);
  const todayKey = toDateKey(new Date());
  const weekEndKey = toDateKey(weekDays[6]);

  useEffect(() => {
    setLoading(true);
    setError('');
    scheduleApi
      .getWeek(weekStartKey)
      .then((r) => setEvents(r.data))
      .catch(() => setError('일정을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [weekStartKey]);

  const byDate = useMemo(() => {
    const grouped: Record<string, ScheduleEventOut[]> = {};
    events.forEach((event) => {
      (grouped[event.event_date] ??= []).push(event);
    });
    return grouped;
  }, [events]);

  const moveWeek = (amount: number) => {
    setWeekStart((current) => addDays(current, amount * 7));
  };

  const goToday = () => {
    const monday = getMonday(new Date());
    setWeekStart(monday);
    setCreateForm((form) => ({ ...form, event_date: todayKey }));
  };

  const openCreateFor = (dateKey: string) => {
    setShowCreate(true);
    setCreateError('');
    setCreateForm((form) => ({ ...form, event_date: dateKey }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;
    setCreating(true);
    setCreateError('');
    scheduleApi
      .create({
        title: createForm.title.trim(),
        event_date: createForm.event_date,
        hour: createForm.hour || '09',
      })
      .then((r) => {
        if (r.data.event_date >= weekStartKey && r.data.event_date <= weekEndKey) {
          setEvents((prev) => [...prev, r.data].sort((a, b) => `${a.event_date} ${a.hour}`.localeCompare(`${b.event_date} ${b.hour}`)));
        }
        setCreateForm((form) => ({ ...form, title: '' }));
        setShowCreate(false);
      })
      .catch(() => setCreateError('일정 생성에 실패했습니다. 입력값을 확인해 주세요.'))
      .finally(() => setCreating(false));
  };

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <div>
      <Section
        title={`${weekStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} · Week`}
        right={`${weekStartKey} ~ ${weekEndKey}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" style={btn} onClick={() => moveWeek(-1)}>← Prev</button>
            <button type="button" style={btn} onClick={goToday}>Today</button>
            <button type="button" style={btn} onClick={() => moveWeek(1)}>Next →</button>
          </div>
          <button
            type="button"
            style={primaryBtn}
            onClick={() => openCreateFor(todayKey >= weekStartKey && todayKey <= weekEndKey ? todayKey : weekStartKey)}
          >
            + New Event
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 140px 90px auto auto',
              gap: 6,
              alignItems: 'center',
              padding: 10,
              marginBottom: 10,
              border: '1px solid #e6e3dd',
              background: '#fbf9f3',
            }}
          >
            <input
              style={inp}
              placeholder="일정 제목 *"
              value={createForm.title}
              onChange={(e) => setCreateForm((form) => ({ ...form, title: e.target.value }))}
              required
            />
            <input
              style={inp}
              type="date"
              value={createForm.event_date}
              onChange={(e) => setCreateForm((form) => ({ ...form, event_date: e.target.value }))}
            />
            <input
              style={inp}
              type="time"
              value={`${createForm.hour.padStart(2, '0')}:00`}
              onChange={(e) => setCreateForm((form) => ({ ...form, hour: e.target.value.slice(0, 2) }))}
            />
            <button type="submit" disabled={creating || !createForm.title.trim()} style={primaryBtn}>
              {creating ? '…' : 'Create'}
            </button>
            <button type="button" style={btn} onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            {createError && <div style={{ gridColumn: '1 / -1', fontSize: 11, color: '#c0392b' }}>{createError}</div>}
          </form>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            border: '1.5px solid #1f2430',
          }}
        >
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                borderRight: i < 6 ? '1px solid #1f2430' : 'none',
                borderBottom: '1.5px solid #1f2430',
                background: '#1f2430',
                color: '#ffffff',
                textAlign: 'center',
                padding: '6px 0',
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              {d}
            </div>
          ))}
          {weekDays.map((day, i) => {
            const dateKey = toDateKey(day);
            const ev = byDate[dateKey] ?? [];
            const today = dateKey === todayKey;
            return (
              <div
                key={dateKey}
                style={{
                  borderRight: i < 6 ? '1px solid #e6e3dd' : 'none',
                  minHeight: 138,
                  padding: 8,
                  background: today ? '#fbf3e2' : '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontWeight: today ? 700 : 500,
                      fontSize: today ? 16 : 13,
                      color: today ? '#1f2430' : '#4a5160',
                    }}
                  >
                    {day.getDate()}
                    {today && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: 6,
                          padding: '1px 5px',
                          background: '#1f2430',
                          color: '#ffffff',
                          fontSize: 9,
                          letterSpacing: 1,
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateFor(dateKey)}
                    style={{
                      border: '1px solid #d6d1c5',
                      background: '#fff',
                      color: '#4a5160',
                      cursor: 'pointer',
                      fontSize: 11,
                      lineHeight: 1,
                    }}
                    title="일정 추가"
                  >
                    +
                  </button>
                </div>
                {ev.length === 0 && (
                  <div style={{ fontSize: 10.5, color: '#a0a0a0', fontFamily: 'JetBrains Mono, monospace' }}>No events</div>
                )}
                {ev.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      fontSize: 10.5,
                      padding: '4px 5px',
                      marginBottom: 4,
                      border: '1.5px solid #1f2430',
                      background: today ? '#c8a57a' : '#ffffff',
                    }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', marginRight: 5 }}>
                      {e.hour.padStart(2, '0')}:00
                    </span>
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
};
