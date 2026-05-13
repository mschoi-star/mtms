import { useState, useEffect } from 'react';
import { Section } from '../components/ui/Section';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { scheduleApi } from '../services/api';
import type { ScheduleEventOut } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Seed data week: 2026-05-11 ~ 2026-05-17
const WEEK_START = '2026-05-11';
const DATES = [11, 12, 13, 14, 15, 16, 17];
const TODAY_DATE = 13;

export const ScheduleApp = () => {
  const [events, setEvents] = useState<ScheduleEventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    scheduleApi
      .getWeek(WEEK_START)
      .then((r) => setEvents(r.data))
      .catch(() => setError('일정을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  // group events by day-of-month
  const byDate: Record<number, ScheduleEventOut[]> = {};
  events.forEach((e) => {
    const d = parseInt(e.event_date.split('-')[2], 10);
    (byDate[d] ??= []).push(e);
  });

  return (
    <div>
      <Section title="May 2026 · Week 20" right="13 · Wed">
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
          {DATES.map((d, i) => {
            const ev = byDate[d] ?? [];
            const today = d === TODAY_DATE;
            return (
              <div
                key={d}
                style={{
                  borderRight: i < 6 ? '1px solid #e6e3dd' : 'none',
                  minHeight: 120,
                  padding: 8,
                  background: today ? '#fbf3e2' : '#ffffff',
                }}
              >
                <div
                  style={{
                    fontWeight: today ? 700 : 500,
                    fontSize: today ? 16 : 13,
                    color: today ? '#1f2430' : '#4a5160',
                    marginBottom: 6,
                  }}
                >
                  {d}
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
                {ev.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      fontSize: 10.5,
                      padding: '3px 5px',
                      marginBottom: 3,
                      border: '1.5px solid #1f2430',
                      background: today ? '#c8a57a' : '#ffffff',
                    }}
                  >
                    <span
                      style={{ fontFamily: 'JetBrains Mono, monospace', marginRight: 5 }}
                    >
                      {e.hour}
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
