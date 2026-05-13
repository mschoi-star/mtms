import { useState, useEffect, useMemo } from 'react';
import { Hamster } from './Hamster';

const TROUPE = [
  { speed: 14, size: 64, y: 0,  delay: 0    },
  { speed: 11, size: 84, y: 18, delay: 4.2  },
  { speed: 18, size: 56, y: 6,  delay: 8.5  },
  { speed: 13, size: 72, y: 24, delay: 12.1 },
  { speed: 16, size: 60, y: 12, delay: 16.3 },
];

export const HamsterRun = () => {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const troupe = useMemo(() => TROUPE, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 180,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 32,
          height: 1,
          background:
            'repeating-linear-gradient(90deg, #d6d1c5 0 6px, transparent 6px 12px)',
        }}
      />
      {troupe.map((h, i) => {
        const cycle = 100 + h.size * 0.9;
        const pct = ((t * h.speed + h.delay * h.speed) % cycle) - h.size * 0.9;
        const stride = (t * 2.2 + i) % 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(${pct}%)`,
              bottom: 24 + h.y,
              transition: 'none',
            }}
          >
            <Hamster size={h.size} stride={stride} />
          </div>
        );
      })}
    </div>
  );
};
