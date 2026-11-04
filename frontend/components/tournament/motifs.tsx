/**
 * Original vector motifs for the MTT landing page.
 *
 * Every motif is drawn here rather than sourced from stock iconography:
 * arena rings, measurement scales, network lattices, exhibition plinths and
 * market candlesticks. All of them are decorative (`aria-hidden`), inherit
 * `currentColor`, and use strokes instead of filters so they stay cheap to
 * paint. No image assets, no icon dependency.
 */

type MotifProps = {
  className?: string;
  /** Animation hooks — GSAP targets these; they never alter the artwork. */
  [key: `data-${string}`]: string | undefined;
};

/** Registration marks: four corner brackets on a panel. */
export function CornerMarks({ className = "", ...rest }: MotifProps) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <path d="M0 14 V0 H14" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M86 0 H100 V14" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M100 86 V100 H86" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M14 100 H0 V86" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** A measurement scale: baseline with ticks, used as a section detail. */
export function TickRule({ className = "", ticks = 24 , ...rest }: MotifProps & { ticks?: number }) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox={`0 0 ${ticks * 10} 12`}
      className={`h-3 w-full ${className}`}
      preserveAspectRatio="none"
    >
      <line x1="0" y1="11" x2={ticks * 10} y2="11" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      {Array.from({ length: ticks }).map((_, index) => (
        <line
          key={index}
          x1={index * 10 + 5}
          y1="11"
          x2={index * 10 + 5}
          y2={index % 4 === 0 ? 2 : 7}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity={index % 4 === 0 ? 0.7 : 0.28}
        />
      ))}
    </svg>
  );
}

/** The arena: concentric rings, radial spokes and a crosshair. */
export function ArenaSchematic({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className} fill="none"
      {...rest}>
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.6" opacity="0.22" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <circle cx="100" cy="100" r="34" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.9" />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index * Math.PI) / 6;
        return (
          <line
            key={index}
            x1={100 + Math.cos(angle) * 34}
            y1={100 + Math.sin(angle) * 34}
            x2={100 + Math.cos(angle) * (index % 3 === 0 ? 88 : 70)}
            y2={100 + Math.sin(angle) * (index % 3 === 0 ? 88 : 70)}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.3"
          />
        );
      })}
      <path d="M100 4 V22 M100 178 V196 M4 100 H22 M178 100 H196" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path
        d="M100 66 L128 100 L100 134 L72 100 Z"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.45"
      />
    </svg>
  );
}

/** Market candlesticks — a restrained trading motif for ambient detailing. */
export function CandleTicker({ className = "", ...rest }: MotifProps) {
  const candles = [
    { x: 8, open: 62, close: 34, wickTop: 26, wickBottom: 70 },
    { x: 30, open: 40, close: 58, wickTop: 30, wickBottom: 64 },
    { x: 52, open: 54, close: 26, wickTop: 18, wickBottom: 58 },
    { x: 74, open: 30, close: 16, wickTop: 10, wickBottom: 36 },
    { x: 96, open: 22, close: 44, wickTop: 14, wickBottom: 52 },
    { x: 118, open: 40, close: 22, wickTop: 16, wickBottom: 46 },
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 132 80" className={className} fill="none"
      {...rest}>
      {candles.map((candle, index) => {
        const top = Math.min(candle.open, candle.close);
        const height = Math.abs(candle.close - candle.open);
        return (
          <g key={candle.x} opacity={0.25 + index * 0.1}>
            <line
              x1={candle.x + 5}
              y1={candle.wickTop}
              x2={candle.x + 5}
              y2={candle.wickBottom}
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <rect
              x={candle.x}
              y={top}
              width="10"
              height={Math.max(height, 4)}
              fill="currentColor"
              opacity="0.55"
            />
          </g>
        );
      })}
      <path
        d="M13 46 L35 36 L57 40 L79 22 L101 30 L123 26"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.5"
      />
    </svg>
  );
}

