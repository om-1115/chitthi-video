# Chitthi demo video

97 s explainer + live demo of [Chitthi](https://github.com/om-1115/chitthi), 1920×1080, light mode in the app's Pico CSS style, with on-screen captions and a
scratch voiceover (macOS `say`, voice Tara). Output: `out/chitthi-demo.mp4`.

## Voiceover

Lines live in `src/vo.json` (spellings like "Chit-thee" and "say-ahns" are pronunciation hints).
`node tools/vo.mjs` regenerates `public/vo/*.wav` and `src/vo-durations.json`; scene lengths in
`src/Composition.tsx` stretch to fit each line, so re-render after any change. To swap in a human voice,
replace the WAVs with the same names and rerun the duration step (or edit `vo-durations.json`).

## Rebuild

```bash
npx remotion render src/index.ts ChitthiDemo out/chitthi-demo.mp4 --codec=h264 --crf=18
npx remotion studio                       # preview / tweak
```

## Re-record the demo footage

Needs Chitthi running on http://localhost:8000 against local Ollama (Nehru collection ingested).

```bash
node tools/capture.mjs
```

This writes Chromium screencast frames to `public/captures/<clip>/` plus `<clip>.json` with frame and event
times. Recording pauses while Gemma answers; the edit cuts that wait and labels it ("40 s skipped").
After a re-record, update the `a`/`b` spans and caption timings in `src/Composition.tsx` from the new event times.

Uses the cached Playwright Chromium (`chromium-1223`) via `executablePath`, because the installed
Playwright expects a newer build.

## Layout

- `src/Composition.tsx`: scene order and lengths, demo spans and captions
- `src/Scenes.tsx`: hook, problem, demo, how it works, OCR chart, offline, end card
- `src/Screencast.tsx`: plays the captured frames inside a browser window
- `src/theme.ts`: palette and type from the app's Pico CSS theme (`chitthi/web/vendor/pico.red.min.css`)
