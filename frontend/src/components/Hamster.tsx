interface HamsterProps {
  size?: number;
  flip?: boolean;
  stride?: number;
}

export const Hamster = ({ size = 72, flip = false, stride = 0 }: HamsterProps) => {
  const legA = Math.sin(stride * Math.PI * 2);
  const legB = Math.sin(stride * Math.PI * 2 + Math.PI);
  const bob = Math.sin(stride * Math.PI * 4) * 1.5;

  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 100 78"
      style={{
        transform: `scaleX(${flip ? -1 : 1}) translateY(${bob}px)`,
        display: 'block',
      }}
    >
      {/* back foot */}
      <ellipse cx={36 + legA * 3} cy={68 + Math.abs(legA) * 2} rx="9" ry="4" fill="#8a6a44" />
      {/* front foot */}
      <ellipse cx={66 + legB * 3} cy={68 + Math.abs(legB) * 2} rx="9" ry="4" fill="#8a6a44" />
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
