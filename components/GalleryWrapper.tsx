import fs from 'fs';
import path from 'path';
import Gallery, { type GalleryProject } from './Gallery';
import GallerySectionNav from './GallerySectionNav';
import { CATEGORY_LABELS, PROJECTS, type ProjectCategory } from '@/lib/projects';

/**
 * The gallery's sections, in page order. The jump links and the sections themselves
 * both read from here, so they can't drift apart.
 */
const SECTIONS: {
  folder: ProjectCategory;
  id: string;
  background: 'white' | 'stone';
  /** Filename within the folder, shown behind the jump link. */
  cover: string;
}[] = [
  { folder: 'tables', id: 'gallery', background: 'white', cover: 'end-table-walnut-brass.jpg' },
  {
    folder: 'finish-carpentry',
    id: 'gallery-finish-carpentry',
    background: 'white',
    cover: 'cabinet-builtin-walnut.jpg',
  },
  { folder: 'other', id: 'gallery-other', background: 'stone', cover: 'box-dovetails-manitoba-maple.jpg' },
];

/**
 * Resolve filename -> project here, on the server, so the client receives only the
 * few short strings each tile shows rather than the whole registry.
 */
function projectsForFolder(folder: string): Record<string, GalleryProject> {
  const map: Record<string, GalleryProject> = {};
  for (const project of PROJECTS) {
    if (project.category !== folder) continue;
    for (const filename of project.images) {
      map[filename] = { slug: project.slug, title: project.title, kind: project.kind };
    }
  }
  return map;
}

function GetImagesFromDir(folder: string) {
  const dir = path.join(process.cwd(), `public/images/gallery/${folder}`);
  if (!fs.existsSync(dir)) return [];
  const filenames = fs.readdirSync(dir);

  return filenames.filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
}

export default function GalleryWrapper() {
  return (
    <>
      <GallerySectionNav
        sections={SECTIONS.map(({ folder, id, cover }) => ({
          id,
          label: CATEGORY_LABELS[folder],
          projectCount: PROJECTS.filter(p => p.category === folder).length,
          cover: `/images/gallery/${folder}/${cover}`,
        }))}
      />
      {SECTIONS.map(({ folder, id, background }) => (
        <Gallery
          key={folder}
          images={GetImagesFromDir(folder)}
          folder={folder}
          title={CATEGORY_LABELS[folder]}
          sectionId={id}
          background={background}
          projects={projectsForFolder(folder)}
        />
      ))}
    </>
  );
}
