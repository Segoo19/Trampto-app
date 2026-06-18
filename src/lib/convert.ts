// Conversión de otros formatos a PDF en el propio navegador, antes de sellar.
// El PDF resultante es el documento que se sella y registra.

type PdfLib = typeof import("pdf-lib");
let pdfLibPromise: Promise<PdfLib> | null = null;
function loadPdfLib(): Promise<PdfLib> {
  pdfLibPromise ??= import("pdf-lib");
  return pdfLibPromise;
}

export type FileKind = "pdf" | "image" | "docx" | "pptx" | "txt";

// Formatos de Office ANTIGUOS (binarios OLE, no ZIP): no se pueden convertir
// en el navegador. Se detectan para dar un mensaje claro al usuario.
export const LEGACY_OFFICE_RE = /\.(ppt|pps|pot|doc|dot|xls|xlt)$/i;

// Formatos aceptados para sellar (atributo accept de los inputs de fichero)
export const SEAL_ACCEPT =
  ".pdf,.docx,.pptx,.txt,application/pdf,image/jpeg,image/png,image/webp,image/gif,image/bmp,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
];

export function detectKind(file: File): FileKind | null {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name))
    return "image";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx$/i.test(file.name)
  )
    return "docx";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    /\.pptx$/i.test(file.name)
  )
    return "pptx";
  if (file.type === "text/plain" || /\.txt$/i.test(file.name)) return "txt";
  return null;
}

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

export interface ConvertedPdf {
  bytes: Uint8Array;
  filename: string; // nombre del PDF resultante
}

// Convierte el fichero a PDF. Para PDFs devuelve los bytes tal cual.
export async function toPdf(file: File): Promise<ConvertedPdf> {
  const kind = detectKind(file);
  if (!kind) throw new Error("FORMATO_NO_SOPORTADO");

  if (kind === "pdf") {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      filename: file.name,
    };
  }

  const filename = `${baseName(file.name)}.pdf`;
  if (kind === "image") return { bytes: await imageToPdf(file), filename };

  let text: string;
  if (kind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    text = result.value;
  } else if (kind === "pptx") {
    text = await pptxToText(file);
  } else {
    text = await file.text();
  }
  return { bytes: await textToPdf(text), filename };
}

// Extrae el texto de un PPTX (un .pptx es un zip de XMLs). Recorre las
// diapositivas en orden y junta los fragmentos de texto <a:t>. Se conserva
// el contenido (no el diseño), suficiente para generar una huella estable.
async function pptxToText(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  let zip: Awaited<ReturnType<typeof JSZip.loadAsync>>;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    // No es un ZIP: probablemente un .ppt antiguo renombrado o un .pptx
    // dañado/protegido con contraseña.
    throw new Error("OFFICE_LEGACY");
  }

  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
      return na - nb;
    });

  const decodeEntities = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

  const slides: string[] = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const xml = await zip.files[slidePaths[i]].async("string");
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) =>
      decodeEntities(m[1])
    );
    const body = runs.join("\n").trim();
    slides.push(`— Diapositiva ${i + 1} —${body ? "\n" + body : ""}`);
  }

  return slides.join("\n\n") || "Presentación sin texto.";
}

// Imagen → página PDF del tamaño de la imagen (ajustada a A4 como máximo)
async function imageToPdf(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))),
      "image/png"
    )
  );
  const pngBytes = new Uint8Array(await blob.arrayBuffer());

  const lib = await loadPdfLib();
  const doc = await lib.PDFDocument.create();
  const png = await doc.embedPng(pngBytes);

  // Escalar para que quepa en A4 manteniendo la proporción
  const maxW = 595;
  const maxH = 842;
  const scale = Math.min(maxW / png.width, maxH / png.height, 1);
  const w = png.width * scale;
  const h = png.height * scale;

  const page = doc.addPage([w, h]);
  page.drawImage(png, { x: 0, y: 0, width: w, height: h });
  return new Uint8Array(await doc.save());
}

// Texto plano (TXT o texto extraído de DOCX) → PDF A4 maquetado
async function textToPdf(text: string): Promise<Uint8Array> {
  const lib = await loadPdfLib();
  const doc = await lib.PDFDocument.create();
  const font = await doc.embedFont(lib.StandardFonts.Helvetica);

  const size = 11;
  const lineHeight = 16;
  const margin = 56;
  const pageW = 595;
  const pageH = 842;
  const maxWidth = pageW - margin * 2;

  // Las fuentes estándar solo aceptan WinAnsi
  // eslint-disable-next-line no-control-regex
  const clean = text.replace(/\r/g, "").replace(/[^\x0A\x20-\x7E\xA0-\xFF]/g, "_");

  const lines: string[] = [];
  for (const paragraph of clean.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // Palabra más larga que la línea: trocear
        let rest = word;
        while (font.widthOfTextAtSize(rest, size) > maxWidth) {
          let i = 1;
          while (
            i < rest.length &&
            font.widthOfTextAtSize(rest.slice(0, i + 1), size) <= maxWidth
          ) {
            i++;
          }
          lines.push(rest.slice(0, i));
          rest = rest.slice(i);
        }
        current = rest;
      }
    }
    if (current) lines.push(current);
  }

  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;
  for (const line of lines) {
    if (y < margin) {
      page = doc.addPage([pageW, pageH]);
      y = pageH - margin;
    }
    if (line) {
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        color: lib.rgb(0.12, 0.13, 0.18),
      });
    }
    y -= lineHeight;
  }

  return new Uint8Array(await doc.save());
}
