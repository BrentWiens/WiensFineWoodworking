import { CATEGORIES, SECTIONS, getCategory, type ExpenseSection } from './categories';

/**
 * Year-end expense totals, by category and by T2125 section.
 *
 * Amounts are integer cents. "Net" is the total less HST: once HST-registered,
 * the HST comes back as an input tax credit, so only the net is the expense.
 */

export interface SummaryExpense {
  expenseDate: string;
  category: string;
  totalCents: number;
  hstCents: number;
}

export interface Totals {
  count: number;
  totalCents: number;
  hstCents: number;
  netCents: number;
}

export interface CategoryTotal extends Totals {
  id: string;
  label: string;
  line: string;
}

export interface SectionTotal extends Totals {
  id: ExpenseSection | 'retired';
  label: string;
  note?: string;
  categories: CategoryTotal[];
}

export interface ExpenseSummary extends Totals {
  year: number;
  months: (Totals & { month: number })[];
  /** Only sections and categories that have expenses, in T2125 order. */
  sections: SectionTotal[];
}

const empty = (): Totals => ({ count: 0, totalCents: 0, hstCents: 0, netCents: 0 });

function add(into: Totals, e: SummaryExpense): void {
  into.count += 1;
  into.totalCents += e.totalCents;
  into.hstCents += e.hstCents;
  into.netCents += e.totalCents - e.hstCents;
}

export function summarizeExpenses(year: number, expenses: SummaryExpense[]): ExpenseSummary {
  const prefix = `${year}-`;
  const overall = empty();
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ...empty() }));
  const byCategory = new Map<string, Totals>();

  for (const e of expenses) {
    if (!e.expenseDate.startsWith(prefix)) continue;
    add(overall, e);
    add(months[Number(e.expenseDate.slice(5, 7)) - 1], e);
    if (!byCategory.has(e.category)) byCategory.set(e.category, empty());
    add(byCategory.get(e.category)!, e);
  }

  const sections: SectionTotal[] = SECTIONS.map(section => ({
    ...section,
    ...empty(),
    categories: CATEGORIES.filter(c => c.section === section.id && byCategory.has(c.id)).map(c => ({
      id: c.id,
      label: c.label,
      line: c.line,
      ...byCategory.get(c.id)!,
    })),
  }));

  // A category id that's no longer in the list still has to be counted somewhere.
  const retired = [...byCategory.keys()].filter(id => !getCategory(id));
  if (retired.length > 0) {
    sections.push({
      id: 'retired',
      label: 'Uncategorized',
      note: 'These use a category that no longer exists. Edit them to pick a current one.',
      ...empty(),
      categories: retired.map(id => ({ id, label: id, line: '', ...byCategory.get(id)! })),
    });
  }

  for (const section of sections) {
    for (const c of section.categories) {
      section.count += c.count;
      section.totalCents += c.totalCents;
      section.hstCents += c.hstCents;
      section.netCents += c.netCents;
    }
  }

  return { year, ...overall, months, sections: sections.filter(s => s.count > 0) };
}
