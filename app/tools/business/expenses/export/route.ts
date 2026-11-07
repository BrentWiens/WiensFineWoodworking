import type { NextRequest } from 'next/server';
import { parseYearParam } from '@/lib/dates';
import { expensesCsv } from '@/lib/expenses/csv';
import { listExpensesChronological } from '@/lib/expenses/data';
import { summarizeExpenses } from '@/lib/expenses/summary';

/** The year's expenses as CSV. The data functions verify the session. */
export async function GET(request: NextRequest) {
  const year = parseYearParam(request.nextUrl.searchParams.get('year') ?? undefined);
  const expenses = await listExpensesChronological(year);
  const csv = expensesCsv(expenses, summarizeExpenses(year, expenses));

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="expenses-${year}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
