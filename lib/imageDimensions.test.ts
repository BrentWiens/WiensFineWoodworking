import { describe, it, expect } from 'vitest';
import { getImageDimensions } from './imageDimensions';
import { PROJECTS, imagePath } from './projects';

describe('getImageDimensions', () => {
  it('reads the size of every project photo', () => {
    for (const project of PROJECTS) {
      project.images.forEach((_, index) => {
        const { width, height } = getImageDimensions(imagePath(project, index));
        expect(width, `${imagePath(project, index)} width`).toBeGreaterThan(0);
        expect(height, `${imagePath(project, index)} height`).toBeGreaterThan(0);
      });
    }
  });

  it('keeps portrait photos portrait', () => {
    // entryway.jpg is 1500x2000 — a regression here is what cropped it before.
    expect(getImageDimensions('/images/gallery/finish-carpentry/entryway.jpg')).toEqual({
      width: 1500,
      height: 2000,
    });
  });

  it('throws on a missing file rather than rendering a broken image', () => {
    expect(() => getImageDimensions('/images/gallery/tables/nope.jpg')).toThrow();
  });
});
