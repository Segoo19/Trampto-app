import type { PDFFont, PDFPage } from "pdf-lib";
import { supabase, dbTimeout } from "./supabase";

// pdf-lib se carga bajo demanda: la app abre al instante y la librería
// solo se descarga al sellar o generar un certificado.
type PdfLib = typeof import("pdf-lib");
let pdfLibPromise: Promise<PdfLib> | null = null;
function loadPdfLib(): Promise<PdfLib> {
  pdfLibPromise ??= import("pdf-lib");
  return pdfLibPromise;
}

// Colores de marca
function brandColors(lib: PdfLib) {
  return {
    BURGUNDY: lib.rgb(0.478, 0.122, 0.122), // #7A1F1F
    GOLD: lib.rgb(0.769, 0.604, 0.133), // #C49A22
    NAVY: lib.rgb(0.051, 0.106, 0.294), // #0D1B4B
    GRAY: lib.rgb(0.667, 0.667, 0.667), // #AAAAAA — mismo gris del pie de la web
  };
}

// Base del enlace público de verificación. Por defecto usa el dominio donde
// corre la app (en local: localhost; al desplegar: tu web), porque la propia
// app sirve la página de verificación en /v/{hash}. Se puede forzar otro
// dominio (p. ej. https://trampto.com/V/) con VITE_VERIFY_BASE_URL.
const VERIFY_ENV = import.meta.env.VITE_VERIFY_BASE_URL as string | undefined;
const VERIFY_BASE: string =
  VERIFY_ENV && VERIFY_ENV.trim()
    ? VERIFY_ENV.replace(/\/?$/, "/")
    : `${window.location.origin}/v/`;

export interface SealResult {
  sealId: string;
  contentHash: string; // SHA-256 del documento original
  stampedHash: string; // SHA-256 del PDF sellado final (hash de verificación)
  pageCount: number;
  filename: string;
  sealedBytes: Uint8Array;
  createdAt: string;
}

export interface RegisterResult {
  ok: boolean;
  error?: string;
}

// Mismo cálculo de hash que la web (PreviewPage.hashBytes / VerifyPage.hashFile)
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Sello circular TRAMPTO con texto: solo para el certificado de integridad
function drawSealMark(
  lib: PdfLib,
  page: PDFPage,
  bold: PDFFont,
  cx: number,
  cy: number,
  r: number,
  opacity = 0.8
) {
  const { BURGUNDY, GOLD } = brandColors(lib);
  const { LineCapStyle } = lib;
  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: r,
    yScale: r,
    borderColor: BURGUNDY,
    borderWidth: Math.max(r * 0.07, 1),
    borderOpacity: opacity,
  });
  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: r * 0.85,
    yScale: r * 0.85,
    borderColor: BURGUNDY,
    borderWidth: Math.max(r * 0.025, 0.5),
    borderOpacity: opacity,
  });

  const name = "TRAMPTO";
  const nameSize = r * 0.27;
  const nameWidth = bold.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: cx - nameWidth / 2,
    y: cy + r * 0.18,
    size: nameSize,
    font: bold,
    color: BURGUNDY,
    opacity,
  });

  // Marca de verificación dorada (dos trazos con extremos redondeados)
  const t = r * 0.11;
  const vertex = { x: cx - r * 0.07, y: cy - r * 0.46 };
  page.drawLine({
    start: { x: cx - r * 0.33, y: cy - r * 0.22 },
    end: vertex,
    thickness: t,
    color: GOLD,
    opacity,
    lineCap: LineCapStyle.Round,
  });
  page.drawLine({
    start: vertex,
    end: { x: cx + r * 0.37, y: cy - r * 0.05 },
    thickness: t,
    color: GOLD,
    opacity,
    lineCap: LineCapStyle.Round,
  });
}

function rotatePoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  deg: number
) {
  const a = (deg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(a) - dy * Math.sin(a),
    y: cy + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

// Marca discreta de página: un microsello casi invisible (≈6 mm, 15 % de
// opacidad) en la esquina inferior derecha VISUAL. No altera el diseño del
// documento del cliente: la huella real viaja en los metadatos del PDF.
// Tiene en cuenta la rotación de página (/Rotate) para que la marca quede
// siempre en la misma esquina y orientada correctamente.
function drawDiscreetMark(lib: PdfLib, page: PDFPage, r = 8, opacity = 0.15) {
  const { BURGUNDY, GOLD } = brandColors(lib);
  const { LineCapStyle } = lib;
  const { width: W, height: H } = page.getSize();
  const angle = ((page.getRotation().angle % 360) + 360) % 360;
  const m = 12 + r; // margen del centro a los bordes visuales

  // Centro de la marca: esquina inferior derecha en coordenadas visuales,
  // convertida a coordenadas crudas según la rotación de la página.
  let cx: number;
  let cy: number;
  if (angle === 90) {
    cx = W - m;
    cy = H - m;
  } else if (angle === 180) {
    cx = m;
    cy = H - m;
  } else if (angle === 270) {
    cx = m;
    cy = m;
  } else {
    cx = W - m;
    cy = m;
  }

  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: r,
    yScale: r,
    borderColor: BURGUNDY,
    borderWidth: 0.9,
    borderOpacity: opacity,
  });

  // Marca de verificación, pre-rotada para que se vea recta en pantalla
  const t = r * 0.16;
  const p1 = rotatePoint(cx - r * 0.4, cy + r * 0.08, cx, cy, angle);
  const v = rotatePoint(cx - r * 0.08, cy - r * 0.24, cx, cy, angle);
  const p2 = rotatePoint(cx + r * 0.44, cy + r * 0.28, cx, cy, angle);
  page.drawLine({
    start: p1,
    end: v,
    thickness: t,
    color: GOLD,
    opacity,
    lineCap: LineCapStyle.Round,
  });
  page.drawLine({
    start: v,
    end: p2,
    thickness: t,
    color: GOLD,
    opacity,
    lineCap: LineCapStyle.Round,
  });
}

// Sella el PDF localmente: hash del original → microsello página a página →
// hash final. Mismo esquema de huellas que la web (PreviewPage) para que la
// verificación sea interoperable entre web y app.
export async function sealPdf(
  pdfBytes: Uint8Array,
  filename: string,
  onProgress?: (step: number) => void
): Promise<SealResult> {
  // 1. Huella SHA-256 del documento ORIGINAL, antes de sellar
  const contentHash = await sha256Hex(pdfBytes);
  onProgress?.(1);

  // 2. Microsello página a página (casi invisible, no toca el diseño).
  //    No se incrustan fuentes ni texto en el documento del cliente.
  const lib = await loadPdfLib();
  const pdfDoc = await lib.PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    drawDiscreetMark(lib, page);
  }

  // 3. La huella del contenido viaja dentro del propio PDF (metadatos)
  pdfDoc.setSubject(`TRAMPTO-HASH:${contentHash}`);

  // 4. Huella SHA-256 del PDF sellado final: es la huella de verificación
  const sealedBytes = new Uint8Array(await pdfDoc.save());
  const stampedHash = await sha256Hex(sealedBytes);

  return {
    sealId: crypto.randomUUID(),
    contentHash,
    stampedHash,
    pageCount: pages.length,
    filename,
    sealedBytes,
    createdAt: new Date().toISOString(),
  };
}

