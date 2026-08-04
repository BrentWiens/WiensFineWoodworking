// Light, widely-shared components only.
//
// Anything re-exported here lands in the client chunk of every page that imports
// from this barrel — which is all of them. The calculators, GalleryWrapper and
// ProjectIndex are deliberately absent for that reason; import large or
// page-specific components directly by path instead.
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