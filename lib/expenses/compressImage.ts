/**
 * Shrinks a receipt photo in the browser before it's uploaded. A phone photo is 3–8 MB;
 * at 2000 px on the long side as an 80% JPEG it's a few hundred KB, which uploads
 * quickly over mobile data and is still sharp enough to read every line.
 */

export const MAX_EDGE_PX = 2000;
const JPEG_QUALITY = 0.8;

/** The size to draw an image at so its long side is at most `maxEdge`. Never enlarges. */
export function scaledSize(width: number, height: number, maxEdge = MAX_EDGE_PX): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * The file to upload: a PDF as-is, a photo shrunk to a JPEG. Keeps the original when
 * it's already a small JPEG, PNG or WebP that re-encoding wouldn't make smaller.
 * Throws with a message for the person when the photo can't be opened.
 */
export async function prepareReceiptFile(file: File): Promise<File> {
  if (file.type === 'application/pdf') return file;

  let bitmap: ImageBitmap;
  try {
    // Honours the phone's rotation, so a portrait receipt stays upright
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('This photo couldn’t be opened. Take it again, or choose a JPEG or PNG.');
  }

  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser can’t shrink photos. Try another browser.');
  // White behind any transparency, which JPEG can't hold
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('This photo couldn’t be prepared for upload. Try again.');

  const usableAsIs = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  if (usableAsIs && file.size <= blob.size) return file;
  return new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
}
