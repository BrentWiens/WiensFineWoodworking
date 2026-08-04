import { Metadata } from 'next';
import { Navigation, Footer } from '@/components';
import PageHero from '@/components/PageHero';
// Not via the barrel: both reach into the project registry, and routing them
// through it would put that data in every other page's bundle.
import GalleryWrapper from '@/components/GalleryWrapper';
import ProjectIndex from '@/components/ProjectIndex';

export const metadata: Metadata = {
    title: 'Gallery | Wiens Fine Woodworking',
    description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario — dining tables, coffee tables, end tables, desks, and more.',
    alternates: {
        canonical: '/gallery',
    },
    openGraph: {
        title: 'Gallery | Wiens Fine Woodworking',
        description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Gallery | Wiens Fine Woodworking',
        description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario',
    },
};

export default function GalleryPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen">
                <PageHero
                    title="Project Gallery"
                    subtitle="Built with precision, quality materials, and the craftsmanship to last a lifetime."
                    imageSrc="/coffee-table-walnut-angled.jpg"
                    imageAlt="Coffee table"
                    imagePosition="object-top"
                    overlay="dark"
                />

                <GalleryWrapper />
                <ProjectIndex />
            </main>

            <Footer />
        </>
    );
}