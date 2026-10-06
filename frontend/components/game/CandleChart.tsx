import { ARENA_CANDLES, ARENA_EMA } from "@/lib/content";

/**
 * The site's one chart.
 *
 * A candlestick chart drawn in the QRA register: deep surface, hairline grid,
 * cobalt for rising bars, hollow slate for falling ones — the Japanese
 * convention, kept monochrome enough to sit inside a fintech interface rather
 * than a trading terminal.
 *
 * The defining behaviour is the withheld future. Everything past `played` is
 * not simply absent: it is shown as a hatched region the visitor can see is
 * being kept from them, with the replay head marking where the decision is
 * asked. That is the product's whole premise, drawn.
 *
 * Pure SVG with CSS animation — no chart library, no client JavaScript.
 */

const STEP = 14;
const BODY = 6.5;
const VIEW_H = 100;
const PAD_Y = 8;

/** Map a 0..100 price value onto the viewBox, bottom-up. */
function y(value: number): number {
  const usable = VIEW_H - PAD_Y * 2;
  return VIEW_H - PAD_Y - (value / 100) * usable;
}

export function CandleChart({
  candles = ARENA_CANDLES,
  ema = ARENA_EMA,
  played = 0.62,
  className = "",
  labelHidden = "Hidden",
}: {
  candles?: ReadonlyArray<readonly [number, number, number, number]>;
  ema?: readonly number[];
  /** How much of the session has played, 0..1. The rest is withheld. */
  played?: number;
  className?: string;
  labelHidden?: string;
}) {
  const count = candles.length;
  const viewW = count * STEP;
  const revealed = Math.max(1, Math.round(count * played));
  const headX = revealed * STEP;

  // The trend line, drawn only as far as the replay has reached.
  const emaPath = ema
    .slice(0, revealed)
    .map((value, index) => `${index === 0 ? "M" : "L"}${index * STEP + STEP / 2} ${y(value)}`)
    .join(" ");

  return (
    <div className={`candle-chart relative ${className}`}>
      <svg
        viewBox={`0 0 ${viewW} ${VIEW_H}`}
        className="block h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Historical price chart, ${revealed} of ${count} sessions shown, the remainder hidden`}
      >
        <defs>
          {/* The withheld region: a hatch, so it reads as concealed data. */}
          <pattern
            id="qra-hatch"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(245,247,250,0.10)" strokeWidth="1" />
          </pattern>
          <clipPath id="qra-revealed">
            <rect x="0" y="0" width={headX} height={VIEW_H} />
          </clipPath>
        </defs>

        {/* Hairline price grid — structure, not decoration. */}
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={viewW}
            y1={VIEW_H * fraction}
            y2={VIEW_H * fraction}
            stroke="rgba(245,247,250,0.055)"
            strokeWidth="0.6"
          />
        ))}

        {/* The withheld future. */}
        <rect
          x={headX}
          y="0"
          width={viewW - headX}
          height={VIEW_H}
          fill="url(#qra-hatch)"
          opacity="0.5"
        />
        <line
          x1={headX}
          x2={headX}
          y1="0"
          y2={VIEW_H}
          stroke="rgba(245,247,250,0.16)"
          strokeWidth="0.8"
          strokeDasharray="2 2.5"
        />

        <g clipPath="url(#qra-revealed)">
          {candles.map(([open, high, low, close], index) => {
            const cx = index * STEP + STEP / 2;
            const rising = close >= open;
            const bodyTop = y(Math.max(open, close));
            const bodyHeight = Math.max(1.4, Math.abs(y(open) - y(close)));
            const stroke = rising ? "#3F6FFF" : "rgba(245,247,250,0.42)";
            return (
              <g
                key={index}
                className="candle"
                style={{ animationDelay: `${index * 34}ms` } as React.CSSProperties}
              >
                {/* Wick */}
                <line
                  x1={cx}
                  x2={cx}
                  y1={y(high)}
                  y2={y(low)}
                  stroke={stroke}
                  strokeWidth="0.9"
                />
                {/* Body: filled when rising, hollow when falling. */}
                <rect
                  x={cx - BODY / 2}
                  y={bodyTop}
                  width={BODY}
                  height={bodyHeight}
                  fill={rising ? "#3F6FFF" : "#0D131D"}
                  stroke={stroke}
                  strokeWidth="0.9"
                />
              </g>
            );
          })}

          {/* The trend, drawn as far as the replay has reached. */}
          {emaPath && (
            <path
              d={emaPath}
              fill="none"
              stroke="#9DB4FF"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line"
              style={{ "--len": 300, "--cd": "520ms" } as React.CSSProperties}
            />
          )}
        </g>

        {/* The replay head, where the decision is asked. */}
        <circle className="replay-head" cx={headX} cy={y(ema[revealed - 1] ?? 50)} r="2.6" fill="#6F94FF" />
      </svg>

      {/* Labels sit in HTML so they stay crisp and selectable. */}
      <span className="candle-chart__now" style={{ left: `${(headX / viewW) * 100}%` }}>
        Now
      </span>
      <span className="candle-chart__hidden">{labelHidden}</span>
    </div>
  );
}
