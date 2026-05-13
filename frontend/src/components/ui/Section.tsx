interface SectionProps {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export const Section = ({ title, right, children }: SectionProps) => (
  <section style={{ padding: '18px 22px', borderBottom: '1px solid #e6e3dd' }}>
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#1f2430',
        }}
      >
        {title}
      </h2>
      {right && (
        <div
          style={{
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#4a5160',
          }}
        >
          {right}
        </div>
      )}
    </header>
    {children}
  </section>
);
