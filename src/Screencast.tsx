import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MONO, Palette } from "./theme";

export type Capture = { name: string; frames: number[]; events: Record<string, number> };
// A run of the recording, in capture milliseconds.
export type Span = { from: number; to: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const spanFrames = (s: Span, fps: number) => Math.round(((s.to - s.from) / 1000) * fps);

// Latest screencast frame at or before `ms` (Chromium only emits a frame when the page changes).
const frameAt = (frames: number[], ms: number) => {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid] <= ms) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
};

// Push-in on the recording: keyframes in clip frames -> scale, around `origin`.
export type Zoom = { f: number[]; s: number[]; origin: string };

// Plays span A, holds a "skipped" card over A's last frame for `gap` frames, then plays span B.
export const ScreencastClip: React.FC<{ cap: Capture; a: Span; b: Span; gap: number; gapLabel: string; c: Palette; zoom?: Zoom }> = ({
  cap,
  a,
  b,
  gap,
  gapLabel,
  c,
  zoom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const aLen = spanFrames(a, fps);
  const inGap = frame >= aLen && frame < aLen + gap;
  const ms = frame < aLen ? a.from + (frame / fps) * 1000 : inGap ? a.to : b.from + ((frame - aLen - gap) / fps) * 1000;
  const src = staticFile(`captures/${cap.name}/${frameAt(cap.frames, ms)}.jpg`);
  const g = frame - aLen;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: zoom ? interpolate(frame, zoom.f, zoom.s, { ...clamp, easing: Easing.inOut(Easing.cubic) }) : undefined,
          transformOrigin: zoom?.origin,
          filter: inGap ? `blur(${interpolate(g, [0, 8], [0, 10], clamp)}px) brightness(0.55)` : undefined,
        }}
      />
      {inGap && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            opacity: interpolate(g, [0, 6, gap - 6, gap], [0, 1, 1, 0], clamp),
          }}
        >
          <svg width={90} height={90} viewBox="0 0 90 90">
            <circle cx={45} cy={45} r={38} fill="none" stroke={c.line} strokeWidth={5} />
            <circle
              cx={45}
              cy={45}
              r={38}
              fill="none"
              stroke={c.gold}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={239}
              strokeDashoffset={interpolate(g, [0, gap], [239, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) })}
              style={{ rotate: "-90deg", transformOrigin: "45px 45px" }}
            />
          </svg>
          <div style={{ fontFamily: MONO, fontSize: 30, color: "#f3e4c8", letterSpacing: "0.06em" }}>{gapLabel}</div>
        </div>
      )}
    </div>
  );
};

// A minimal browser window around the recording.
export const BrowserWindow: React.FC<{ c: Palette; children: React.ReactNode; width: number }> = ({ c, children, width }) => {
  const height = (width * 9) / 16;
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: "hidden",
        border: `1.5px solid ${c.line}`,
        boxShadow: "0 40px 90px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)",
        backgroundColor: c.surface,
      }}
    >
      <div style={{ height: 42, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: `1px solid ${c.line}` }}>
        {["#ec6a5e", "#f4bf4f", "#61c554"].map(col => (
          <div key={col} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: col, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 17, color: c.faint, padding: "5px 22px", borderRadius: 8, backgroundColor: c.bg }}>
            localhost:8000
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ width, height }}>{children}</div>
    </div>
  );
};
