// Records real demo clips of Chitthi (running on localhost:8000 against local Ollama).
// Writes public/captures/<name>/<ms>.jpg screencast frames, <name>-*.png (2x stills) and <name>.json
// (frame times + event times in ms). Recording pauses while Gemma thinks; the edit cuts that wait.
//   node tools/capture.mjs [clip-name ...]   (default: all clips)
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const CHROME = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const OUT = "public/captures";
const VIEW = { width: 1440, height: 810 };
mkdirSync(OUT, { recursive: true });

const CLIPS = [
  { name: "seance-en", mode: "seance", lang: "en", q: "Why did you write these letters, and where was Indira?" },
  { name: "archivist-hi", mode: "archivist", lang: "hi", q: "संसार को पुस्तक क्यों कहा गया है?" },
];

const only = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: CHROME });
// The demo is about verified quotes: re-take (up to 3 times) if Gemma's answer happens to quote nothing.
for (const clip of CLIPS.filter(c => !only.length || only.includes(c.name))) {
  for (let take = 1; take <= 3; take++) {
    const marks = await record(clip);
    console.log(clip.name, "take", take, "quotes:", marks);
    if (marks > 0) break;
  }
}
await browser.close();

async function record(clip) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const dir = `${OUT}/${clip.name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, sessionId }) => {
    const ms = Date.now() - t0;
    writeFileSync(`${dir}/${ms}.jpg`, Buffer.from(data, "base64"));
    frames.push(ms);
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  const rec = on => on
    ? cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
    : cdp.send("Page.stopScreencast");
  const t0 = Date.now();
  const ev = {};
  const mark = k => (ev[k] = Date.now() - t0);
  await rec(true);
  const still = async k => page.screenshot({ path: `${OUT}/${clip.name}-${k}.png` });

  await page.goto("http://localhost:8000/");
  await page.waitForSelector(".col");
  await page.waitForTimeout(2200);
  mark("loaded");
  await still("hero");
  await page.click(`#modes [data-mode="${clip.mode}"]`);
  await page.waitForTimeout(500);
  await page.click(`#langs [data-lang="${clip.lang}"]`);
  await page.waitForTimeout(500);
  await page.click("#q");
  mark("typeStart");
  await page.keyboard.type(clip.q, { delay: 55 });
  mark("typeEnd");
  await page.waitForTimeout(700);
  mark("submit");
  await page.click("#go");
  await page.waitForTimeout(2500);
  await rec(false);
  mark("pause");
  await page.waitForSelector("#out .answer", { timeout: 300_000 });
  await rec(true);
  mark("answer");
  await page.waitForTimeout(4500);
  mark("answerDone");
  const marks = await page.locator("#out .answer mark").count();
  await still("answer");
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(1500);
  mark("badges");
  await still("badges");
  const cite = page.locator("#out .cite").first();
  const n = await cite.getAttribute("data-n");
  await cite.click();
  mark("cite");
  await page.waitForTimeout(2600);
  await still("passage");
  await page.click(`#p${n} .scan`);
  mark("scan");
  await page.waitForTimeout(3200);
  await still("scan");
  await page.click("#zoom");
  await page.waitForTimeout(1200);
  mark("end");

  await rec(false);
  await ctx.close();
  writeFileSync(`${OUT}/${clip.name}.json`, JSON.stringify({ ...clip, cite: n, events: ev, frames }, null, 2));
  console.log(clip.name, frames.length, "frames", JSON.stringify(ev));
  return marks;
}
