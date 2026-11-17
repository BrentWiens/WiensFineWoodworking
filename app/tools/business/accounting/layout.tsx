import type { Metadata } from 'next';
import SubNav from '@/components/business/SubNav';

export const metadata: Metadata = {
  title: 'Accounting | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

const BASE = '/tools/business/accounting';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">Accounting</h1>
      <SubNav
        links={[
          { href: BASE, label: 'Year summary' },
          { href: `${BASE}/capital`, label: 'Capital assets' },
        ]}
      />
      {children}
    </>
  );
}
