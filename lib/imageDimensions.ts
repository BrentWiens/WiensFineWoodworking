import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Reads a photo's size from its header, at build time, so pages can render it at its
 * real aspect ratio instead of cropping it into a fixed box.
 *
 * `publicPath` is the URL path, e.g. `/images/gallery/tables/ash-desk.jpg`.
 */
export function getImageDimensions(publicPath: string): Dimensions {
  const file = path.join(process.cwd(), 'public', publicPath);
  const { width, height, orientation } = imageSize(fs.readFileSync(file));
  if (!width || !height) {
    throw new Error(`Could not read the dimensions of ${publicPath}`);
  }

  // EXIF orientations 5–8 are rotated a quarter turn. The stored pixels are sideways,
  // but browsers and the image optimizer both display them upright, so swap.
  return orientation && orientation >= 5
    ? { width: height, height: width }
    : { width, height };
}
