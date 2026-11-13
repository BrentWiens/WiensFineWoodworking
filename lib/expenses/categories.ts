/**
 * Expense categories, lined up with the CRA's business-income form (T2125) so the
 * year-end summary reads in the order the accountant fills the form in.
 *
 * The `id` is what's stored in the database: never rename one, only add new ones
 * (or retire one by moving its rows first). Line numbers are T2125 lines; they're a
 * guide for the accountant, who has the final say on where something belongs.
 */

export type ExpenseSection = 'cogs' | 'operating' | 'vehicle' | 'capital';

export interface ExpenseCategory {
  id: string;
  label: string;
  /** Shown under the category picker. */
  hint: string;
  section: ExpenseSection;
  /** T2125 line the total goes on. */
  line: string;
}

export const SECTIONS: { id: ExpenseSection; label: string; note?: string }[] = [
  { id: 'cogs', label: 'Cost of goods sold' },
  { id: 'operating', label: 'Business expenses' },
  {
    id: 'vehicle',
    label: 'Motor vehicle expenses',
    note: 'Only the business-use share is deductible: apply the mileage log’s business-use % (line 9281).',
  },
  {
    id: 'capital',
    label: 'Tools and equipment',
    note: 'Claimed through capital cost allowance (CCA, line 9936) rather than as an expense.',
  },
];

export const CATEGORIES: ExpenseCategory[] = [
  {
    id: 'materials',
    label: 'Materials',
    hint: 'Lumber, sheet goods, hardware and finishes that go into projects',
    section: 'cogs',
    line: '8320',
  },
  {
    id: 'shop_supplies',
    label: 'Shop supplies',
    hint: 'Sandpaper, glue, blades, bits and other consumables',
    section: 'operating',
    line: '9270',
  },
  {
    id: 'advertising',
    label: 'Advertising',
    hint: 'Website, business cards, show booths, ads',
    section: 'operating',
    line: '8521',
  },
  {
    id: 'meals',
    label: 'Meals and entertainment',
    hint: 'Only 50% is deductible; enter the full amount',
    section: 'operating',
    line: '8523',
  },
  {
    id: 'insurance',
    label: 'Business insurance',
    hint: 'Shop and liability insurance (vehicle insurance has its own category)',
    section: 'operating',
    line: '8690',
  },
  {
    id: 'office',
    label: 'Office and software',
    hint: 'Software subscriptions, website hosting, printer ink, postage',
    section: 'operating',
    line: '8810',
  },
  {
    id: 'professional_fees',
    label: 'Accounting and legal',
    hint: 'Accountant, bookkeeping, legal fees',
    section: 'operating',
    line: '8860',
  },
  {
    id: 'other',
    label: 'Other',
    hint: 'Bank and card fees, licences and memberships, delivery and anything else; say what it was in the description',
    section: 'operating',
    line: '9270',
  },
  { id: 'vehicle_fuel', label: 'Vehicle: fuel', hint: 'Gas and oil', section: 'vehicle', line: '9281' },
  { id: 'vehicle_insurance', label: 'Vehicle: insurance', hint: 'Auto insurance premiums', section: 'vehicle', line: '9281' },
  {
    id: 'vehicle_repairs',
    label: 'Vehicle: maintenance and repairs',
    hint: 'Oil changes, tires, repairs',
    section: 'vehicle',
    line: '9281',
  },
  {
    id: 'vehicle_other',
    label: 'Vehicle: other',
    hint: 'Licence and registration, car washes and other running costs',
    section: 'vehicle',
    line: '9281',
  },
  {
    id: 'small_tools',
    label: 'Small tools (under $500)',
    hint: 'Each tool under $500: written off in full the year it’s bought (CCA class 12)',
    section: 'capital',
    line: '9936',
  },
  {
    id: 'equipment',
    label: 'Tools and equipment ($500+)',
    hint: 'Machines and tools of $500 or more: written off over several years (CCA class 8)',
    section: 'capital',
    line: '9936',
  },
];

const BY_ID = new Map(CATEGORIES.map(c => [c.id, c]));

export function getCategory(id: string): ExpenseCategory | undefined {
  return BY_ID.get(id);
}

export function isCategoryId(id: string): boolean {
  return BY_ID.has(id);
}

/** Vehicle expenses are recorded against the vehicle, for the business-use % claim. */
export function isVehicleCategory(id: string): boolean {
  return BY_ID.get(id)?.section === 'vehicle';
}

/** Label for a stored category, falling back to the raw id for one that's since been retired. */
export function categoryLabel(id: string): string {
  return BY_ID.get(id)?.label ?? id;
}
