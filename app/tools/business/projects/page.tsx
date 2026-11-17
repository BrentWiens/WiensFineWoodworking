import Link from 'next/link';
import { ProjectForm } from '@/components/business/ProjectForms';
import { formatCents } from '@/lib/money';
import { projectOverview, type ProjectOverview } from '@/lib/projectTracking/data';
import { createProjectAction } from './actions';

const BASE = '/tools/business/projects';

type OverviewProject = ProjectOverview['projects'][number];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string | string[] }>;
}) {
  // ?number= prefills the form, from the "add it" links for numbers already in use
  const param = (await searchParams).number;
  const prefill = (Array.isArray(param) ? param[0] : param)?.slice(0, 50) ?? '';

  const { projects, unknownNumbers } = await projectOverview();
  const active = projects.filter(p => p.status !== 'complete');
  const complete = projects.filter(p => p.status === 'complete');

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <p className="text-stone-600">
          A project gathers the payments received for a piece of work with the expenses and trips that went into
          it, so you can see what it made. Add your first one below.
        </p>
      ) : (
        <>
          <ProjectList title="Active" projects={active} empty="No active projects." />
          {complete.length > 0 && <ProjectList title="Complete" projects={complete} />}
          <p className="text-sm text-stone-500">
            Profit is income less the project&apos;s expenses and an estimate for its driving.
          </p>
        </>
      )}

      {unknownNumbers.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          <h2 className="font-semibold mb-1">Project numbers without a project</h2>
          <p className="mb-2">
            Expenses or trips use these numbers, but no project has them yet. Add the project to see its totals.
          </p>
          <ul className="flex flex-wrap gap-2">
            {unknownNumbers.map(number => (
              <li key={number}>
                <Link
                  href={`${BASE}?number=${encodeURIComponent(number)}#add-project`}
                  className="inline-block rounded-full border border-amber-300 bg-white px-3 py-1.5 hover:bg-amber-100"
                >
                  Add {number}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="add-project" className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 scroll-mt-32">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Add a project</h2>
        {/* Keyed so following an "Add 2026-014" link refills the number */}
        <ProjectForm
          key={prefill}
          mode="create"
          action={createProjectAction}
          initial={{ number: prefill, name: '', client: '', status: 'active', notes: '' }}
        />
      </section>
    </div>
  );
}

function ProjectList({ title, projects, empty }: { title: string; projects: OverviewProject[]; empty?: string }) {
  return (
    <section aria-label={`${title} projects`}>
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 px-1">{title}</h2>
      {projects.length === 0 ? (
        <p className="text-stone-500 px-1">{empty}</p>
      ) : (
        <ul className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
          {projects.map(project => {
            const totals = project.totals;
            return (
              <li key={project.id}>
                <Link
                  href={`${BASE}/${project.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">
                      {project.number} · {project.name}
                    </p>
                    <p className="text-sm text-stone-500 truncate">
                      {project.client ? `${project.client} · ` : ''}
                      In {formatCents(totals.incomeCents)} · Out{' '}
                      {formatCents(totals.expenseCents + totals.mileageCents)}
                    </p>
                  </div>
                  <p className="text-right shrink-0">
                    <span
                      className={`font-semibold tabular-nums ${totals.profitCents < 0 ? 'text-red-700' : 'text-stone-800'}`}
                    >
                      {formatCents(totals.profitCents)}
                    </span>
                    <span className="block text-xs text-stone-500">profit</span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
