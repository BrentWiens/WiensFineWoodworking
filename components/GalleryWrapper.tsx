import fs from 'fs';
import path from 'path';
import Gallery from './Gallery';

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
      />
      <Gallery
        images={GetImagesFromDir("finish-carpentry")}
        folder="finish-carpentry"
        title="Finish Carpentry"
        sectionId="gallery-finish-carpentry"
      />
      <Gallery
        images={GetImagesFromDir("other")}
        folder="other"
        title="Other Work"
        sectionId="gallery-other"
        background="stone"
      />
    </>
  );
}
