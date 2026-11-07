import type { Metadata } from 'next';
import SubNav from '@/components/business/SubNav';

export const metadata: Metadata = {
  title: 'Expenses | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

const BASE = '/tools/business/expenses';

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">Expenses</h1>
      <SubNav
        links={[
          { href: BASE, label: 'Expenses' },
          { href: `${BASE}/summary`, label: 'Year summary' },
        ]}
      />
      {children}
    </>
  );
}
