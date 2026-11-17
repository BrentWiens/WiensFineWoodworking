import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">Projects</h1>
      {children}
    </>
  );
}
