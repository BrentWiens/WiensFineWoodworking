import fs from 'fs';
import path from 'path';
import Gallery from './Gallery';

const TABLES_AND_DESKS = new Set([
  'coffee-table-walnut.jpg',
  'end-table-walnut-brass.jpg',
  'end-table-walnut.jpg',
  'end-tables-walnut-maple.jpg',
]);

// Server component that reads files
export default function GalleryWrapper() {
  const galleryDir = path.join(process.cwd(), 'public/images/gallery');
  const filenames = fs.readdirSync(galleryDir);

  // Filter for image files only
  const imageFiles = filenames.filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  const tablesAndDesks = imageFiles.filter(f => TABLES_AND_DESKS.has(f));
  const other = imageFiles.filter(f => !TABLES_AND_DESKS.has(f));

  return (
    <>
      <Gallery
        images={tablesAndDesks}
        sectionId="gallery"
      />
      <Gallery
        images={other}
        title="Other Work"
        sectionId="gallery-other"
        background="stone"
      />
    </>
  );
}
