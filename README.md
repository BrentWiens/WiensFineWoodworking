# Wiens Fine Woodworking

A modern, responsive website for Wiens Fine Woodworking showcasing custom furniture and handcrafted wood projects.

🔗 **Live Site:** [wfinew.com](https://wfinew.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel
- **Testing:** Playwright
- **Monitoring:** Sentry, Vercel Analytics

## Features

- 📸 **Photo Gallery** - 35+ project images with lightbox modal, keyboard navigation, and smooth transitions
- 🛠️ **Woodworking Tools** - Interactive calculators including dovetail & box joint visualizer, fractional calculator, multi-entry board feet calculator, and cut list optimizer with 9 packing algorithms. Features imperial/metric unit toggle, localStorage persistence, and print-friendly layouts
- 🖼️ **Image Optimization** - Automatic WebP/AVIF conversion, responsive sizing, lazy loading
- 📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes
- ⚡ **Performance** - Server-side rendering, static generation, optimized images
- 🎨 **Modern UI** - Clean design with smooth animations and hover effects
- 🔍 **SEO Optimized** - Meta tags, canonical URLs, OpenGraph, Twitter Cards, Schema.org structured data
- 🔒 **Secure Contact Form** - Cloudflare Turnstile bot protection with email notifications

## Local Development
```bash
# Clone the repository
git clone https://github.com/BrentWiens/WiensFineWoodworking.git

# Navigate to directory
cd wiens-woodworking

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Cloudflare Turnstile (Bot Protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Email (Contact Form)
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Running Tests

```bash
# Run Playwright E2E tests
npm run test

# Run Playwright tests with UI mode (interactive)
npm run test:ui

# Run Vitest unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Type check the project
npm run type-check
```

## Project Structure
```
wiens-woodworking/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout & metadata
│   ├── globals.css           # Global styles
│   ├── gallery/page.tsx      # Photo gallery page
│   ├── tools/
│   │   ├── page.tsx          # Tools listing page
│   │   ├── dovetail-calculator/page.tsx
│   │   ├── fractional-calculator/page.tsx
│   │   ├── board-feet-calculator/page.tsx
│   │   └── cut-list-optimizer/page.tsx
│   ├── api/contact/route.ts  # Contact form API
│   ├── sitemap.ts            # Dynamic sitemap
│   └── robots.ts             # Robots.txt
├── components/               # React components
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── Featured.tsx
│   ├── About.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   ├── ContactForm.tsx
│   ├── Gallery.tsx
│   ├── GalleryWrapper.tsx
│   ├── DovetailVisualizer/   # Dovetail & box joint calculator
│   ├── FractionalCalculator/ # Fractional calculator component
│   ├── BoardFeetCalculator/  # Multi-entry board feet calculator
│   ├── CutListOptimizer/     # Cut list optimizer (9 algorithms)
│   ├── UnitToggle.tsx         # Imperial/metric unit toggle
│   ├── Footer.tsx
│   └── index.ts              # Barrel exports
├── tests/                    # Playwright E2E tests
├── public/
│   ├── images/gallery/       # Project photos (35+ images)
│   └── manifest.json         # PWA manifest
└── README.md
```

## Deployment

Automatically deployed to Vercel on push to `main` branch.

**Production URL:** https://wfinew.com

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Learning Outcomes

- **TypeScript** - Type safety, interfaces, and modern JavaScript patterns
- **Next.js 16** - App Router, Server Components vs Client Components, file-based routing
- **React 19** - Latest React features and hooks
- **Modern image optimization** - Next.js Image component, quality settings, responsive sizing
- **Tailwind CSS v4** - Utility-first approach, responsive design, custom styling
- **E2E Testing** - Playwright test suite for critical user flows
- **Production monitoring** - Sentry error tracking, Vercel Analytics

## Key Technical Decisions

### Server Components by Default
Most components are Server Components for optimal performance. Only the Gallery uses `'use client'` for interactive lightbox functionality.

### Image Optimization Strategy
- Gallery thumbnails: 85% quality, responsive sizes
- Lightbox images: 95% quality, 1920px width
- Cached indefinitely with content-based hashing

### Barrel Exports
Components use barrel exports (`components/index.ts`) for cleaner imports throughout the application.

## Performance

- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Image Loading:** Lazy loading with Next.js Image optimization

## Production Readiness

### Monitoring & Observability
- **Error Tracking:** Sentry for client and server-side error monitoring
- **Analytics:** Vercel Analytics for page views and user insights
- **Performance:** Vercel Speed Insights tracking Core Web Vitals

### Quality Assurance
- **E2E Testing:** Playwright test suite with 50 tests covering critical user flows
- **Unit Testing:** Vitest tests for calculator utilities (138 tests: dovetail: 22, fractional: 53, board feet: 22, cut list: 41)
- **Performance Monitoring:** PageSpeed Insights for production performance tracking
- **Type Safety:** Strict TypeScript configuration with `tsc --noEmit` checks

### Security
- **Bot Protection:** Cloudflare Turnstile on contact form
- **Rate Limiting:** Contact form limited to 5 submissions/hour per IP
- **HTTPS:** Enforced via Vercel
- **Security Headers:** CSP, X-Frame-Options, etc.

### Continuous Integration/Deployment
- **CI/CD:** Automatic deployment via Vercel on push to `main`
- **Preview Deployments:** Every PR gets a unique preview URL
- **Zero Downtime:** Atomic deployments with instant rollback capability

### Performance Metrics (Lighthouse)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Monitoring Dashboard
- **Sentry:** [Sentry Dashboard](https://wiens-fine-woodworking.sentry.io/dashboard/default-overview/)
- **Vercel Analytics:** [Vercel Analytics](https://vercel.com/brent-wiens-projects/wiens-fine-woodworking/analytics)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contact

**Brent Wiens**  
Engineering Manager | 14+ years software development experience

- 🔗 [wfinew.com](https://wfinew.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/brentwiens/)
- 🐙 [GitHub](https://github.com/BrentWiens)

