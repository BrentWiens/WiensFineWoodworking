export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Brent built us a custom walnut dining table that seats 8. He helped us choose the perfect wood and finish, kept us updated throughout, and the craftsmanship is stunning. It's the centerpiece of our home.",
      author: "Sarah M.",
      location: "Waterloo, ON",
    },
    {
      id: 2,
      quote: "I needed a unique gift for my parents' anniversary - an end grain cutting board with their initials. Brent created something even more beautiful than I imagined. The attention to detail was incredible.",
      author: "Mike T.",
      location: "Cambridge, ON",
    },
    {
      id: 3,
      quote: "From initial consultation to final delivery, working with Brent was a pleasure. Our custom built-in shelves are exactly what we envisioned. Quality craftsmanship and excellent communication throughout.",
      author: "Jennifer L.",
      location: "Kitchener, ON",
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
                "{testimonial.quote}"
              </p>

              {/* Author info */}
              <div className="border-t border-stone-200 pt-4">
                <p className="font-semibold text-stone-800">{testimonial.author}</p>
                <p className="text-stone-500 text-sm">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}