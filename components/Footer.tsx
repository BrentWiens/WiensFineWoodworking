import Link from 'next/link';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-800 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-stone-300 text-sm">
            © {currentYear} WIENS Fine Woodworking. All rights reserved.
          </div>

          {/* Social Links */}
          <SocialLinks variant="icons" />

          {/* Quick Links */}
          <div className="flex gap-6 text-sm">
            <Link href="/gallery" className="text-stone-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/#about" className="text-stone-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/tools" className="text-stone-300 hover:text-white transition-colors">
              Tools
            </Link>
            <Link href="/#contact" className="text-stone-300 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}