/* ── Journey stage glyphs ───────────────────────────────────────────────
   One distinct geometric mark per tournament stage. Kept abstract so the
   motif never implies a rule or mechanic that has not been announced. */

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.1 } as const;

export function StageGlyph({ index, className = "" }: MotifProps & { index: number }) {
  const common = { "aria-hidden": true as const, viewBox: "0 0 40 40", className };
  switch (index) {
    // Registration — an entry card with a checked line
    case 0:
      return (
        <svg {...common}>
          <rect x="6" y="9" width="28" height="22" {...STROKE} opacity="0.55" />
          <path d="M6 16 H34" {...STROKE} opacity="0.35" />
          <path d="M12 24 L17 29 L28 19" {...STROKE} opacity="0.9" />
        </svg>
      );
    // College selection — an institution facade
    case 1:
      return (
        <svg {...common}>
          <path d="M5 33 H35" {...STROKE} opacity="0.5" />
          <path d="M8 33 V16 L20 8 L32 16 V33" {...STROKE} opacity="0.6" />
          <path d="M15 33 V23 H25 V33" {...STROKE} opacity="0.35" />
        </svg>
      );
    // Grouping by college — three nodes converging into one
    case 2:
      return (
        <svg {...common}>
          <circle cx="20" cy="29" r="4" {...STROKE} opacity="0.8" />
          <circle cx="9" cy="11" r="3" {...STROKE} opacity="0.5" />
          <circle cx="20" cy="9" r="3" {...STROKE} opacity="0.5" />
          <circle cx="31" cy="11" r="3" {...STROKE} opacity="0.5" />
          <path d="M11 14 L18 26 M20 12 V25 M29 14 L22 26" {...STROKE} opacity="0.35" />
        </svg>
      );
    // Qualifying rounds — a bracket
    case 3:
      return (
        <svg {...common}>
          <path d="M8 8 H18 V20 H30" {...STROKE} opacity="0.6" />
          <path d="M8 32 H18 V20" {...STROKE} opacity="0.6" />
          <path d="M30 14 V26 H36" {...STROKE} opacity="0.9" />
        </svg>
      );
    // Progression — ascending steps with an arrow
    case 4:
      return (
        <svg {...common}>
          <path d="M6 32 H14 V25 H22 V18 H30 V11 H36" {...STROKE} opacity="0.55" />
          <path d="M28 6 L36 11 L28 16" {...STROKE} opacity="0.9" />
        </svg>
      );
    // The final competition — the arena ring
    case 5:
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="13" {...STROKE} opacity="0.6" />
          <circle cx="20" cy="20" r="6" {...STROKE} opacity="0.35" />
          <circle cx="20" cy="20" r="1.6" fill="currentColor" opacity="0.9" />
          <path d="M20 4 V9 M20 31 V36 M4 20 H9 M31 20 H36" {...STROKE} opacity="0.5" />
        </svg>
      );
    // Winners and prizes — a podium
    default:
      return (
        <svg {...common}>
          <path d="M6 33 H34" {...STROKE} opacity="0.5" />
          <rect x="15" y="13" width="10" height="20" {...STROKE} opacity="0.8" />
          <rect x="6" y="21" width="9" height="12" {...STROKE} opacity="0.45" />
          <rect x="25" y="25" width="9" height="8" {...STROKE} opacity="0.45" />
          <path d="M15 13 V9 H25 V13" {...STROKE} opacity="0.6" />
        </svg>
      );
  }
}

