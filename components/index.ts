// Deliberately does NOT re-export the five calculators. Every tool page imports
// its calculator directly by path, but re-exporting them here pulled that code
// into the client chunk of every page that touches this barrel — which is all of
// them. That put ~105KB of cut-list and dovetail logic on the homepage.
// Import large, page-specific components directly rather than adding them here.
export { default as Navigation } from './Navigation';
export { default as Footer } from './Footer';
export { default as Hero } from './Hero';
export { default as About } from './About';
export { default as Contact } from './Contact';
export { default as Featured } from './Featured';
export { default as Testimonials } from './Testimonials';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ServiceWorkerRegistration } from './ServiceWorkerRegistration';
export { default as ToolCard } from './ToolCard';
export { default as CommissionCta } from './CommissionCta';
export { default as SocialLinks } from './SocialLinks';