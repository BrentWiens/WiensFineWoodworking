import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { PROJECTS, getProject, getProjectByImage, getSiblings, imagePath } from './projects';

const GALLERY_ROOT = path.join(process.cwd(), 'public/images/gallery');
const CATEGORIES = ['tables', 'finish-carpentry', 'other'] as const;

function filesOnDisk(category: string): string[] {
  return fs
    .readdirSync(path.join(GALLERY_ROOT, category))
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
}

/**
 * The registry drives page generation, the gallery index and the sitemap, so a
 * typo'd filename produces a project page with a broken image and a dead link in
 * the sitemap — neither of which fails the build. These check the data itself.
 */
describe('project registry', () => {
  it('has a unique slug for every project', () => {
    const slugs = PROJECTS.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses URL-safe slugs', () => {
    for (const project of PROJECTS) {
      expect(project.slug, `${project.slug} is not URL-safe`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('gives every project a title, description and at least one image', () => {
    for (const project of PROJECTS) {
      expect(project.title.trim(), `${project.slug} has no title`).not.toBe('');
      expect(project.description.trim(), `${project.slug} has no description`).not.toBe('');
      expect(project.images.length, `${project.slug} has no images`).toBeGreaterThan(0);
    }
  });

  it('references only images that exist on disk', () => {
    for (const project of PROJECTS) {
      for (const filename of project.images) {
        const full = path.join(GALLERY_ROOT, project.category, filename);
        expect(fs.existsSync(full), `${project.slug} references missing ${filename}`).toBe(true);
      }
    }
  });

  it('never references the same photo from two projects', () => {
    const seen = new Map<string, string>();
    for (const project of PROJECTS) {
      for (const filename of project.images) {
        const key = `${project.category}/${filename}`;
        expect(seen.has(key), `${key} claimed by both ${seen.get(key)} and ${project.slug}`).toBe(false);
        seen.set(key, project.slug);
      }
    }
  });

  it('covers every gallery photo, so nothing is missing a project page', () => {
    const referenced = new Set(
      PROJECTS.flatMap(p => p.images.map(f => `${p.category}/${f}`))
    );
    for (const category of CATEGORIES) {
      for (const filename of filesOnDisk(category)) {
        const key = `${category}/${filename}`;
        expect(referenced.has(key), `${key} is on disk but in no project`).toBe(true);
      }
    }
  });
});

describe('project lookups', () => {
  it('finds a project by slug and returns undefined for unknown ones', () => {
    expect(getProject(PROJECTS[0].slug)).toEqual(PROJECTS[0]);
    expect(getProject('not-a-real-project')).toBeUndefined();
  });

  it('maps an image back to the project that owns it', () => {
    const project = PROJECTS[0];
    expect(getProjectByImage(project.category, project.images[0])?.slug).toBe(project.slug);
    expect(getProjectByImage(project.category, 'nope.jpg')).toBeUndefined();
  });

  it('builds the public path for an image', () => {
    const project = PROJECTS[0];
    expect(imagePath(project)).toBe(
      `/images/gallery/${project.category}/${project.images[0]}`
    );
  });

  it('links siblings within a category and stops at the ends', () => {
    for (const category of CATEGORIES) {
      const peers = PROJECTS.filter(p => p.category === category);
      if (peers.length < 2) continue;

      expect(getSiblings(peers[0]).prev).toBeUndefined();
      expect(getSiblings(peers[0]).next?.slug).toBe(peers[1].slug);
      expect(getSiblings(peers[peers.length - 1]).next).toBeUndefined();
    }
  });
});
