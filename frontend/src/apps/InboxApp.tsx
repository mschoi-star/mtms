import { useState, useEffect } from 'react';
import { Loading, ApiError } from '../components/ui/AsyncState';
import { inboxApi } from '../services/api';
import type { MessageOut } from '../types';

const primaryBtn: React.CSSProperties = {
  padding: '7px 14px',
  border: '1.5px solid #1f2430',
  background: '#c8a57a',
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: 0.8,
};

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px',
  border: '1.5px solid #1f2430',
  background: '#ffffff',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
  letterSpacing: 0.8,
};

export const InboxApp = () => {
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [selected, setSelected] = useState<MessageOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inboxApi
      .list()
      .then((r) => {
        setMessages(r.data);
        if (r.data.length > 0) setSelected(r.data[0]);
      })
      .catch(() => setError('메시지를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (msg: MessageOut) => {
    setSelected(msg);
    if (msg.is_unread) {
      try {
        const updated = await inboxApi.markRead(msg.id);
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated.data : m)));
        setSelected(updated.data);
      } catch {
        // non-critical; ignore
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <ApiError message={error} />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100%' }}>
      {/* Message list */}
      <aside style={{ borderRight: '1.5px solid #1f2430', overflow: 'auto' }}>
        {messages.map((m, i) => (
          <div
            key={m.id}
            onClick={() => handleSelect(m)}
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #e6e3dd',
              background: m.id === selected?.id ? '#fbf3e2' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: m.is_unread ? 700 : 500, fontSize: 12.5 }}>
                {m.sender_name}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#4a5160',
                }}
              >
                {new Date(m.sent_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#4a5160', marginTop: 2 }}>{m.subject}</div>
            {m.is_unread && (
              <div
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  background: '#c8a57a',
                  border: '1px solid #1f2430',
                  marginTop: 6,
                }}
              />
            )}
          </div>
        ))}
      </aside>

      {/* Message detail */}
      <article style={{ padding: '22px 26px', overflow: 'auto' }}>
        {selected ? (
          <>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#4a5160',
              }}
            >
              from: {selected.sender_email} ·{' '}
              {new Date(selected.sent_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <h1 style={{ margin: '6px 0 14px', fontSize: 20 }}>{selected.subject}</h1>
            {selected.body ? (
              selected.body.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.6 }}>
                  {para}
                </p>
              ))
            ) : (
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#4a5160' }}>
                — 본문이 없습니다 —
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={primaryBtn}>Approve</button>
              <button style={ghostBtn}>Request changes</button>
            </div>
          </>
        ) : (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: '#4a5160',
              letterSpacing: 1,
            }}
          >
            — 메시지를 선택해 주세요 —
          </div>
        )}
      </article>
    </div>
  );
};
