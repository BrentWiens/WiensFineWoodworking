import { GOOGLE_BUSINESS_URL } from '@/lib/metadata';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Brent from Wiens Fine Woodworking built plinths for the 13th Street Art Gallery.  Communication was easy, the workmanship and attention to detail was excellent and the project was completed in a timely manner. I would highly recommend.",
      author: "13th Street Winery",
      location: "St. Catharines",
    },
    {
      id: 2,
      quote: "Brent Wiens delivered outstanding quality and craftsmanship on our cabinet door project, showcasing a true mastery of woodworking that exceeded all our expectations.",
      author: "Nikhil Thiruvengadam",
      location: "Cambridge",
    },
    {
      id: 3,
      quote: "We had Brent build us a couple of  frame and panel doors to replace the default crappy Ikea doors for our closet build and they were perfect, he even assisted with the install! Great attention to detail and very responsive commmunication.",
      author: "Robert Haskett",
      location: "Kitchener",
    },
  ];

  return (
    <section className="py-20 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">
          What Customers Say
        </h2>

        {/* Testimonial cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Quote icon */}
              <svg
                className="w-10 h-10 text-stone-300 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Quote text */}
              <p className="text-stone-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>

              {/* Author info */}
              <div className="border-t border-stone-200 pt-4">
                <p className="font-semibold text-stone-800">{testimonial.author}</p>
                <p className="text-stone-500 text-sm">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links out rather than restating ratings here: Google ignores review markup
            for a LocalBusiness on its own site as self-serving, so stars only ever
            render on the profile itself. */}
        <div className="mt-12 text-center">
          <a
            href={GOOGLE_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-stone-700 underline underline-offset-4 hover:text-stone-900 transition-colors"
          >
            Read all reviews on Google
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H18v4.5M17.5 6.5L10 14M15 13.5V18a1 1 0 01-1 1H6a1 1 0 01-1-1V10a1 1 0 011-1h4.5"
              />
            </svg>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}