import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import hindi from "../public/captures/archivist-hi.json";
import seance from "../public/captures/seance-en.json";
import { Demo, DemoProps, End, Hook, HowItWorks, OcrChart, Offline, Problem, demoLength } from "./Scenes";
import { FPS, dark, paper } from "./theme";
import VO from "./vo-durations.json";

// Scratch voiceover (tools/vo.mjs, macOS `say`). A cue starts line `id` at frame `at` of its scene.
type Cue = { id: keyof typeof VO; at: number };
const voEnd = (c: Cue) => c.at + Math.ceil(VO[c.id] * FPS);

// Real recordings of the app answering against local Ollama (tools/capture.mjs).
// Spans are capture milliseconds; the wait for Gemma between them is cut and labelled.
const SEANCE: DemoProps = {
  cap: seance,
  c: dark,
  kicker: "Live demo · séance mode",
  a: { from: 3300, to: 9200 },
  gap: 40,
  gapLabel: "Gemma 4 reads the letters · 40 s skipped",
  b: { from: 50710, to: 65361 },
  answerZoom: { in: 0.2, out: 6.95 },
  captions: [
    { from: 18, to: 172, text: "Ask Nehru directly, in séance mode" },
    { from: 222, to: 278, text: "He answers in the first person…" },
    { from: 280, to: 421, text: "…and every underlined quote was found word-for-word" },
    { from: 425, to: 515, text: "Each citation points to a passage…" },
    { from: 519, to: 655, text: "…and opens the original 1929 scan" },
  ],
};
const SEANCE_VO: Cue[] = [
  { id: "seance1", at: 18 },
  { id: "seance2", at: 222 },
  { id: "seance3", at: 280 },
  { id: "seance4", at: 425 },
  { id: "seance5", at: 519 },
];

const HINDI: DemoProps = {
  cap: hindi,
  c: paper,
  kicker: "Live demo · हिन्दी",
  a: { from: 3300, to: 7900 },
  gap: 40,
  gapLabel: "Gemma 4 reads the letters · 70 s skipped",
  b: { from: 79246, to: 93321 },
  answerZoom: { in: 0.2, out: 6.45 },
  captions: [
    { from: 16, to: 134, text: "Archivist mode, answering in Hindi" },
    { from: 186, to: 308, text: "The same letters, in Premchand’s 1931 translation" },
    { from: 310, to: 372, text: "Quotes are still checked word-for-word" },
    { from: 376, to: 458, text: "Citations work in every script…" },
    { from: 462, to: 598, text: "…down to the Hindi page scan" },
  ],
};
const HINDI_VO: Cue[] = [
  { id: "hindi1", at: 16 },
  { id: "hindi2", at: 186 },
  { id: "hindi3", at: 310 },
  { id: "hindi4", at: 376 },
  { id: "hindi5", at: 462 },
];

// "How it works": each step lights up as its line starts, with a short breath between lines.
const HOW_VO: Cue[] = (["how1", "how2", "how3", "how4"] as const).reduce<Cue[]>(
  (cues, id) => [...cues, { id, at: cues.length ? voEnd(cues[cues.length - 1]) + 8 : 16 }],
  [],
);

const SCENES: { name: string; base: number; vo: Cue[]; el: React.ReactNode }[] = [
  { name: "Hook", base: 120, vo: [{ id: "hook", at: 10 }], el: <Hook /> },
  { name: "Problem", base: 190, vo: [{ id: "problem1", at: 8 }, { id: "problem2", at: 164 }], el: <Problem /> },
  { name: "Demo: séance (English)", base: demoLength(SEANCE, FPS), vo: SEANCE_VO, el: <Demo {...SEANCE} /> },
  { name: "How it works", base: 330, vo: HOW_VO, el: <HowItWorks stepAt={HOW_VO.map(c => c.at)} /> },
  { name: "Hindi OCR comparison", base: 200, vo: [{ id: "ocr1", at: 8 }, { id: "ocr2", at: 120 }], el: <OcrChart /> },
  { name: "Demo: archivist (Hindi)", base: demoLength(HINDI, FPS), vo: HINDI_VO, el: <Demo {...HINDI} /> },
  { name: "Offline", base: 140, vo: [{ id: "offline", at: 6 }], el: <Offline /> },
  { name: "End card", base: 150, vo: [{ id: "end", at: 6 }], el: <End /> },
];

// A scene runs at least until its last line has finished, plus a beat.
const len = (s: (typeof SCENES)[number]) => Math.max(s.base, ...s.vo.map(c => voEnd(c) + 20));
const TOTAL = SCENES.reduce((n, s) => n + len(s), 0);

export const ChitthiDemo: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: dark.bg }}>
      {SCENES.map(s => {
        const from = at;
        at += len(s);
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={len(s)}>
            {s.el}
            {s.vo.map(c => (
              <Sequence key={c.id} name={`VO: ${c.id}`} from={c.at} layout="none">
                <Audio src={staticFile(`vo/${c.id}.wav`)} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition id="ChitthiDemo" component={ChitthiDemo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
