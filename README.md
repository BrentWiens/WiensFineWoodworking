# Wiens Fine Woodworking

A modern, responsive website for Wiens Fine Woodworking showcasing custom furniture, finish carpentry, and handcrafted wood projects.

🔗 **Live Site:** [wfinew.com](https://wfinew.com)

## Tech Stack

- **Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript 6
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel
- **Testing:** Vitest (unit), Playwright (E2E)
- **CI:** GitHub Actions (lint, type-check, unit tests, E2E tests)
- **Monitoring:** Sentry, Vercel Analytics, Vercel Speed Insights

## Features

- 📸 **Photo Gallery** - 35+ project images across 3 sections (Tables, Finish Carpentry, Other Work) with lightbox modal, keyboard navigation, and smooth transitions
- 🛠️ **Woodworking Tools** - 5 interactive calculators: dovetail & box joint visualizer, fractional calculator, board feet calculator, cut list optimizer (9 packing algorithms), and trigonometry calculator. Features imperial/metric unit toggle, localStorage persistence, and print-friendly layouts
- 🖼️ **Image Optimization** - Automatic WebP/AVIF conversion, responsive sizing, lazy loading
- 📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes
- ⚡ **Performance** - Server-side rendering, static generation, optimized images
- 🎨 **Modern UI** - Clean design with smooth animations and hover effects
- 🔍 **SEO Optimized** - Meta tags, canonical URLs, OpenGraph, Twitter Cards, Schema.org LocalBusiness structured data
- 🔒 **Secure Contact Form** - Cloudflare Turnstile bot protection, rate limiting, input sanitization, email notifications

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
# Run Vitest unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run Playwright E2E tests
npm run test:e2e

# Run Playwright tests with UI mode (interactive)
npm run test:e2e:ui

# Type check the project
npm run type-check

# Lint the project
npm run lint
```

## Project Structure
```
wiens-woodworking/
├── .github/workflows/        # CI pipelines
│   ├── ci.yml                # Lint, type-check, unit & E2E tests
│   └── lighthouse.yml        # Lighthouse CI (manual trigger)
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout & metadata
│   ├── global-error.tsx      # Error boundary
│   ├── globals.css           # Global styles
│   ├── gallery/page.tsx      # Photo gallery page
│   ├── tools/
│   │   ├── page.tsx          # Tools listing page
│   │   ├── dovetail-calculator/page.tsx
│   │   ├── fractional-calculator/page.tsx
│   │   ├── board-feet-calculator/page.tsx
│   │   ├── cut-list-optimizer/page.tsx
│   │   └── trig-calculator/page.tsx
│   ├── api/contact/route.ts  # Contact form API
│   ├── sitemap.ts            # Dynamic sitemap
│   └── robots.ts             # Robots.txt
├── components/               # React components
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── AnimatedTagline.tsx
│   ├── Featured.tsx
│   ├── About.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   ├── ContactForm.tsx
│   ├── Gallery.tsx
│   ├── GalleryWrapper.tsx
│   ├── ToolCard.tsx
│   ├── DovetailVisualizer/   # Dovetail & box joint calculator
│   ├── FractionalCalculator/ # Fractional calculator component
│   ├── BoardFeetCalculator/  # Multi-entry board feet calculator
│   ├── CutListOptimizer/     # Cut list optimizer (9 algorithms)
│   ├── TrigCalculator/       # Right triangle solver
│   ├── UnitToggle.tsx        # Imperial/metric unit toggle
│   ├── ErrorBoundary.tsx
│   ├── ServiceWorkerRegistration.tsx
│   ├── Footer.tsx
│   └── index.ts              # Barrel exports
├── tests/                    # Playwright E2E tests
├── public/
│   ├── images/gallery/       # Project photos (35+ images)
│   ├── sw.js                 # Service worker
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

- **TypeScript 6** - Type safety, interfaces, and modern JavaScript patterns
- **Next.js 16** - App Router, Server Components vs Client Components, file-based routing
- **React 19** - Latest React features and hooks
- **Modern image optimization** - Next.js Image component, quality settings, responsive sizing
- **Tailwind CSS v4** - Utility-first approach, responsive design, custom styling
- **E2E Testing** - Playwright test suite for critical user flows
- **Unit Testing** - Vitest for pure utility functions
- **CI/CD** - GitHub Actions for automated quality gates
- **Production monitoring** - Sentry error tracking, Vercel Analytics

## Key Technical Decisions

### Server Components by Default
Most components are Server Components for optimal performance. Only the Gallery uses `'use client'` for interactive lightbox functionality.

### Image Optimization Strategy
- Gallery thumbnails: 75% quality, responsive sizes
- Lightbox images: 95% quality, fills viewport with `object-contain`
- Cached indefinitely with content-based hashing

### Barrel Exports
Components use barrel exports (`components/index.ts`) for cleaner imports throughout the application.

## Production Readiness

### Monitoring & Observability
- **Error Tracking:** Sentry for client and server-side error monitoring
- **Analytics:** Vercel Analytics for page views and user insights
- **Performance:** Vercel Speed Insights tracking Core Web Vitals

### Quality Assurance
- **E2E Testing:** Playwright test suite covering gallery, contact form, and all 5 calculator tools
- **Unit Testing:** Vitest tests for calculator utilities (172 tests: dovetail: 22, fractional: 53, board feet: 22, cut list: 41, trig: 34)
- **CI:** GitHub Actions runs lint, type-check, unit tests, and E2E tests on every push and PR
- **Type Safety:** Strict TypeScript configuration with `tsc --noEmit` checks

### Security
- **Bot Protection:** Cloudflare Turnstile on contact form
- **Rate Limiting:** Contact form limited to 3 requests/minute per IP
- **Input Sanitization:** HTML escaping on all contact form fields
- **HTTPS:** Enforced via Vercel
- **Security Headers:** CSP, X-Frame-Options, etc.

### Continuous Integration/Deployment
- **CI:** GitHub Actions (lint, type-check, Vitest, Playwright) on every push/PR
- **CD:** Automatic deployment via Vercel on push to `main`
- **Preview Deployments:** Every PR gets a unique preview URL
- **Zero Downtime:** Atomic deployments with instant rollback capability

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
