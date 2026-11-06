import type { Metadata } from 'next';
import SubNav from '@/components/business/SubNav';

export const metadata: Metadata = {
  title: 'Mileage Log | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

const BASE = '/tools/business/mileage';

export default function MileageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">Mileage Log</h1>
      <SubNav
        links={[
          { href: BASE, label: 'Trips' },
          { href: `${BASE}/summary`, label: 'Year summary' },
          { href: `${BASE}/settings`, label: 'Vehicle & places' },
        ]}
      />
      {children}
    </>
  );
}