// Registra el sello en sealed_documents (misma tabla y forma que la web).
// Sin este registro el enlace público de verificación no funciona.
export async function registerSeal(result: SealResult): Promise<RegisterResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const fullRow = {
    user_id: userId,
    filename: result.filename,
    page_count: result.pageCount,
    seal_id: result.sealId,
    content_hash: result.contentHash,
    hash: result.stampedHash,
  };

  const { error } = await supabase
    .from("sealed_documents")
    .insert(fullRow)
    .abortSignal(dbTimeout());
  if (!error) return { ok: true };

  // Reintento con la forma mínima (como el fix de sellados anónimos de la web)
  const { error: retryError } = await supabase
    .from("sealed_documents")
    .insert({
      user_id: userId,
      filename: result.filename,
      seal_id: result.sealId,
      hash: result.stampedHash,
    })
    .abortSignal(dbTimeout());
  if (!retryError) return { ok: true };

  console.error("registerSeal error:", error, retryError);
  return { ok: false, error: retryError.message };
}

export interface VerifyResult {
  valid: boolean;
  hash: string;
  sealId?: string;
  filename?: string;
  createdAt?: string;
}

// Verifica un PDF: huella SHA-256 del fichero → búsqueda en sealed_documents
export async function verifyPdf(file: File): Promise<VerifyResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const stampedHash = await sha256Hex(bytes);
  const record = await lookupHash(stampedHash);
  return record ?? { valid: false, hash: stampedHash };
}

// Normaliza una huella pegada por el usuario: una huella SHA-256 son 64
// caracteres hexadecimales. Ignora comillas, espacios, barras o cualquier
// otro carácter que se haya colado al copiar el enlace.
export function normalizeHash(raw: string): string {
  const match = raw.match(/[0-9a-fA-F]{64}/);
  return (match ? match[0] : raw.replace(/[^0-9a-fA-F]/g, "")).toLowerCase();
}

export async function lookupHash(hash: string): Promise<VerifyResult | null> {
  const clean = normalizeHash(hash);
  const { data, error } = await supabase
    .from("sealed_documents")
    .select("seal_id, hash, filename, created_at")
    .eq("hash", clean)
    .abortSignal(dbTimeout())
    .maybeSingle();

  // Error de red/servidor: no podemos afirmar que el sello sea inválido
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    valid: true,
    hash: clean,
    sealId: data.seal_id,
    filename: data.filename,
    createdAt: data.created_at,
  };
}

// Enlace público de verificación: una pestaña más de la web de TRAMPTO,
// para que cualquiera pueda verificar el documento.
export function verificationUrl(stampedHash: string): string {
  return `${VERIFY_BASE}${stampedHash}`;
}

