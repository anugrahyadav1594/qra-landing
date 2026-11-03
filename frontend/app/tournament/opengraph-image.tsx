import { ImageResponse } from "next/og";

import { DEFAULT_TOURNAMENT_CONFIG } from "@/lib/tournament";

export const alt = "Quantrelic's Mumbai Trading Tournament — the trading arena";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Original, deterministic social card drawn from the tournament design
 * system: no stock art, no external image or font fetch at render time.
 *
 * Notes on the (intentionally plain) styling: satori requires every element
 * with more than one child to declare `display: flex`, and its gradient
 * parser only accepts hex colours — hence single-string text nodes and
 * 6-digit hex gradients.
 */
export default function TournamentOpengraphImage() {
  const config = DEFAULT_TOURNAMENT_CONFIG;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#090A0D",
          color: "#F4F0E9",
        }}
      >
        {/* Orange arena glow */}
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -160,
            width: 900,
            height: 900,
            borderRadius: 900,
            opacity: 0.32,
            background: "radial-gradient(circle, #F47C35 0%, #F47C35 42%, #090A0D 72%)",
          }}
        />
        {/* Technical grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            opacity: 0.09,
            backgroundImage:
              "linear-gradient(#F47C35 1px, transparent 1px), linear-gradient(90deg, #F47C35 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* ── Left: type ─────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: 78,
            top: 92,
            display: "flex",
            flexDirection: "column",
            width: 620,
            height: 446,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 2, background: "#F47C35" }} />
            <div
              style={{
                fontSize: 20,
                letterSpacing: 6,
                color: "#FFAA70",
                textTransform: "uppercase",
              }}
            >
              {"Mumbai's trading competition"}
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            <div>{"The market is"}</div>
            <div>{"your arena."}</div>
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "baseline",
              gap: 18,
            }}
          >
            <div style={{ fontSize: 54, fontWeight: 700, color: "#F47C35" }}>
              {"1,00,000"}
            </div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#96979E" }}>
              {"INR PRIZE POOL"}
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: 26,
              fontSize: 19,
              letterSpacing: 3,
              color: "#96979E",
              textTransform: "uppercase",
            }}
          >
            <div>{"Individual"}</div>
            <div style={{ width: 1, height: 24, background: "#2E313C" }} />
            <div>{"College-level qualifiers"}</div>
          </div>
        </div>

        {/* ── Right: the arena ring ──────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 96,
            width: 440,
            height: 440,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: 420,
              border: "12px solid #F47C35",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 470,
              height: 470,
              borderRadius: 470,
              border: "1px solid #FFAA70",
              opacity: 0.35,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 330,
              height: 330,
              borderRadius: 330,
              border: "2px solid #F47C35",
              opacity: 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: 250,
              opacity: 0.6,
              background: "radial-gradient(circle, #FFAA70 0%, #F47C35 45%, #090A0D 72%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#FFE9DC",
            }}
          />
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <div
              key={angle}
              style={{
                position: "absolute",
                width: 2,
                height: 470,
                background: "#F47C35",
                opacity: 0.28,
                transform: `rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            bottom: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #23252E",
            paddingTop: 24,
          }}
        >
          <div style={{ fontSize: 18, letterSpacing: 5, color: "#96979E" }}>
            {`${config.short_name} · POWERED BY QUANT RELIC`}
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, color: "#F47C35" }}>
            {config.location_context.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
