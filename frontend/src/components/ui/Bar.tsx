interface BarProps {
  value: number;
  label: string;
}

export const Bar = ({ value, label }: BarProps) => (
  <div style={{ marginBottom: 10 }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11.5,
        marginBottom: 4,
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}%</span>
    </div>
    <div
      style={{
        height: 10,
        border: '1.5px solid #1f2430',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: '#c8a57a',
        }}
      />
    </div>
  </div>
);
