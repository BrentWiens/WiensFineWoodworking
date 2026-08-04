import fs from 'fs';
import path from 'path';
import Gallery from './Gallery';
import { PROJECTS } from '@/lib/projects';

/**
 * Resolve filename -> project slug here, on the server, so the client receives
 * only the handful of short strings it needs rather than the whole registry.
 */
function slugsForFolder(folder: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const project of PROJECTS) {
    if (project.category !== folder) continue;
    for (const filename of project.images) {
      map[filename] = project.slug;
    }
  }
  return map;
}

function GetImagesFromDir(folder: string) {
  const dir = path.join(process.cwd(), `public/images/gallery/${folder}`);
  if (!fs.existsSync(dir)) return [];
  const filenames = fs.readdirSync(dir);

  // Filter for image files only
  return filenames.filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
}

// Server component that reads files
export default function GalleryWrapper() {
  return (
    <>
      <Gallery
        images={GetImagesFromDir("tables")}
        folder="tables"
        sectionId="gallery"
        projectSlugs={slugsForFolder("tables")}
      />
      <Gallery
        images={GetImagesFromDir("finish-carpentry")}
        folder="finish-carpentry"
        title="Finish Carpentry"
        sectionId="gallery-finish-carpentry"
        projectSlugs={slugsForFolder("finish-carpentry")}
      />
      <Gallery
        images={GetImagesFromDir("other")}
        folder="other"
        title="Other Work"
        sectionId="gallery-other"
        background="stone"
        projectSlugs={slugsForFolder("other")}
      />
    </>
  );
}
