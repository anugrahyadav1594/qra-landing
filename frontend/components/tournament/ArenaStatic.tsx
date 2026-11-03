/**
 * Handcrafted SVG arena — the brand's central visual signature.
 *
 * This is the graceful fallback (no WebGL, reduced motion, data saver, small
 * screens) *and* the placeholder shown while the Three.js bundle loads, so
 * the composition never flashes empty. Deterministic geometry only: no
 * randomness, so server and client markup match exactly.
 */

const TICKS = Array.from({ length: 72 }, (_, index) => index);
const CANDLE_HEIGHTS = [18, 34, 26, 46, 22, 38, 30, 52, 24, 40, 28, 44, 20, 36, 26, 48];
const MARKET_PATH =
  "M-235 26 L-206 8 L-190 34 L-166 12 L-142 44 L-118 20 L-96 52 L-70 26 L-46 62 L-22 34 L2 70 L26 44 L50 78 L74 52 L98 84 L122 60 L146 92 L172 66 L196 96 L220 74 L238 92";

export function ArenaStatic({
  className = "",
  animate = true,
  label,
}: {
  className?: string;
  animate?: boolean;
  label?: string;
}) {
  return (
    <svg
      viewBox="-300 -300 600 600"
      className={className}
      role="img"
      aria-label={label || "The MTT trading arena: an illuminated orange ring"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="arena-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFAA70" stopOpacity="0.55" />
          <stop offset="38%" stopColor="#F47C35" stopOpacity="0.24" />
          <stop offset="72%" stopColor="#F47C35" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#F47C35" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arena-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAA70" />
          <stop offset="45%" stopColor="#F47C35" />
          <stop offset="100%" stopColor="#A94A16" />
        </linearGradient>
        <linearGradient id="arena-tick-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFAA70" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F47C35" stopOpacity="0.15" />
        </linearGradient>
        <filter id="arena-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="arena-grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <circle cx="1" cy="1" r="0.4" fill="#F4F0E9" fillOpacity="0.05" />
        </pattern>
      </defs>

      {/* Ambient core light */}
      <circle r="270" fill="url(#arena-core-glow)" className={animate ? "animate-ring-pulse" : ""} />

      {/* Technical floor grid (perspective-free, concentric) */}
      <g stroke="#F4F0E9" strokeOpacity="0.05" strokeWidth="1" fill="none">
        {[120, 170, 225, 285].map((radius) => (
          <circle key={radius} r={radius} />
        ))}
        {TICKS.filter((index) => index % 6 === 0).map((index) => {
          const angle = (index / 72) * Math.PI * 2;
          return (
            <line
              key={index}
              x1={Math.cos(angle) * 96}
              y1={Math.sin(angle) * 96}
              x2={Math.cos(angle) * 285}
              y2={Math.sin(angle) * 285}
            />
          );
        })}
      </g>

      {/* Rotating tick ring */}
      <g className={animate ? "animate-ring-spin" : ""} style={{ transformOrigin: "center" }}>
        {TICKS.map((index) => {
          const angle = (index / 72) * Math.PI * 2;
          const major = index % 6 === 0;
          const inner = major ? 196 : 205;
          const outer = major ? 224 : 216;
          return (
            <line
              key={index}
              x1={Math.cos(angle) * inner}
              y1={Math.sin(angle) * inner}
              x2={Math.cos(angle) * outer}
              y2={Math.sin(angle) * outer}
              stroke={major ? "#FFAA70" : "url(#arena-tick-gradient)"}
              strokeOpacity={major ? 0.85 : 0.35}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* The ring — the signature element */}
      <circle
        r="185"
        fill="none"
        stroke="url(#arena-ring-gradient)"
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#arena-soft-glow)"
        opacity="0.95"
      />
      <circle r="185" fill="none" stroke="#FFF3E6" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle
        r="168"
        fill="none"
        stroke="#FFAA70"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="3 9"
      />

      {/* Arena segments */}
      <g fill="none" strokeLinecap="butt">
        {Array.from({ length: 8 }, (_, index) => {
          const start = (index / 8) * Math.PI * 2 + 0.06;
          const end = ((index + 1) / 8) * Math.PI * 2 - 0.06;
          const radius = 158;
          return (
            <path
              key={index}
              d={describeArc(0, 0, radius, start, end)}
              stroke="#F47C35"
              strokeOpacity={index % 2 === 0 ? 0.55 : 0.28}
              strokeWidth={index % 2 === 0 ? 4 : 2}
            />
          );
        })}
      </g>

      {/* Candlestick ring (market ignition) */}
      <g opacity="0.75">
        {CANDLE_HEIGHTS.map((height, index) => {
          const angle = (index / CANDLE_HEIGHTS.length) * Math.PI * 2;
          const radius = 246;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <g key={index} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(angle * 180) / Math.PI + 90})`}>
              <line x1="0" y1={-height / 2 - 6} x2="0" y2={height / 2 + 6} stroke="#FFAA70" strokeOpacity="0.35" strokeWidth="1" />
              <rect x="-3" y={-height / 2} width="6" height={height} rx="1" fill="#F47C35" fillOpacity={index % 3 === 0 ? 0.9 : 0.45} />
            </g>
          );
        })}
      </g>

      {/* Market line */}
      <g transform="translate(0 150)" opacity="0.6">
        <path d={MARKET_PATH} fill="none" stroke="#FFAA70" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
        <path d={MARKET_PATH} fill="none" stroke="#F47C35" strokeOpacity="0.9" strokeWidth="1.5" strokeDasharray="4 210" className={animate ? "chart-line" : ""} />
      </g>

      {/* Crosshair + HUD brackets */}
      <g stroke="#F4F0E9" strokeOpacity="0.16" strokeWidth="1">
        <line x1="-292" y1="0" x2="-236" y2="0" />
        <line x1="236" y1="0" x2="292" y2="0" />
        <line x1="0" y1="-292" x2="0" y2="-236" />
        <line x1="0" y1="236" x2="0" y2="292" />
      </g>
      <g stroke="#F47C35" strokeOpacity="0.5" strokeWidth="1.5" fill="none">
        <path d="M-292 -262 h26 M-292 -262 v26" />
        <path d="M292 -262 h-26 M292 -262 v26" />
        <path d="M-292 262 h26 M-292 262 v-26" />
        <path d="M292 262 h-26 M292 262 v-26" />
      </g>

      {/* Core */}
      <circle r="4" fill="#FFD3B8" />
      <circle r="11" fill="none" stroke="#F47C35" strokeOpacity="0.7" strokeWidth="1" />
      <circle r="26" fill="none" stroke="#F47C35" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />

      <rect x="-300" y="-300" width="600" height="600" fill="url(#arena-grain)" pointerEvents="none" />
    </svg>
  );
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;
  return [
    "M",
    start.x.toFixed(2),
    start.y.toFixed(2),
    "A",
    radius,
    radius,
    0,
    largeArc,
    1,
    end.x.toFixed(2),
    end.y.toFixed(2),
  ].join(" ");
}
