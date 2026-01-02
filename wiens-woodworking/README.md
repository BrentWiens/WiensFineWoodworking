# Wiens Fine Woodworking

A modern, responsive website for Wiens Fine Woodworking showcasing custom furniture and handcrafted wood projects.

🔗 **Live Site:** [wfinew.com](https://wfinew.com)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Image Optimization:** Next.js Image component

## Features

- 📸 **Photo Gallery** - 33+ project images with lightbox modal, keyboard navigation (arrow keys), and smooth transitions
- 🖼️ **Image Optimization** - Automatic WebP/AVIF conversion, responsive sizing, lazy loading
- 📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes
- ⚡ **Performance** - Server-side rendering, static generation, optimized images
- 🎨 **Modern UI** - Clean design with smooth animations and hover effects
- 🔍 **SEO Optimized** - Meta tags, semantic HTML, OpenGraph support for social sharing

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

## Project Structure
```
wiens-woodworking/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Homepage
│   │   ├── layout.tsx    # Root layout & metadata
│   │   ├── globals.css   # Global styles
│   │   └── favicon.ico   # Site icon
│   └── components/       # React components
│       ├── Navigation.tsx
│       ├── Hero.tsx
│       ├── Gallery.tsx
│       ├── GalleryWrapper.tsx
│       ├── About.tsx
│       ├── Contact.tsx
│       ├── Footer.tsx
│       └── index.ts      # Barrel exports
├── public/
│   ├── images/
│   │   └── gallery/      # Woodworking project photos (35 images)
│   ├── shop1.jpg
│   ├── shop2.jpg
│   └── logo.png
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
- **Next.js 15** - App Router, Server Components vs Client Components, file-based routing
- **React Hooks** - useState, useEffect for modal state and keyboard navigation
- **Modern image optimization** - Next.js Image component, quality settings, responsive sizing
- **Tailwind CSS** - Utility-first approach, responsive design, custom styling
- **Git workflow** - Proper commit messages, GitHub integration, version control

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
- 💼 [LinkedIn](https://linkedin.com/in/brentwiens) *(add your actual link)*
- 🐙 [GitHub](https://github.com/BrentWiens)

---

## License

MIT License - See [LICENSE](LICENSE) file for details