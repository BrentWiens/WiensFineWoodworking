import 'server-only';
import { and, desc, eq, isNotNull, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { expenses, projectIncome, projects, trips, type Expense, type Project, type ProjectIncome, type Trip } from '@/lib/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { sortProjects, totalsByProject, unknownProjectNumbers, type ProjectTotals } from './summary';
import type { IncomeInput, ProjectInput } from './validation';

/**
 * Project data access. Every exported function verifies the session first — this
 * module, not the page or the proxy, is what keeps the data private.
 */

export interface ProjectOption {
  number: string;
  name: string;
  active: boolean;
}

/**
 * Every project for the picker on a trip or expense: active ones first, then the
 * rest, newest number first in each. Complete projects are included because their
 * costs often arrive after the work is done.
 */
export async function projectOptions(): Promise<ProjectOption[]> {
  await verifySession();
  const rows = await db()
    .select({ number: projects.number, name: projects.name, status: projects.status })
    .from(projects);
  return sortProjects(rows).map(({ number, name, status }) => ({ number, name, active: status !== 'complete' }));
}

export interface ProjectOverview {
  projects: (Project & { totals: ProjectTotals })[];
  /** Numbers used on expenses or trips that no project has yet. */
  unknownNumbers: string[];
}

/**
 * Every project with its totals. The totals are summed here rather than in SQL:
 * one person's projects are a few hundred rows at most, and it keeps the arithmetic
 * in one tested place (./summary).
 */
export async function projectOverview(): Promise<ProjectOverview> {
  await verifySession();
  const [allProjects, income, taggedExpenses, taggedTrips] = await Promise.all([
    db().select().from(projects),
    db()
      .select({ projectId: projectIncome.projectId, totalCents: projectIncome.totalCents, hstCents: projectIncome.hstCents })
      .from(projectIncome),
    db()
      .select({
        projectNumber: expenses.projectNumber,
        expenseDate: expenses.expenseDate,
        category: expenses.category,
        totalCents: expenses.totalCents,
        hstCents: expenses.hstCents,
      })
      .from(expenses)
      .where(isNotNull(expenses.projectNumber)),
    db()
      .select({ projectNumber: trips.projectNumber, distanceKm: trips.distanceKm })
      .from(trips)
      .where(isNotNull(trips.projectNumber)),
  ]);

  const totals = totalsByProject(allProjects, income, taggedExpenses, taggedTrips);
  return {
    projects: sortProjects(allProjects).map(project => ({ ...project, totals: totals.get(project.id)! })),
    unknownNumbers: unknownProjectNumbers(allProjects, [...taggedExpenses, ...taggedTrips]),
  };
}

export interface ProjectDetail {
  project: Project;
  income: ProjectIncome[];
  expenses: Expense[];
  trips: Trip[];
}

/** One project with everything logged against it, newest first. */
export async function getProjectDetail(id: number): Promise<ProjectDetail | null> {
  await verifySession();
  const [project] = await db().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;

  const [income, projectExpenses, projectTrips] = await Promise.all([
    db()
      .select()
      .from(projectIncome)
      .where(eq(projectIncome.projectId, id))
      .orderBy(desc(projectIncome.incomeDate), desc(projectIncome.id)),
    db()
      .select()
      .from(expenses)
      .where(eq(expenses.projectNumber, project.number))
      .orderBy(desc(expenses.expenseDate), desc(expenses.id)),
    db()
      .select()
      .from(trips)
      .where(eq(trips.projectNumber, project.number))
      .orderBy(desc(trips.tripDate), desc(trips.id)),
  ]);
  return { project, income, expenses: projectExpenses, trips: projectTrips };
}

/** Returns the new project's id, or null when that number is already taken. */
export async function createProject(input: ProjectInput): Promise<number | null> {
  await verifySession();
  const inserted = await db()
    .insert(projects)
    .values(input)
    .onConflictDoNothing({ target: projects.number })
    .returning({ id: projects.id });
  return inserted[0]?.id ?? null;
}

export type UpdateProjectResult = { ok: true } | { ok: false; reason: 'duplicate' | 'missing' };

/**
 * Saves a project's details. Expenses and trips point at a project by its number,
 * so a changed number is rewritten on them in the same transaction — otherwise
 * they would drop off the project.
 */
export async function updateProject(id: number, input: ProjectInput): Promise<UpdateProjectResult> {
  await verifySession();
  const [current] = await db().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!current) return { ok: false, reason: 'missing' };

  const [clash] = await db()
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.number, input.number), ne(projects.id, id)))
    .limit(1);
  if (clash) return { ok: false, reason: 'duplicate' };

  const saveProject = db().update(projects).set(input).where(eq(projects.id, id));
  if (current.number === input.number) {
    await saveProject;
    return { ok: true };
  }

  await db().batch([
    saveProject,
    db().update(expenses).set({ projectNumber: input.number }).where(eq(expenses.projectNumber, current.number)),
    db().update(trips).set({ projectNumber: input.number }).where(eq(trips.projectNumber, current.number)),
  ]);
  return { ok: true };
}

/**
 * Deletes a project that has no income recorded; returns false when it has some.
 * Its expenses and trips are kept, and stop being tied to any project.
 */
export async function deleteProject(id: number): Promise<boolean> {
  await verifySession();
  const [project] = await db().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return true;

  const [payment] = await db()
    .select({ id: projectIncome.id })
    .from(projectIncome)
    .where(eq(projectIncome.projectId, id))
    .limit(1);
  if (payment) return false;

  await db().batch([
    db().update(expenses).set({ projectNumber: null }).where(eq(expenses.projectNumber, project.number)),
    db().update(trips).set({ projectNumber: null }).where(eq(trips.projectNumber, project.number)),
    db().delete(projects).where(eq(projects.id, id)),
  ]);
  return true;
}

// --- Income ----------------------------------------------------------------

/** Returns false when the project doesn't exist. */
export async function addIncome(projectId: number, input: IncomeInput): Promise<boolean> {
  await verifySession();
  const [project] = await db().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return false;
  await db().insert(projectIncome).values({ ...input, projectId });
  return true;
}

export async function deleteIncome(id: number): Promise<void> {
  await verifySession();
  await db().delete(projectIncome).where(eq(projectIncome.id, id));
}