/** Campus network: a lattice of open nodes waiting to be filled. */
export function NetworkLattice({ className = "", ...rest }: MotifProps) {
  const nodes = [
    { x: 120, y: 40 },
    { x: 200, y: 78 },
    { x: 62, y: 96 },
    { x: 158, y: 128 },
    { x: 244, y: 142 },
    { x: 96, y: 172 },
    { x: 210, y: 196 },
    { x: 40, y: 150 },
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
    [5, 7],
    [5, 6],
    [4, 6],
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 280 230" className={className} fill="none"
      {...rest}>
      {/* connecting lattice */}
      {links.map(([a, b], index) => (
        <line
          key={index}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeDasharray="3 5"
          opacity="0.32"
        />
      ))}
      {/* central arena */}
      <circle cx="150" cy="118" r="58" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <circle cx="150" cy="118" r="38" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      <circle cx="150" cy="118" r="2.5" fill="currentColor" opacity="0.85" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={150 + Math.cos(rad) * 38}
            y1={118 + Math.sin(rad) * 38}
            x2={150 + Math.cos(rad) * 58}
            y2={118 + Math.sin(rad) * 58}
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
        );
      })}
      {/* open slots */}
      {nodes.map((node, index) => (
        <g key={index}>
          <circle
            cx={node.x}
            cy={node.y}
            r={7}
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="2.5 3"
            opacity={index % 3 === 0 ? 0.75 : 0.45}
          />
          <circle cx={node.x} cy={node.y} r="2" fill="currentColor" opacity="0.4" />
        </g>
      ))}
      {/* measurement annotations */}
      <path d="M150 196 V214" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <path d="M120 214 H180" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
    </svg>
  );
}

/** Exhibition wall: empty plinths and hanging wires for the partner wall. */
export function ExhibitionWall({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 160" className={className} fill="none"
      {...rest}>
      {/* gallery rail */}
      <path d="M10 18 H310" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      {[70, 160, 250].map((x, index) => (
        <g key={x}>
          {/* wire */}
          <path d={`M${x} 18 V${34 + index * 2}`} stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
          {/* empty frame */}
          <rect
            x={x - 42}
            y={34 + index * 2}
            width="84"
            height="52"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d={`M${x - 42} ${86 + index * 2} L${x} ${60 + index * 2} L${x + 42} ${86 + index * 2}`}
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.25"
          />
        </g>
      ))}
      {/* plinths */}
      {[70, 160, 250].map((x, index) => (
        <g key={`plinth-${x}`}>
          <path
            d={`M${x - 26} ${144 - index} L${x + 26} ${144 - index} L${x + 20} ${126 - index} L${x - 20} ${126 - index} Z`}
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.4"
          />
          <path d={`M${x - 30} ${150 - index} H${x + 30}`} stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </g>
      ))}
      {/* floor ticks */}
      {Array.from({ length: 21 }).map((_, index) => (
        <line
          key={index}
          x1={10 + index * 15}
          y1="158"
          x2={10 + index * 15}
          y2={index % 4 === 0 ? 150 : 154}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.22"
        />
      ))}
    </svg>
  );
}

/** Prize index crest: a plinth with radial detailing, no trophy clipart. */
export function PrizeCrest({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className={className} fill="none"
      {...rest}>
      <circle cx="60" cy="52" r="34" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      <circle cx="60" cy="52" r="24" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <circle cx="60" cy="52" r="12" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <circle cx="60" cy="52" r="2.5" fill="currentColor" opacity="0.9" />
      {Array.from({ length: 24 }).map((_, index) => {
        const rad = (index * Math.PI) / 12;
        const inner = index % 2 === 0 ? 34 : 30;
        return (
          <line
            key={index}
            x1={60 + Math.cos(rad) * inner}
            y1={52 + Math.sin(rad) * inner}
            x2={60 + Math.cos(rad) * 44}
            y2={52 + Math.sin(rad) * 44}
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
        );
      })}
      <path d="M28 100 H92 L84 84 H36 Z" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <path d="M20 108 H100" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

/** Thin podium silhouette used behind the champion figure. */
export function PodiumSilhouette({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 90" className={className} fill="none" preserveAspectRatio="none"
      {...rest}>
      <rect x="112" y="18" width="76" height="60" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <rect x="26" y="46" width="86" height="32" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <rect x="188" y="56" width="86" height="22" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <path d="M0 78 H300" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
    </svg>
  );
}

/** Briefing board motif: indexed document lines with a status stem. */
export function BriefingMotif({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 160" className={className} fill="none"
      {...rest}>
      <rect x="18" y="14" width="124" height="132" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      <path d="M18 34 H142" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
      <circle cx="27" cy="24" r="2" fill="currentColor" opacity="0.6" />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <g key={index}>
          <path
            d={`M32 ${52 + index * 16} H${index % 2 === 0 ? 118 : 96}`}
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.32"
          />
          <circle cx="26" cy={52 + index * 16} r="1.4" fill="currentColor" opacity="0.45" />
        </g>
      ))}
      <path d="M124 118 L142 118 L142 100" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <path d="M134 106 L142 100 L150 106" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
    </svg>
  );
}

