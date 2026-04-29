import Image from 'next/image';

export default function About() {
    return (
        <section id="about" className="py-20 px-6 bg-stone-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-stone-800 mb-8 text-center">
                    About Me
                </h2>

                {/* Two-column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Text content - takes 2 columns on desktop */}
                    <div className="lg:col-span-2 space-y-6">
                        <p className="text-stone-700 text-lg leading-relaxed">
                            I&apos;m Brent Wiens, and I pride myself on traditional craftsmanship meeting modern design.
                            Every piece I create is built with meticulous attention to detail, superb functionality, quality materials,
                            and a passion for the timeless art of woodworking.
                        </p>

                        <p className="text-stone-700 text-lg leading-relaxed">
                            I specialize in custom tables and desks — from dining tables that become the heart of your home,
                            to coffee tables, end tables, and desks built for both beauty and everyday use. Each piece is
                            designed around your space, your style, and built to last generations.
                        </p>

                        <p className="text-stone-700 text-lg leading-relaxed">
                            Whether you&apos;re looking for a statement dining table, a functional home office desk, or the perfect
                            accent piece for your living room, I work closely with you to bring that vision to life.
                        </p>

                        {/* What I Offer section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-8">
                            <h3 className="text-2xl font-semibold text-stone-800 mb-4">What I Offer</h3>
                            <ul className="space-y-3 text-stone-700">
                                <li className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Custom dining tables</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Coffee tables and end tables</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Desks and home office furniture</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="relative h-full min-h-80 max-w-sm mx-auto lg:max-w-none overflow-hidden rounded-lg shadow-lg">
                            <Image
                                src="/brent-in-shop.jpg"
                                alt="Brent Wiens in woodworking shop"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 500px) 50vw, 33vw"
                                quality={70}
                            />
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                        <Image
                            src="/shop2.jpg"
                            alt="View of woodworking shop"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 50vw"
                            quality={70}
                        />
                    </div>

                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                        <Image
                            src="/shop1.jpg"
                            alt="View of woodworking shop"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 50vw"
                            quality={70}
                        />
                    </div>
                </div>

                <p className="text-stone-700 text-lg text-center leading-relaxed">
                    My shop in Kitchener is well equipped with the tools to bring your vision to life.
                </p>
            </div>
        </section>
    );
}