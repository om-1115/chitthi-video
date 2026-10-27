import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MONO, Palette, SERIF } from "./theme";

const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fades a whole scene in and out so cuts between scenes are soft.
export const SceneFade: React.FC<{ children: React.ReactNode; bg: string; fade?: number }> = ({ children, bg, fade = 12 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        opacity: interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], clamp),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Text that rises into its layout slot.
export const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; until?: number }> = ({
  at,
  until,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const fadeOut = until === undefined ? 1 : interpolate(frame, [until - 10, until], [1, 0], clamp);
  return (
    <div
      style={{
        ...style,
        opacity: interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: out }) * fadeOut,
        translate: interpolate(frame, [at, at + 24], ["0px 28px", "0px 0px"], { ...clamp, easing: out }),
      }}
    >
      {children}
    </div>
  );
};

// A pen-stroke underline that draws itself.
export const Underline: React.FC<{ at: number; color: string; width: number }> = ({ at, color, width }) => {
  const frame = useCurrentFrame();
  const len = width * 1.1;
  return (
    <svg width={width} height={18} viewBox={`0 0 ${width} 18`} style={{ display: "block" }}>
      <path
        d={`M4 12 C ${width * 0.25} 2, ${width * 0.5} 18, ${width * 0.75} 8 S ${width - 4} 10, ${width - 4} 9`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={interpolate(frame, [at, at + 28], [len, 0], { ...clamp, easing: out })}
      />
    </svg>
  );
};

export type Caption = { from: number; to: number; text: React.ReactNode };

// One caption at a time in a fixed slot under the browser window.
export const Captions: React.FC<{ items: Caption[]; c: Palette }> = ({ items, c }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", height: 70, width: "100%" }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontSize: 44,
            color: c.ink,
            opacity: interpolate(frame, [it.from, it.from + 10, it.to - 8, it.to], [0, 1, 1, 0], clamp),
            translate: interpolate(frame, [it.from, it.from + 14], ["0px 14px", "0px 0px"], { ...clamp, easing: out }),
          }}
        >
          {it.text}
        </div>
      ))}
    </div>
  );
};

export const Kicker: React.FC<{ c: Palette; children: React.ReactNode }> = ({ c, children }) => (
  <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.22em", textTransform: "uppercase", color: c.faint }}>
    {children}
  </div>
);
