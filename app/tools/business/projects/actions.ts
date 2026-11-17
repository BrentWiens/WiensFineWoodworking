'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import { formatCents } from '@/lib/money';
import {
  addIncome,
  createProject,
  deleteIncome,
  deleteProject,
  updateProject,
  type UpdateProjectResult,
} from '@/lib/projectTracking/data';
import { parseIncome, parseProject } from '@/lib/projectTracking/validation';
import { formToObject } from '@/lib/validation';

/**
 * Server Actions for the project tracker. Authorization happens inside
 * lib/projectTracking/data — every data function verifies the session — so these
 * only validate and route.
 */

const BASE = '/tools/business/projects';
const SAVE_FAILED: ActionResult = { ok: false, message: 'Could not save. Check your connection and try again.' };
const NUMBER_TAKEN: ActionResult = { ok: false, errors: { number: ['Another project already has that number'] } };

/** Projects feed the pickers on the trip and expense forms, so every business tool is refreshed. */
function refreshProjects() {
  revalidatePath('/tools/business', 'layout');
}

/** Runs a write, turning unexpected failures into a message while letting redirects through. */
async function attempt(write: () => Promise<void>): Promise<ActionResult | null> {
  try {
    await write();
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('Project save failed:', error);
    return SAVE_FAILED;
  }
}

function parseId(id: unknown): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseProject(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let id: number | null = null;
  const failed = await attempt(async () => {
    id = await createProject(parsed.data);
  });
  if (failed) return failed;
  if (id === null) return NUMBER_TAKEN;

  refreshProjects();
  redirect(`${BASE}/${id}`);
}

export async function updateProjectAction(id: number, formData: FormData): Promise<ActionResult> {
  const projectId = parseId(id);
  if (!projectId) return { ok: false, message: 'Unknown project.' };

  const parsed = parseProject(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let updated: UpdateProjectResult | undefined;
  const failed = await attempt(async () => {
    updated = await updateProject(projectId, parsed.data);
  });
  if (failed || !updated) return failed ?? SAVE_FAILED;
  if (!updated.ok) return updated.reason === 'duplicate' ? NUMBER_TAKEN : { ok: false, message: 'Unknown project.' };

  refreshProjects();
  return { ok: true, message: 'Project saved' };
}

/** Only succeeds for a project with no income recorded; the page hides the button otherwise. */
export async function deleteProjectAction(id: number): Promise<void> {
  const projectId = parseId(id);
  if (!projectId) return;
  const deleted = await deleteProject(projectId);
  refreshProjects();
  redirect(deleted ? BASE : `${BASE}/${projectId}`);
}

export async function addIncomeAction(projectId: number, formData: FormData): Promise<ActionResult> {
  const id = parseId(projectId);
  if (!id) return { ok: false, message: 'Unknown project.' };

  const parsed = parseIncome(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let added = false;
  const failed = await attempt(async () => {
    added = await addIncome(id, parsed.data);
  });
  if (failed) return failed;
  if (!added) return { ok: false, message: 'Unknown project.' };

  refreshProjects();
  return { ok: true, message: `Saved: ${parsed.data.description}, ${formatCents(parsed.data.totalCents)}` };
}

export async function deleteIncomeAction(id: number): Promise<void> {
  const incomeId = parseId(id);
  if (!incomeId) return;
  await deleteIncome(incomeId);
  refreshProjects();
}