/* ── Prize pool motifs (Phase 2) ──────────────────────────────────────── */

/** Radial measurement rings: calibrated circles with radial tick marks. */
export function MeasurementRings({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 600" className={className} fill="none"
      {...rest}>
      {[290, 232, 174, 116].map((radius, index) => (
        <circle
          key={radius}
          cx="300"
          cy="300"
          r={radius}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeDasharray={index % 2 === 0 ? "0" : "2 8"}
          opacity={0.1 + index * 0.05}
        />
      ))}
      {Array.from({ length: 72 }).map((_, index) => {
        const angle = (index * Math.PI) / 36;
        const long = index % 6 === 0;
        return (
          <line
            key={index}
            x1={300 + Math.cos(angle) * 290}
            y1={300 + Math.sin(angle) * 290}
            x2={300 + Math.cos(angle) * (long ? 262 : 278)}
            y2={300 + Math.sin(angle) * (long ? 262 : 278)}
            stroke="currentColor"
            strokeWidth="0.7"
            opacity={long ? 0.4 : 0.16}
          />
        );
      })}
      <circle cx="300" cy="300" r="58" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="300" cy="300" r="3" fill="currentColor" opacity="0.7" />
      <path d="M300 8 V40 M300 560 V592 M8 300 H40 M560 300 H592" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

/**
 * Custom championship emblem — an abstract mark built from layered geometry
 * and radial light, deliberately not a trophy: no clipart, no literal cup.
 */
export function ChampionEmblem({ className = "", ...rest }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className={className} fill="none"
      {...rest}>
      <defs>
        <linearGradient id="mtt-champion-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc08e" />
          <stop offset="55%" stopColor="#ff914a" />
          <stop offset="100%" stopColor="#ff792f" />
        </linearGradient>
      </defs>
      {/* outer calibration ring */}
      <circle cx="60" cy="58" r="52" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      {Array.from({ length: 24 }).map((_, index) => {
        const rad = (index * Math.PI) / 12;
        return (
          <line
            key={index}
            x1={60 + Math.cos(rad) * 44}
            y1={58 + Math.sin(rad) * 44}
            x2={60 + Math.cos(rad) * (index % 2 === 0 ? 52 : 48)}
            y2={58 + Math.sin(rad) * (index % 2 === 0 ? 52 : 48)}
            stroke="currentColor"
            strokeWidth="0.8"
            opacity={index % 2 === 0 ? 0.5 : 0.22}
          />
        );
      })}
      {/* faceted championship face */}
      <path
        d="M60 14 L96 32 V70 L60 96 L24 70 V32 Z"
        fill="url(#mtt-champion-face)"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.95"
      />
      <path d="M60 14 L96 32 L60 50 L24 32 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="0.7" opacity="0.8" />
      <path d="M24 70 L60 50 V96 Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M96 70 L60 50 V96 Z" fill="currentColor" fillOpacity="0.05" />
      <circle cx="60" cy="52" r="9" stroke="currentColor" strokeWidth="1" opacity="0.9" />
      <path d="M60 43 L63 52 L60 61 L57 52 Z" fill="currentColor" opacity="0.9" />
      {/* plinth */}
      <path d="M38 104 H82 L76 96 H44 Z" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <path d="M28 110 H92" stroke="currentColor" strokeWidth="0.9" opacity="0.35" />
    </svg>
  );
}

/** Three-level geometric podium foundation that the cards stand on. */
export function PodiumPlatform({ className = "", ...rest }: MotifProps) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 900 60"
      className={className}
      fill="none"
      preserveAspectRatio="none"
    >
      <path d="M0 26 H900" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <path d="M300 26 V0 M600 26 V0" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <path d="M300 26 H600 V60 H300 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      <path d="M180 26 H300 V46 H180 Z" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
      <path d="M600 26 H720 V46 H600 Z" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
      {Array.from({ length: 31 }).map((_, index) => (
        <line
          key={index}
          x1={index * 30}
          y1="26"
          x2={index * 30}
          y2={index % 5 === 0 ? 16 : 21}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.18"
        />
      ))}
    </svg>
  );
}

