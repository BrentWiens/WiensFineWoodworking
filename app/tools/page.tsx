import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, Footer } from '@/components';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Tools | Wiens Fine Woodworking',
    description: 'Tools for woodworking design',
    openGraph: {
        title: 'Tools | Wiens Fine Woodworking',
        description: 'Tools for woodworking design',
    },
};

export default function ToolsPage() {
    return (
        <>
            <Navigation />

            <main className="min-h-screen bg-stone-50">
                {/* Hero header with background - now starts at top */}
                <div className="relative pt-30 pb-16 px-6">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/handplanes.jpg"
                            alt="Handplanes"
                            fill
                            className="object-cover"
                            priority
                            quality={60}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                            Tools
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            A collection of tools used in woodworking design and craftsmanship.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12">

                    <div className="space-y-6">
                        {/* Tool 1: Dovetail Calculator */}
                        <Link
                            href="/tools/dovetail-calculator"
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200"
                        >
                            <div className="relative flex-shrink-0 aspect-[250/208] w-full max-w-[250px] mx-auto sm:mx-0">
                                <Image
                                    src="/images/dovetail-calculator/dovetail-sizing.jpg"
                                    alt="Dovetail joint preview"
                                    fill
                                    className="rounded-md object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-2xl font-bold text-stone-800 mb-2">
                                    Dovetail Joint Calculator
                                </h2>
                                <p className="text-stone-600">
                                    Visualize and plan your dovetail joints with custom dimensions, pin angles, and spacing.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="#"
                            className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200"
                        >
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">
                                (Coming Soon) Fractional Calculator                        </h2>
                            <p className="text-stone-600">
                                Convenient fractional calculator for working with imperial measurements.
                            </p>
                        </Link>

                        <Link
                            href="#"
                            className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200"
                        >
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">
                                (Coming Soon) Board Feet Calculator                        </h2>
                            <p className="text-stone-600">
                                Calculate board feet from lumber dimensions.
                            </p>
                        </Link>

                        <Link
                            href="#"
                            className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200"
                        >
                            <h2 className="text-2xl font-bold text-stone-800 mb-2">
                                (Coming Soon) Cut List Optimizer                        </h2>
                            <p className="text-stone-600">
                                Optimize the material usage for a project. Particularly when working with sheet goods like plywood.
                            </p>
                        </Link>

                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}