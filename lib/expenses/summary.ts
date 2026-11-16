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
  /** Null or absent when the expense isn't tied to a project. */
  projectNumber?: string | null;
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
  /** What each project cost this year, in project-number order. Empty when none are tagged. */
  projects: ProjectTotal[];
  /** Everything not tied to a project. */
  unassigned: Totals;
}

export interface ProjectTotal extends Totals {
  projectNumber: string;
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
  const byProject = new Map<string, Totals>();
  const unassigned = empty();

  for (const e of expenses) {
    if (!e.expenseDate.startsWith(prefix)) continue;
    add(overall, e);
    if (e.projectNumber) {
      if (!byProject.has(e.projectNumber)) byProject.set(e.projectNumber, empty());
      add(byProject.get(e.projectNumber)!, e);
    } else {
      add(unassigned, e);
    }
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

  // Numeric-aware, so project 9 sorts before project 10
  const projects = [...byProject.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'en-CA', { numeric: true, sensitivity: 'base' }))
    .map(([projectNumber, totals]) => ({ projectNumber, ...totals }));

  return { year, ...overall, months, sections: sections.filter(s => s.count > 0), projects, unassigned };
}
