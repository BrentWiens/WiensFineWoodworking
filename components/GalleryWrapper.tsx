import fs from 'fs';
import path from 'path';
import Gallery from './Gallery';

// Server component that reads files
export default function GalleryWrapper() {
  const galleryDir = path.join(process.cwd(), 'public/images/gallery');
  const filenames = fs.readdirSync(galleryDir);
  
  // Filter for image files only
  const imageFiles = filenames.filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );
  
  return <Gallery images={imageFiles} />;
}