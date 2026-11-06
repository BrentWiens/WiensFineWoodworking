import Gallery, { type GalleryProject } from './Gallery';
import GalleryJumpBar from './GalleryJumpBar';
import GallerySectionNav, { GALLERY_SECTION_NAV_ID } from './GallerySectionNav';
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
  /** Label in the compact pinned bar, short enough for all four to fit on a phone. */
  shortLabel: string;
}[] = [
  {
    folder: 'tables',
    id: 'gallery',
    background: 'white',
    cover: 'end-table-walnut-brass.jpg',
    shortLabel: 'Tables',
  },
  {
    folder: 'finish-carpentry',
    id: 'gallery-finish-carpentry',
    background: 'white',
    cover: 'cabinet-builtin-walnut.jpg',
    shortLabel: 'Carpentry',
  },
  {
    folder: 'home',
    id: 'gallery-home',
    background: 'stone',
    cover: 'bed-walnut.jpg',
    shortLabel: 'Beds & Shelves',
  },
  {
    folder: 'small-work',
    id: 'gallery-small-work',
    background: 'white',
    cover: 'box-dovetails-manitoba-maple.jpg',
    shortLabel: 'Small Work',
  },
];

/**
 * A section's tiles, in registry order: projects as they appear in PROJECTS, and each
 * project's photos in the order it lists them, so one project's photos sit together.
 * Reorder the gallery by reordering lib/projects.ts. The registry tests guarantee
 * every photo on disk belongs to a project, so none are left out.
 *
 * The filename -> project map is resolved here, on the server, so the client receives
 * only the few short strings each tile shows rather than the whole registry.
 */
function sectionContents(folder: ProjectCategory) {
  const images: string[] = [];
  const projects: Record<string, GalleryProject> = {};
  for (const project of PROJECTS) {
    if (project.category !== folder) continue;
    for (const filename of project.images) {
      images.push(filename);
      projects[filename] = { slug: project.slug, title: project.title, kind: project.kind };
    }
  }
  return { images, projects };
}

export default function GalleryWrapper() {
  return (
    <>
      <GallerySectionNav
        sections={SECTIONS.map(({ folder, id, cover }) => ({
          id,
          label: CATEGORY_LABELS[folder],
          cover: `/images/gallery/${folder}/${cover}`,
        }))}
      />
      <GalleryJumpBar
        watchId={GALLERY_SECTION_NAV_ID}
        links={SECTIONS.map(({ id, shortLabel }) => ({ id, label: shortLabel }))}
      />
      {SECTIONS.map(({ folder, id, background }) => {
        const { images, projects } = sectionContents(folder);
        return (
          <Gallery
            key={folder}
            images={images}
            folder={folder}
            title={CATEGORY_LABELS[folder]}
            sectionId={id}
            background={background}
            projects={projects}
          />
        );
      })}
    </>
  );
}