// Sustituye caracteres fuera de WinAnsi (las fuentes estándar de PDF no los aceptan)
function winAnsiSafe(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "_");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// Certificado de integridad: mismo contenido que el de la web
// (Seal ID, SHA-256, fecha) ampliado con la huella de verificación y el enlace público.
export async function generateCertificate(result: SealResult): Promise<Uint8Array> {
  const lib = await loadPdfLib();
  const { BURGUNDY, GOLD, NAVY } = brandColors(lib);
  const { rgb, StandardFonts } = lib;
  const certPdf = await lib.PDFDocument.create();
  const page = certPdf.addPage([595, 842]); // A4
  const helvetica = await certPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await certPdf.embedFont(StandardFonts.HelveticaBold);
  const timesBold = await certPdf.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await certPdf.embedFont(StandardFonts.TimesRomanItalic);
  const courier = await certPdf.embedFont(StandardFonts.Courier);

  const left = 56;
  const right = 595 - 56;

  // Cabecera
  page.drawText("TRAMPTO", {
    x: left,
    y: 762,
    size: 26,
    font: helveticaBold,
    color: BURGUNDY,
  });
  page.drawText("Integridad documental", {
    x: left,
    y: 746,
    size: 10,
    font: helvetica,
    color: rgb(0.45, 0.48, 0.55),
  });
  drawSealMark(lib, page, helveticaBold, right - 34, 768, 34, 0.95);

  page.drawLine({
    start: { x: left, y: 722 },
    end: { x: right, y: 722 },
    color: GOLD,
    thickness: 1.2,
  });

  // Título
  page.drawText("Certificado de Integridad", {
    x: left,
    y: 672,
    size: 30,
    font: timesBold,
    color: NAVY,
  });
  page.drawText("Documento protegido con TRAMPTO", {
    x: left,
    y: 650,
    size: 12,
    font: helvetica,
    color: GOLD,
  });

  // Datos del sello
  const rows: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: "DOCUMENTO", value: truncate(winAnsiSafe(result.filename), 64) },
    { label: "ID DE SELLO", value: `TRP-${result.sealId}`, mono: true },
    {
      label: "HUELLA SHA-256 DEL DOCUMENTO ORIGINAL (PRIVADA — IDENTIFICA TU ORIGINAL)",
      value: result.contentHash,
      mono: true,
    },
    {
      label: "HUELLA SHA-256 DEL PDF SELLADO (VERIFICACIÓN PÚBLICA)",
      value: result.stampedHash,
      mono: true,
    },
    {
      label: "FECHA DE SELLADO",
      value: new Date(result.createdAt).toUTCString(),
    },
    {
      label: "ENLACE PÚBLICO DE VERIFICACIÓN",
      value: truncate(verificationUrl(result.stampedHash), 86),
      mono: true,
    },
  ];

  let y = 606;
  for (const row of rows) {
    page.drawText(winAnsiSafe(row.label), {
      x: left,
      y,
      size: 8,
      font: helveticaBold,
      color: rgb(0.45, 0.48, 0.55),
    });
    page.drawText(row.value, {
      x: left,
      y: y - 15,
      size: row.mono ? 9.5 : 11,
      font: row.mono ? courier : helvetica,
      color: rgb(0.12, 0.13, 0.18),
    });
    y -= 52;
  }

  // Declaración
  page.drawLine({
    start: { x: left, y: y + 10 },
    end: { x: right, y: y + 10 },
    color: rgb(0.88, 0.89, 0.92),
    thickness: 0.8,
  });

  const statement = [
    "Este documento ha sido sellado criptográficamente con TRAMPTO.",
    "Cualquier modificación posterior al sellado invalida este certificado.",
    "Guarda este certificado en un lugar seguro: las huellas identifican tu documento",
    "de forma única. Compártelo solo mediante el enlace público de verificación.",
  ];
  let sy = y - 26;
  for (const line of statement) {
    page.drawText(line, {
      x: left,
      y: sy,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.33, 0.4),
    });
    sy -= 18;
  }

  const phrase1 = "«A partir de este hash, tu documento es único en internet.";
  const phrase2 = "No existen dos iguales.»";
  const p1w = timesItalic.widthOfTextAtSize(phrase1, 14);
  const p2w = timesItalic.widthOfTextAtSize(phrase2, 14);
  page.drawText(phrase1, {
    x: (595 - p1w) / 2,
    y: sy - 36,
    size: 14,
    font: timesItalic,
    color: NAVY,
  });
  page.drawText(phrase2, {
    x: (595 - p2w) / 2,
    y: sy - 56,
    size: 14,
    font: timesItalic,
    color: NAVY,
  });

  // Pie
  page.drawLine({
    start: { x: left, y: 88 },
    end: { x: right, y: 88 },
    color: GOLD,
    thickness: 1.2,
  });
  const footer = "Generado por TRAMPTO · trampto.com";
  const fw = helvetica.widthOfTextAtSize(footer, 8.5);
  page.drawText(footer, {
    x: (595 - fw) / 2,
    y: 70,
    size: 8.5,
    font: helvetica,
    color: rgb(0.55, 0.58, 0.64),
  });

  return new Uint8Array(await certPdf.save());
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function sealedFilename(original: string): string {
  return original.replace(/\.pdf$/i, "") + "-trampto-sealed.pdf";
}

export function certificateFilename(original: string): string {
  return original.replace(/\.pdf$/i, "") + "_certificate.pdf";
}
