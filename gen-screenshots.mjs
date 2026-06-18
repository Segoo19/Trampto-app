// Genera dos screenshots de marca para el manifest (wide y narrow) con sharp.
import sharp from "sharp";

const NAVY = "#0D1B4B";
const GOLD = "#C49A22";
const BURGUNDY = "#7A1F1F";
const BG = "#F6F7F9";

// Sello vectorial sencillo (círculo burdeos + check dorado) centrado en (cx,cy)
function seal(cx, cy, r) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BURGUNDY}" stroke-width="${r * 0.09}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="none" stroke="${BURGUNDY}" stroke-width="${r * 0.03}"/>
    <path d="M ${cx - r * 0.34} ${cy + r * 0.02} L ${cx - r * 0.06} ${cy + r * 0.3} L ${cx + r * 0.4} ${cy - r * 0.28}"
      fill="none" stroke="${GOLD}" stroke-width="${r * 0.14}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function svgWide(w, h) {
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}"/>
    <text x="${w / 2}" y="${h * 0.2}" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="${NAVY}">TRAMPTO</text>
    <text x="${w / 2}" y="${h * 0.28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#5c6577">Sella y verifica la integridad de tus documentos</text>
    <rect x="${w / 2 - 300}" y="${h * 0.36}" width="600" height="${h * 0.5}" rx="20" fill="#ffffff" stroke="#e4e7ee"/>
    ${seal(w / 2, h * 0.52, 60)}
    <text x="${w / 2}" y="${h * 0.68}" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" fill="${NAVY}">Documento sellado</text>
    <text x="${w / 2}" y="${h * 0.74}" text-anchor="middle" font-family="monospace" font-size="18" fill="#5c6577">SHA-256 · Seal ID · enlace público</text>
    <rect x="${w / 2 - 130}" y="${h * 0.79}" width="260" height="44" rx="10" fill="${GOLD}"/>
    <text x="${w / 2}" y="${h * 0.79 + 29}" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#ffffff">Compartir verificación</text>
  </svg>`;
}

function svgNarrow(w, h) {
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}"/>
    <text x="${w / 2}" y="${h * 0.13}" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="${NAVY}">TRAMPTO</text>
    <text x="${w / 2}" y="${h * 0.18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#5c6577">Tu documento, único e inalterable</text>
    <rect x="40" y="${h * 0.24}" width="${w - 80}" height="${h * 0.6}" rx="22" fill="#ffffff" stroke="#e4e7ee"/>
    ${seal(w / 2, h * 0.4, 70)}
    <text x="${w / 2}" y="${h * 0.55}" text-anchor="middle" font-family="Georgia, serif" font-size="38" font-weight="700" fill="${NAVY}">Documento sellado</text>
    <text x="${w / 2}" y="${h * 0.6}" text-anchor="middle" font-family="monospace" font-size="18" fill="#5c6577">SHA-256 · Seal ID</text>
    <rect x="${w / 2 - 150}" y="${h * 0.66}" width="300" height="50" rx="12" fill="${NAVY}"/>
    <text x="${w / 2}" y="${h * 0.66 + 32}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">PDF sellado</text>
    <rect x="${w / 2 - 150}" y="${h * 0.73}" width="300" height="50" rx="12" fill="${GOLD}"/>
    <text x="${w / 2}" y="${h * 0.73 + 32}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Compartir</text>
  </svg>`;
}

await sharp(Buffer.from(svgWide(1280, 720))).png().toFile("public/screenshot-wide.png");
await sharp(Buffer.from(svgNarrow(720, 1280))).png().toFile("public/screenshot-narrow.png");
console.log("OK screenshots generados");
