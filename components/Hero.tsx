import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/gallery/handplanes.jpg"
                    alt="Hand planes"
                    fill
                    className="object-cover"
                    priority
                    quality={85}
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content - now with z-10 to appear above background */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                    WIENS Fine Woodworking
                </h1>
                <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md">
                    Handcrafted furniture and custom woodworking projects built with precision and care
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="#gallery"
                        className="bg-white text-stone-800 px-8 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold shadow-lg"
                    >
                        View Gallery
                    </a>
                    <a
                        href="#contact"
                        className="bg-stone-800/90 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-semibold border-2 border-white shadow-lg backdrop-blur-sm"
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </section>
    );
}