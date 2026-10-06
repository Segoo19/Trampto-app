// Añade locución de ElevenLabs al vídeo promocional.
// Uso:  ELEVENLABS_API_KEY=xxx [ELEVENLABS_VOICE_ID=yyy] node media/add-voice.mjs
// Salida: media/trampto-promo-voz.mp4 (requiere ffmpeg).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("Falta ELEVENLABS_API_KEY");
// Voz por defecto: elige una voz en español en tu biblioteca de ElevenLabs.
const voice = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const lines = JSON.parse(readFileSync(join(dir, "locucion.json"), "utf8"));
const tmp = join(dir, ".voz");
mkdirSync(tmp, { recursive: true });

const files = [];
for (const [i, l] of lines.entries()) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: l.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
      }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const f = join(tmp, `l${i}.mp3`);
  writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  files.push(f);
  console.log(`voz ${i + 1}/${lines.length}`);
}

// Coloca cada frase en su segundo y mezcla con el vídeo (32 s).
const inputs = files.flatMap((f) => ["-i", f]);
const delays = lines.map((l, i) => `[${i + 1}:a]adelay=${Math.round(l.start * 1000)}:all=1[a${i}]`);
const mix = `${lines.map((_, i) => `[a${i}]`).join("")}amix=inputs=${lines.length}:normalize=0,apad[aout]`;
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-i", join(dir, "trampto-promo.mp4"), ...inputs,
  "-filter_complex", [...delays, mix].join(";"),
  "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
  join(dir, "trampto-promo-voz.mp4"),
]);
console.log("Listo: media/trampto-promo-voz.mp4");