/**
 * Abstract merchandise composition: package silhouettes and inventory
 * forms. Decorative only — no branded products, no claimed inclusions.
 */


/* ── Championship arena motifs (Phase 3) ─────────────────────────────── */

/**
 * Abstract laurel crest — two stroked branches around a championship mark.
 * Every stroke carries `pathLength={100}`, so the drawing animation is a
 * single strokeDashoffset tween and the resting state is the drawn state.
 */
export function LaurelCrest({ className = "", ...rest }: MotifProps) {
  const branch = (side: 1 | -1) =>
    Array.from({ length: 6 }).map((_, index) => {
      const t = index / 5;
      const x = side * (16 + t * 34);
      const y = 62 - t * 46;
      return (
        <path
          key={`${side}-${index}`}
          d={`M${side * 6} ${74 - t * 6} Q${x} ${y - 8} ${side * (24 + t * 12)} ${y}`}
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          opacity={0.35 + t * 0.5}
          pathLength={100}
        />
      );
    });

  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 120 90"
      className={`mtt-laurel ${className}`}
      fill="none"
    >
      {branch(-1)}
      {branch(1)}
      <path
        d="M60 10 L66 22 L60 34 L54 22 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        pathLength={100}
        opacity="0.95"
      />
      <path
        d="M34 16 L60 4 L86 16"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
        pathLength={100}
        opacity="0.6"
      />
      <path
        d="M22 78 H98"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
        pathLength={100}
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Fallback environment: an abstract Mumbai waterfront — a domed structure
 * left, a skyline right, a reflective water band. Purely atmospheric; it
 * makes no claim about the venue or the view from it.
 */
export function MumbaiHorizon({ className = "", ...rest }: MotifProps) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 1440 520"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="mtt-horizon-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0e13" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#08090b" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="mtt-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff792f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Left: domed waterfront structure and spire */}
      <g opacity="0.5">
        <path d="M120 330 V250 H170 V330" stroke="currentColor" strokeWidth="1" />
        <path d="M124 250 Q145 206 166 250 Z" stroke="currentColor" strokeWidth="1" />
        <path d="M145 206 V176" stroke="currentColor" strokeWidth="1" />
        <path d="M139 176 h12" stroke="currentColor" strokeWidth="1" />
        <path d="M200 330 V272 H232 V330" stroke="currentColor" strokeWidth="1" />
        <path d="M216 272 V244" stroke="currentColor" strokeWidth="1" />
        <path d="M212 244 q4 -14 8 0" stroke="currentColor" strokeWidth="1" />
      </g>

      {/* Right: skyline */}
      <g opacity="0.42">
        {[
          [1010, 214],
          [1060, 168],
          [1096, 246],
          [1140, 130],
          [1180, 292],
          [1236, 186],
          [1282, 244],
          [1330, 152],
          [1364, 208],
        ].map(([x, height]) => (
          <path key={x} d={`M${x} 330 V${330 - height}`} stroke="currentColor" strokeWidth="6" />
        ))}
        {[1180, 1282].map((x) => (
          <path key={`mast-${x}`} d={`M${x} 38 v-26`} stroke="currentColor" strokeWidth="1" />
        ))}
      </g>

      {/* Civic blocks between the two */}
      <g opacity="0.3">
        {Array.from({ length: 18 }).map((_, index) => {
          const x = 300 + index * 38;
          const h = 22 + ((index * 37) % 46);
          return <path key={x} d={`M${x} 330 V${330 - h}`} stroke="currentColor" strokeWidth="5" />;
        })}
      </g>

      {/* Waterfront line + reflection */}
      <path d="M0 330 H1440" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <rect x="0" y="330" width="1440" height="120" fill="url(#mtt-water)" />
      {Array.from({ length: 24 }).map((_, index) => {
        const y = 340 + index * 4;
        const inset = index * 14;
        return (
          <path
            key={y}
            d={`M${inset} ${y} H${1440 - inset}`}
            stroke="currentColor"
            strokeWidth="0.6"
            opacity={0.15 - index * 0.005}
          />
        );
      })}
      <rect x="0" y="300" width="1440" height="220" fill="url(#mtt-horizon-fade)" />
    </svg>
  );
}

