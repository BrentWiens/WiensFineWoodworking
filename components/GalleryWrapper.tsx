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
          projectCount: PROJECTS.filter(p => p.category === folder).length,
          cover: `/images/gallery/${folder}/${cover}`,
        }))}
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
