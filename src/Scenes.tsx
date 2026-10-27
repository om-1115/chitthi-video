import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserWindow, Capture, ScreencastClip, Span, Zoom, spanFrames } from "./Screencast";
import { DEVA, MONO, Palette, SERIF, dark, paper } from "./theme";
import { Caption, Captions, Kicker, Rise, SceneFade, Underline } from "./ui";

const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 34 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap, padding: "100px 160px" }}>
    {children}
  </AbsoluteFill>
);

// Faint candle glow behind dark scenes, like the app.
const Glow: React.FC<{ c: Palette }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 45% at 50% ${interpolate(frame, [0, 300], [40, 46], clamp)}%, ${c.gold}22, transparent 70%)`,
      }}
    />
  );
};

export const Hook: React.FC = () => {
  const c = dark;
  return (
    <SceneFade bg={c.bg}>
      <Glow c={c} />
      <Center gap={26}>
        <Rise at={4}>
          <div style={{ fontFamily: DEVA, fontSize: 64, color: c.wax }}>चिट्ठी</div>
        </Rise>
        <Rise at={14}>
          <div style={{ fontFamily: SERIF, fontSize: 132, color: c.ink, letterSpacing: "-0.01em" }}>Chitthi</div>
        </Rise>
        <Rise at={22}>
          <Underline at={30} color={c.wax} width={360} />
        </Rise>
        <Rise at={40}>
          <div style={{ fontFamily: SERIF, fontSize: 52, color: c.dim, fontStyle: "italic" }}>
            Ask old letters a question.
          </div>
        </Rise>
      </Center>
    </SceneFade>
  );
};

export const Problem: React.FC = () => {
  const c = dark;
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [112, 134], [0, 100], { ...clamp, easing: out });
  return (
    <SceneFade bg={c.bg}>
      <Glow c={c} />
      <Center gap={60}>
        <Rise at={6}>
          <div style={{ fontFamily: SERIF, fontSize: 64, color: c.dim, textAlign: "center", lineHeight: 1.3 }}>
            Ask a chatbot about a historical figure
            <br />
            and it will happily{" "}
            <span style={{ position: "relative", color: c.ink }}>
              invent a quote
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "54%",
                  height: 6,
                  borderRadius: 3,
                  width: `${strike}%`,
                  backgroundColor: c.wax,
                }}
              />
            </span>
            .
          </div>
        </Rise>
        <Rise at={160}>
          <div style={{ fontFamily: SERIF, fontSize: 84, color: c.ink, textAlign: "center", lineHeight: 1.15 }}>
            Chitthi answers <em style={{ color: c.wax }}>only</em> in
            <br />
            the letters’ own words.
          </div>
        </Rise>
      </Center>
    </SceneFade>
  );
};

export type DemoProps = {
  cap: Capture;
  c: Palette;
  kicker: string;
  a: Span;
  b: Span;
  gap: number;
  gapLabel: string;
  captions: Caption[];
  // Push in on the answer while it inks in; times are seconds into span B.
  answerZoom?: { in: number; out: number };
};

export const demoLength = (p: Pick<DemoProps, "a" | "b" | "gap">, fps: number) => spanFrames(p.a, fps) + p.gap + spanFrames(p.b, fps);

export const Demo: React.FC<DemoProps> = ({ cap, c, kicker, a, b, gap, gapLabel, captions, answerZoom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bStart = spanFrames(a, fps) + gap;
  const zIn = answerZoom ? bStart + answerZoom.in * fps : 0;
  const zOut = answerZoom ? bStart + answerZoom.out * fps : 0;
  const zoom: Zoom | undefined = answerZoom
    ? { f: [zIn, zIn + 45, zOut - 22, zOut], s: [1, 1.3, 1.3, 1], origin: "50% 100%" }
    : undefined;
  return (
    <SceneFade bg={c.bg}>
      {c === dark && <Glow c={c} />}
      <AbsoluteFill style={{ alignItems: "center", flexDirection: "column", paddingTop: 34, gap: 22 }}>
        <Kicker c={c}>{kicker}</Kicker>
        <div
          style={{
            scale: interpolate(frame, [bStart, bStart + spanFrames(b, fps)], [1, 1.03], clamp),
          }}
        >
          <BrowserWindow c={c} width={1440}>
            <ScreencastClip cap={cap} a={a} b={b} gap={gap} gapLabel={gapLabel} c={c} zoom={zoom} />
          </BrowserWindow>
        </div>
        <Captions items={captions} c={c} />
      </AbsoluteFill>
    </SceneFade>
  );
};

const STEPS = [
  { t: "Scan → text, page by page", s: "PDF text layer if it’s clean · else Gemma 4 vision · or Tesseract" },
  { t: "Hybrid search", s: "SQLite full-text + EmbeddingGemma vectors, fused" },
  { t: "Answer with Gemma 4", s: "as an archivist, or in the writer’s own voice" },
  { t: "Check every quote", s: "verbatim against the cited page · no evidence, no answer" },
];

export const HowItWorks: React.FC<{ stepAt: number[] }> = ({ stepAt }) => {
  const c = dark;
  const frame = useCurrentFrame();
  return (
    <SceneFade bg={c.bg}>
      <Glow c={c} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 220px", flexDirection: "column", gap: 54 }}>
        <Rise at={2}>
          <Kicker c={c}>How it works</Kicker>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {STEPS.map((st, i) => {
            const at = stepAt[i];
            const active = frame >= at && (i === STEPS.length - 1 || frame < stepAt[i + 1]);
            return (
              <Rise key={st.t} at={at}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 36 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 34,
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: active ? "#fff7ec" : c.dim,
                      backgroundColor: active ? c.wax : "transparent",
                      border: `2px solid ${active ? c.wax : c.line}`,
                      translate: "0px 6px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 60, color: c.ink }}>{st.t}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 36, color: c.dim, fontStyle: "italic" }}>{st.s}</div>
                  </div>
                </div>
              </Rise>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// Word error rate on Hindi page 5, measured against a hand-checked transcription of the scan.
const OCR = [
  { k: "PDF text layer", v: 23.8 },
  { k: "Gemma 4 vision", v: 5.0 },
  { k: "Tesseract", v: 4.0 },
  { k: "Tesseract + text layer", v: 0.5, best: true },
];

export const OcrChart: React.FC = () => {
  const c = dark;
  const frame = useCurrentFrame();
  const max = 24;
  return (
    <SceneFade bg={c.bg}>
      <Glow c={c} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 220px", flexDirection: "column", gap: 30 }}>
        <Rise at={2}>
          <Kicker c={c}>Hindi pages · word errors</Kicker>
        </Rise>
        <Rise at={8}>
          <div style={{ fontFamily: SERIF, fontSize: 64, color: c.ink, lineHeight: 1.15 }}>
            The OCR is chosen per page,
            <br />
            and measured.
          </div>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 20 }}>
          {OCR.map((r, i) => {
            const at = 30 + i * 14;
            const w = interpolate(frame, [at, at + 30], [0, r.v / max], { ...clamp, easing: out });
            return (
              <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{ width: 470, fontFamily: SERIF, fontSize: 38, color: r.best ? c.ink : c.dim, textAlign: "right" }}>{r.k}</div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      height: 40,
                      width: `max(8px, ${w * 100}%)`,
                      borderRadius: 6,
                      backgroundColor: r.best ? c.ok : c.wax,
                      opacity: interpolate(frame, [at, at + 6], [0, r.best ? 1 : 0.75], clamp),
                    }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 34, color: r.best ? c.ok : c.dim, opacity: interpolate(frame, [at + 20, at + 30], [0, 1], clamp) }}>
                    {r.v.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Rise at={125}>
          <div style={{ fontFamily: SERIF, fontSize: 34, color: c.faint, fontStyle: "italic", marginTop: 14 }}>
            Gemma reads the vowel signs right but drops sentences and swaps in words — fatal when quotes must be exact.
          </div>
        </Rise>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const Offline: React.FC = () => {
  const c = paper;
  return (
    <SceneFade bg={c.bg}>
      <Center gap={40}>
        <Rise at={4}>
          <div style={{ fontFamily: SERIF, fontSize: 92, color: c.ink, textAlign: "center", lineHeight: 1.1 }}>
            Nothing leaves this laptop.
          </div>
        </Rise>
        <Rise at={22}>
          <div style={{ fontFamily: SERIF, fontSize: 44, color: c.dim, textAlign: "center", lineHeight: 1.4 }}>
            Gemma 4 and EmbeddingGemma run locally through Ollama.
            <br />
            Family letters stay with the family.
          </div>
        </Rise>
      </Center>
    </SceneFade>
  );
};

export const End: React.FC = () => {
  const c = dark;
  return (
    <SceneFade bg={c.bg} fade={14}>
      <Glow c={c} />
      <Center gap={26}>
        <Rise at={4}>
          <div style={{ fontFamily: SERIF, fontSize: 120, color: c.ink }}>
            Chitthi <span style={{ fontFamily: DEVA, color: c.wax, fontSize: 84 }}>चिट्ठी</span>
          </div>
        </Rise>
        <Rise at={14}>
          <div style={{ fontFamily: SERIF, fontSize: 48, color: c.dim, fontStyle: "italic" }}>
            Let the letters speak for themselves.
          </div>
        </Rise>
        <Rise at={28}>
          <div style={{ fontFamily: MONO, fontSize: 36, color: c.gold, marginTop: 30 }}>github.com/om-1115/chitthi</div>
        </Rise>
      </Center>
    </SceneFade>
  );
};
