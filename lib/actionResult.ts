import type { FieldErrors } from './validation';

/** What a form's Server Action hands back to the client form. */
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string; errors?: FieldErrors };

export const firstError = (errors: FieldErrors | undefined, field: string): string | undefined =>
  errors?.[field]?.[0];
