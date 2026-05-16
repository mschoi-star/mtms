// Hamster character — built only from circles/ellipses (no hand-drawn art).
// Renders an SVG, with optional running animation knobs.

const Hamster = ({ size = 72, flip = false, stride = 0 }) => {
  // stride: 0..1 oscillates for leg movement
  const legA = Math.sin(stride * Math.PI * 2);
  const legB = Math.sin(stride * Math.PI * 2 + Math.PI);
  const bob  = Math.sin(stride * Math.PI * 4) * 1.5;

  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 100 78"
      style={{ transform: `scaleX(${flip ? -1 : 1}) translateY(${bob}px)`, display:'block' }}
    >
      {/* back foot */}
      <ellipse cx={36 + legA*3} cy={68 + Math.abs(legA)*2} rx="9" ry="4" fill="#8a6a44" />
      {/* front foot */}
      <ellipse cx={66 + legB*3} cy={68 + Math.abs(legB)*2} rx="9" ry="4" fill="#8a6a44" />

      {/* body */}
      <ellipse cx="50" cy="46" rx="34" ry="22" fill="#c8a57a" />
      {/* belly */}
      <ellipse cx="50" cy="54" rx="24" ry="13" fill="#ecdfca" />

      {/* head */}
      <circle cx="76" cy="38" r="18" fill="#c8a57a" />
      {/* cheek */}
      <circle cx="72" cy="44" r="6" fill="#ecdfca" />
      {/* ear outer */}
      <ellipse cx="68" cy="22" rx="5" ry="6" fill="#c8a57a" />
      <ellipse cx="68" cy="23" rx="2.5" ry="3.5" fill="#8a6a44" />
      {/* ear behind */}
      <ellipse cx="82" cy="23" rx="4.5" ry="5.5" fill="#8a6a44" opacity="0.85" />

      {/* eye */}
      <circle cx="82" cy="36" r="2.4" fill="#1f2430" />
      {/* nose */}
      <circle cx="93" cy="40" r="1.8" fill="#1f2430" />

      {/* tail */}
      <circle cx="18" cy="48" r="3" fill="#ecdfca" />
    </svg>
  );
};

// Running troupe: multiple hamsters traveling across the screen at the bottom.
const HamsterRun = () => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Each hamster: speed (px/sec across viewport %), size, vertical offset, phase
  const troupe = React.useMemo(() => ([
    { speed: 14, size: 64, y: 0,   delay: 0   },
    { speed: 11, size: 84, y: 18,  delay: 4.2 },
    { speed: 18, size: 56, y: 6,   delay: 8.5 },
    { speed: 13, size: 72, y: 24,  delay: 12.1 },
    { speed: 16, size: 60, y: 12,  delay: 16.3 },
  ]), []);

  return (
    <div style={{
      position:'absolute', left:0, right:0, bottom:0, height: 180,
      pointerEvents:'none', overflow:'hidden'
    }}>
      {/* ground line */}
      <div style={{
        position:'absolute', left:0, right:0, bottom: 32, height:1,
        background: 'repeating-linear-gradient(90deg, #d6d1c5 0 6px, transparent 6px 12px)'
      }} />
      {troupe.map((h, i) => {
        const cycle = 100 + (h.size*0.9); // %
        const pct = ((t * h.speed + h.delay * h.speed) % cycle) - h.size*0.9;
        const stride = (t * 2.2 + i) % 1;
        return (
          <div key={i} style={{
            position:'absolute',
            left: `calc(${pct}% )`,
            bottom: 24 + h.y,
            transition: 'none'
          }}>
            <Hamster size={h.size} stride={stride} />
          </div>
        );
      })}
    </div>
  );
};

window.Hamster = Hamster;
window.HamsterRun = HamsterRun;
