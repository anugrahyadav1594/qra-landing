/**
 * Original vector motifs for the MTT landing page.
 *
 * Every motif is drawn here rather than sourced from stock iconography:
 * arena rings, measurement scales, network lattices, exhibition plinths and
 * market candlesticks. All of them are decorative (`aria-hidden`), inherit
 * `currentColor`, and use strokes instead of filters so they stay cheap to
 * paint. No image assets, no icon dependency.
 */

type MotifProps = { className?: string };

/** Registration marks: four corner brackets on a panel. */
export function CornerMarks({ className = "" }: MotifProps) {
  return (
    <svg
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
export function TickRule({ className = "", ticks = 24 }: MotifProps & { ticks?: number }) {
  return (
    <svg
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
export function ArenaSchematic({ className = "" }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className} fill="none">
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
export function CandleTicker({ className = "" }: MotifProps) {
  const candles = [
    { x: 8, open: 62, close: 34, wickTop: 26, wickBottom: 70 },
    { x: 30, open: 40, close: 58, wickTop: 30, wickBottom: 64 },
    { x: 52, open: 54, close: 26, wickTop: 18, wickBottom: 58 },
    { x: 74, open: 30, close: 16, wickTop: 10, wickBottom: 36 },
    { x: 96, open: 22, close: 44, wickTop: 14, wickBottom: 52 },
    { x: 118, open: 40, close: 22, wickTop: 16, wickBottom: 46 },
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 132 80" className={className} fill="none">
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
export function NetworkLattice({ className = "" }: MotifProps) {
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
    <svg aria-hidden="true" viewBox="0 0 280 230" className={className} fill="none">
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
export function ExhibitionWall({ className = "" }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 160" className={className} fill="none">
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
export function PrizeCrest({ className = "" }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className={className} fill="none">
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
export function PodiumSilhouette({ className = "" }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 90" className={className} fill="none" preserveAspectRatio="none">
      <rect x="112" y="18" width="76" height="60" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <rect x="26" y="46" width="86" height="32" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <rect x="188" y="56" width="86" height="22" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <path d="M0 78 H300" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
    </svg>
  );
}

/** Briefing board motif: indexed document lines with a status stem. */
export function BriefingMotif({ className = "" }: MotifProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 160" className={className} fill="none">
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
