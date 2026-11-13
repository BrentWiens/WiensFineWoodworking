import { toCsv, type CsvCell } from '../csv';
import { centsToInput } from '../money';
import { categoryLabel, getCategory } from './categories';
import type { ExpenseSummary } from './summary';

export interface CsvExpense {
  expenseDate: string;
  vendor: string;
  description: string;
  category: string;
  totalCents: number;
  hstCents: number;
}

/** Amounts as plain "1234.50", which spreadsheets read as numbers. */
const dollars = (cents: number) => centsToInput(cents);

/** The year's expenses for the accountant: one row per expense, then totals by category. */
export function expensesCsv(expenses: CsvExpense[], summary: ExpenseSummary): string {
  const rows: CsvCell[][] = [
    ['Date', 'Vendor', 'Description', 'Category', 'T2125 line', 'Total paid', 'HST', 'Net of HST'],
    ...expenses.map(e => [
      e.expenseDate,
      e.vendor,
      e.description,
      categoryLabel(e.category),
      getCategory(e.category)?.line ?? '',
      dollars(e.totalCents),
      dollars(e.hstCents),
      dollars(e.totalCents - e.hstCents),
    ]),
    [],
    [`Summary ${summary.year}`, 'Section', 'T2125 line', 'Expenses', 'Total paid', 'HST', 'Net of HST'],
    ...summary.sections.flatMap(section =>
      section.categories.map(c => [
        c.label,
        section.label,
        c.line,
        c.count,
        dollars(c.totalCents),
        dollars(c.hstCents),
        dollars(c.netCents),
      ]),
    ),
    ['All expenses', '', '', summary.count, dollars(summary.totalCents), dollars(summary.hstCents), dollars(summary.netCents)],
  ];
  return toCsv(rows);
}
