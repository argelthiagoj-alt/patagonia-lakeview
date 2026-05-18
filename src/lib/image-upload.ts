/**
 * Client-side image processing for the admin cabin form.
 *
 * We accept image files (drag/drop or file picker), resize them to a
 * reasonable max width in a canvas, and encode them as JPEG data URLs.
 *
 * This keeps the project free of external storage (S3, Supabase Storage…)
 * while still letting the admin upload from disk in two clicks.
 *
 * For larger deployments, swap this for an upload-to-storage step that
 * returns a remote URL. The rest of the form already treats `images[i].url`
 * as an opaque string, so nothing else changes.
 */

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB raw input
export const MAX_OUTPUT_WIDTH = 1600;
export const JPEG_QUALITY = 0.82;

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export type ProcessedImage = {
  url: string;
  alt: string;
};

export class UploadError extends Error {
  constructor(public reason: "type" | "size" | "decode") {
    super(reason);
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new UploadError("decode"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new UploadError("decode"));
    img.src = src;
  });
}

/**
 * Read a File, downscale if wider than MAX_OUTPUT_WIDTH, return a JPEG data URL.
 * Original aspect ratio is preserved.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new UploadError("type");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError("size");
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadHtmlImage(dataUrl);

  const scale = Math.min(1, MAX_OUTPUT_WIDTH / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("decode");
  ctx.drawImage(img, 0, 0, w, h);

  const url = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const altGuess = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return { url, alt: altGuess };
}

export async function processImageFiles(
  files: FileList | File[]
): Promise<{ images: ProcessedImage[]; errors: UploadError[] }> {
  const out: ProcessedImage[] = [];
  const errors: UploadError[] = [];
  for (const file of Array.from(files)) {
    try {
      out.push(await processImageFile(file));
    } catch (err) {
      if (err instanceof UploadError) errors.push(err);
      else errors.push(new UploadError("decode"));
    }
  }
  return { images: out, errors };
}

export function uploadErrorMessage(err: UploadError): string {
  switch (err.reason) {
    case "type":
      return "Formato no soportado. Usá JPG, PNG, WebP o AVIF.";
    case "size":
      return "La imagen pesa más de 8 MB. Probá una más liviana.";
    case "decode":
      return "No pudimos leer esa imagen.";
  }
}
