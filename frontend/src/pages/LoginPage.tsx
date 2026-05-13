import { useState, useEffect } from 'react';
import { Hamster } from '../components/Hamster';
import { HamsterRun } from '../components/HamsterRun';
import { authApi, saveSession } from '../services/api';
import type { User } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #1f2430',
  background: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#1f2430',
  outline: 'none',
  borderRadius: 0,
};

const kbd: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  padding: '1px 6px',
  border: '1px solid #1f2430',
  background: '#ffffff',
  color: '#1f2430',
  marginInline: 2,
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
  <label style={{ display: 'block', marginTop: 12 }}>
    <span
      style={{
        display: 'block',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10.5,
        letterSpacing: 1.6,
        color: '#4a5160',
        marginBottom: 5,
      }}
    >
      {label.toUpperCase()}
    </span>
    {children}
  </label>
);

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!id.trim()) { setError('ID를 입력해 주세요.'); return; }
    if (!pw.trim()) { setError('비밀번호를 입력해 주세요.'); return; }
    setBusy(true);
    try {
      const res = await authApi.login(id.trim(), pw);
      const { access_token, user_email, user_name } = res.data;
      saveSession(access_token, { id: user_email, name: user_name }, remember);
      onLogin({ id: user_email, name: user_name, remember });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(msg ?? '로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        background: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top OS bar */}
      <div
        style={{
          height: 28,
          flexShrink: 0,
          borderBottom: '1.5px solid #1f2430',
          background: '#1f2430',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        <span style={{ fontWeight: 700, marginRight: 18 }}>▚ MTMS</span>
        <span style={{ opacity: 0.7 }}>Sign in</span>
        <div style={{ flex: 1 }} />
        <span>
          {time.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </div>

      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: '28px 0 0 0',
          backgroundImage: `
            linear-gradient(#f3eee2 1px, transparent 1px),
            linear-gradient(90deg, #f3eee2 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Center stage */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 2,
        }}
      >
        <form
          onSubmit={submit}
          style={{
            width: 440,
            background: '#ffffff',
            border: '1.5px solid #1f2430',
            boxShadow: '4px 4px 0 #1f2430, 0 24px 50px -20px rgba(31,36,48,0.4)',
            position: 'relative',
          }}
        >
          {/* Window titlebar */}
          <div
            style={{
              height: 32,
              borderBottom: '1.5px solid #1f2430',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              backgroundImage:
                'repeating-linear-gradient(0deg, #ffffff 0 3px, #f1ede3 3px 4px)',
            }}
          >
            <div style={{ display: 'flex', gap: 7 }}>
              {(['#c8a57a', '#ffffff', '#ffffff'] as const).map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: color,
                    border: '1px solid #1f2430',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11.5,
                letterSpacing: 1.4,
              }}
            >
              auth.mtms — sign in
            </div>
            <div style={{ width: 39 }} />
          </div>

          {/* Hamster mascot */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingTop: 24,
              paddingBottom: 6,
              borderBottom: '1px dashed #d6d1c5',
            }}
          >
            <Hamster size={96} />
          </div>

          {/* Form body */}
          <div style={{ padding: '24px 28px 22px' }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10.5,
                letterSpacing: 2,
                color: '#4a5160',
                marginBottom: 6,
              }}
            >
              SIGN IN / 로그인
            </div>
            <h1
              style={{
                margin: '0 0 18px',
                fontSize: 26,
                lineHeight: 1.1,
                letterSpacing: -0.4,
              }}
            >
              MPSE Total{' '}
              <span style={{ color: '#c8a57a' }}>Manager</span> System
            </h1>

            <Field label="ID">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoFocus
                placeholder="ex) kim.s@mpse-cae.com"
                style={inputStyle}
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 14,
                marginBottom: error ? 10 : 18,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#1f2430',
                }}
              >
                <span
                  onClick={() => setRemember((v) => !v)}
                  style={{
                    width: 16,
                    height: 16,
                    border: '1.5px solid #1f2430',
                    background: remember ? '#c8a57a' : '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: '#1f2430',
                    fontWeight: 700,
                  }}
                >
                  {remember ? '×' : ''}
                </span>
                <span>Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setError('관리자에게 문의해 주세요.');
                }}
                style={{
                  fontSize: 12,
                  color: '#1f2430',
                  textDecoration: 'underline',
                  textDecorationColor: '#c8a57a',
                  textUnderlineOffset: 3,
                }}
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div
                style={{
                  fontSize: 12,
                  padding: '8px 10px',
                  marginBottom: 14,
                  border: '1.5px solid #1f2430',
                  background: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <span style={{ color: '#c8a57a', marginRight: 6 }}>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #1f2430',
                background: busy ? '#ffffff' : '#c8a57a',
                color: '#1f2430',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1.4,
                cursor: busy ? 'progress' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: busy ? 'none' : '3px 3px 0 #1f2430',
                transform: busy ? 'translate(2px, 2px)' : 'none',
                transition: 'transform 80ms ease, box-shadow 80ms ease',
              }}
            >
              {busy ? 'AUTHENTICATING…' : 'SIGN IN'}
            </button>

            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px dashed #d6d1c5',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#4a5160',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <span>v2.6.1 · build 240513</span>
              <span>
                <span style={{ color: '#c8a57a' }}>●</span> server: ok
              </span>
            </div>
          </div>
        </form>
      </div>

      <HamsterRun />

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5,
          color: '#4a5160',
          letterSpacing: 1.4,
          zIndex: 1,
        }}
      >
        Press <kbd style={kbd}>Enter</kbd> to sign in ·{' '}
        <kbd style={kbd}>Tab</kbd> to move between fields
      </div>
    </div>
  );
};
