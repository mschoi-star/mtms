export const Loading = () => (
  <div
    style={{
      padding: '40px 22px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      color: '#4a5160',
      letterSpacing: 1,
    }}
  >
    — loading…
  </div>
);

export const ApiError = ({ message }: { message: string }) => (
  <div
    style={{
      padding: '40px 22px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      color: '#4a5160',
      letterSpacing: 1,
    }}
  >
    <span style={{ color: '#c8a57a', marginRight: 6 }}>!</span>
    {message}
  </div>
);
