import Image from 'next/image';

export default function About() {
    return (
        <section id="about" className="py-20 px-6 bg-stone-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-stone-800 mb-8 text-center">
                    About Wiens Fine Woodworking
                </h2>

                <div className="prose prose-lg prose-stone mx-auto">
                    <p className="text-stone-700 text-lg leading-relaxed mb-6">
                        Welcome to Wiens Fine Woodworking, where traditional craftsmanship meets modern design.
                        Every piece I create is built with meticulous attention to detail, quality materials,
                        and a passion for the timeless art of woodworking.
                    </p>

                    <p className="text-stone-700 text-lg leading-relaxed mb-6">
                        From custom furniture to unique handcrafted pieces, each project is an opportunity
                        to bring your vision to life. I work closely with clients to ensure every detail
                        matches their needs and exceeds their expectations.
                    </p>

                    <p className="text-stone-700 text-lg leading-relaxed mb-6">
                        Whether you're looking for a statement piece for your home, a custom gift, or
                        functional furniture built to last generations, I'm here to help create something
                        truly special.
                    </p>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mt-8">
                        <h3 className="text-2xl font-semibold text-stone-800 mb-4">What I Offer</h3>
                        <ul className="space-y-3 text-stone-700">
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Custom furniture design and build</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Handcrafted cutting boards and kitchen items</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Restoration and refinishing of heirloom pieces</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>One-of-a-kind gifts and home decor</span>
                            </li>
                        </ul>
                    </div>

                    {/* Shop Images */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                            <Image
                                src="/shop2.jpg"
                                alt="View of woodworking shop"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, 50vw"
                                quality={85}
                            />
                        </div>

                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                            <Image
                                src="/shop1.jpg"
                                alt="View of woodworking shop"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, 50vw"
                                quality={85}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}