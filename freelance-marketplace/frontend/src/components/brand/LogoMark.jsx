/**
 * LogoMark — the standalone symbol.
 *
 * Designed as an SVG so it scales cleanly at any size, from a 16px
 * favicon to a 96px loading screen. Colors are hard-coded to the
 * brand palette so the mark always reads correctly on light, dark,
 * or brand-colored backgrounds.
 *
 * Props:
 *   size    number   pixel size (square). Default 32.
 *   className string additional classes (e.g., for margins)
 */

export default function LogoMark({ size = 32, className = "" }) {
  return (
    <svg
      role="img"
      aria-label="Freelance Marketplace"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="fm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#338bff" />
          <stop offset="100%" stopColor="#1657e1" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#fm-grad)" />

      {/* Stylized "F" made of two stacked bars + a tail
          The tail doubles as an arrow pointing up-right,
          suggesting growth and movement. */}
      <path
        d="M 20 18 H 44 V 26 H 30 V 32 H 42 V 40 H 30 V 48 H 20 Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M 38 40 L 46 32"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}