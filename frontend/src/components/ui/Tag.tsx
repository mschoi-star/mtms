interface TagProps {
  children: React.ReactNode;
  tone?: 'ink' | 'warm';
}

export const Tag = ({ children, tone = 'ink' }: TagProps) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      fontSize: 10.5,
      fontWeight: 600,
      fontFamily: 'JetBrains Mono, monospace',
      letterSpacing: 0.6,
      border: '1.5px solid #1f2430',
      background: tone === 'warm' ? '#c8a57a' : '#ffffff',
      color: '#1f2430',
    }}
  >
    {children}
  </span>
);
