// Exporta la animática (animatic.html) a MP4 1080×1920 a 30 fps, fotograma a
// fotograma, o saca fotogramas sueltos en PNG para el storyboard.
//
//   node marketing/video-15s/render.mjs                       → trampto-spot-15s-9x16.mp4
//   node marketing/video-15s/render.mjs salida.mp4
//   node marketing/video-15s/render.mjs --stills 0.4,4.05,10.4 [carpeta]
//
// Requiere Playwright con Chromium (npm i --no-save playwright && npx playwright
// install chromium) y, para el MP4, ffmpeg en el PATH. Si existe HTTPS_PROXY,
// Chromium sale por él para descargar las fuentes de Google Fonts.
// Si existe pista-guia.wav (python3 pista-guia.py), se añade como audio del MP4.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const FPS = 30;
const DURATION = 15;
const W = 1080;
const H = 1920;
const here = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const stillsAt = args[0] === "--stills" ? args[1].split(",").map(Number) : null;

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`${pathToFileURL(path.join(here, "animatic.html")).href}?render`);
  await page.evaluate(() => window.__ready);

  const frame = async (t) => {
    await page.evaluate((s) => window.__seek(s), t);
    return page.screenshot({ type: "png", clip: { x: 0, y: 0, width: W, height: H } });
  };

  if (stillsAt) {
    const dir = path.resolve(args[2] ?? path.join(here, "stills"));
    await mkdir(dir, { recursive: true });
    for (const t of stillsAt) {
      const file = path.join(dir, `f${String(Math.round(t * FPS)).padStart(3, "0")}.png`);
      await writeFile(file, await frame(t));
      console.log(`${t.toFixed(2)} s → ${file}`);
    }
  } else {
    const out = path.resolve(args[0] ?? path.join(here, "trampto-spot-15s-9x16.mp4"));
    const audio = path.join(here, "pista-guia.wav");
    const audioArgs = existsSync(audio)
      ? ["-i", audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"]
      : [];
    const ffmpeg = spawn(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", ...audioArgs,
        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", out],
      { stdio: ["pipe", "inherit", "inherit"] }
    );
    if (audioArgs.length) console.log("Con pista guía:", audio);
    const done = new Promise((resolve, reject) => {
      ffmpeg.on("error", reject);
      ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg terminó con código ${code}`))));
    });
    const total = FPS * DURATION;
    for (let f = 0; f < total; f++) {
      const png = await frame(f / FPS);
      if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      if (f % FPS === 0) process.stdout.write(`\rFotograma ${f}/${total}`);
    }
    ffmpeg.stdin.end();
    await done;
    console.log(`\nOK → ${out}`);
  }
} finally {
  await browser.close();
}
