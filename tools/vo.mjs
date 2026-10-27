// Scratch voiceover with macOS `say`: one WAV per line in public/vo/, durations in src/vo-durations.json.
//   node tools/vo.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const { voice, rate, lines } = JSON.parse(readFileSync("src/vo.json", "utf8"));
mkdirSync("public/vo", { recursive: true });
const durations = {};
for (const { id, text } of lines) {
  const aiff = `public/vo/${id}.aiff`;
  const wav = `public/vo/${id}.wav`;
  execFileSync("say", ["-v", voice, "-r", String(rate), "-o", aiff, text]);
  execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@48000", aiff, wav]);
  rmSync(aiff);
  const info = execFileSync("afinfo", [wav], { encoding: "utf8" });
  durations[id] = Number(info.match(/estimated duration: ([\d.]+)/)[1]);
  console.log(id.padEnd(9), durations[id].toFixed(2), "s");
}
writeFileSync("src/vo-durations.json", JSON.stringify(durations, null, 2));