/** Orange market wave: layered market paths for the lower atmosphere. */
export function MarketWave({ className = "", ...rest }: MotifProps) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 1200 300"
      className={className}
      fill="none"
      preserveAspectRatio="none"
    >
      {[0, 1, 2].map((row) => (
        <path
          key={row}
          d={`M0 ${210 - row * 34} C 140 ${150 - row * 40}, 240 ${250 - row * 30}, 380 ${
            180 - row * 36
          } S 620 ${90 - row * 26}, 760 ${160 - row * 32} S 1000 ${230 - row * 28}, 1200 ${
            120 - row * 30
          }`}
          stroke="currentColor"
          strokeWidth={1.2 - row * 0.25}
          opacity={0.5 - row * 0.14}
          pathLength={100}
        />
      ))}
      {Array.from({ length: 40 }).map((_, index) => {
        const x = 8 + index * 30;
        const h = 18 + ((index * 53) % 60);
        return (
          <line
            key={x}
            x1={x}
            y1="286"
            x2={x}
            y2={286 - h}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.32"
          />
        );
      })}
    </svg>
  );
}

/**
 * Merchandise composition: stacked geometric packages under an abstract
 * championship emblem. Illustrative only — it does not depict, name or
 * promise any specific item.
 */
export function MerchCrest({ className = "", ...rest }: MotifProps) {
  return (
    <svg
      {...rest}
      aria-hidden="true"
      viewBox="0 0 200 120"
      className={className}
      fill="none"
    >
      <path d="M20 100 L58 78 L96 100 L58 122 Z" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.5" />
      <path d="M20 100 V58 L58 36 V78" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.35" />
      <path d="M96 100 V58 L58 36" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.35" />
      <path
        d="M70 66 L104 46 L138 66 L104 86 Z"
        stroke="currentColor"
        pathLength={100} strokeWidth="1.1"
        opacity="0.8"
      />
      <path d="M70 66 V30 L104 10 V46" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.45" />
      <path d="M138 66 V30 L104 10" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.45" />
      <path
        d="M118 34 L152 14 L186 34 L152 54 Z"
        stroke="currentColor"
        pathLength={100} strokeWidth="1.2"
        opacity="0.95"
      />
      <path d="M118 34 V4 L152 -16 V14" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.45" />
      <path d="M118 34 L152 14 L186 34 L152 54 Z" fill="currentColor" fillOpacity="0.08" />
      <circle cx="152" cy="34" r="7" stroke="currentColor" pathLength={100} strokeWidth="1" opacity="0.9" />
      <path d="M152 27 v14 M145 34 h14" stroke="currentColor" pathLength={100} strokeWidth="0.8" opacity="0.7" />
      <path d="M6 112 H194" stroke="currentColor" pathLength={100} strokeWidth="0.8" opacity="0.25" />
      {Array.from({ length: 20 }).map((_, index) => (
        <line
          key={index}
          x1={6 + index * 10}
          y1="112"
          x2={6 + index * 10}
          y2={index % 3 === 0 ? 106 : 109}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
        />
      ))}
    </svg>
  );
}
