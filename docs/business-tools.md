# Business tools

Private tools for running the business side of Wiens Fine Woodworking. They live under
`/tools/business/*`, appear on `/tools` in a "Business tools" section marked private while
testing, and require Google sign-in. Only addresses in `ALLOWED_EMAILS` can sign in.

The long-term goal is to keep all the business accounting and supporting records in one place,
built in this order: mileage → expenses → projects → year-end reports → quotes and invoices.
The business is a sole proprietorship in Kitchener, Ontario, so CRA rules apply and distances are
in km. It isn't HST-registered yet but will be once income nears the $30,000 threshold, so the
tools record the HST on every receipt and payment, and the accounting switches to counting
expenses net of HST from the registration date (`lib/accounting/rules.ts`).
Multi-user access isn't needed yet, though this could become a product one day.

## Status (2026-11-18)

Live on wfinew.com since 2026-11-13. Sign-in, the mileage log, the expense log (including
split receipts and receipt photos read by Claude), projects and accounting are all in use
against the real database, locally and in production. The 2026 projects and their invoiced
income were imported from the earlier spreadsheet.

**The mileage log** (`/tools/business/mileage`)
- Phone-friendly trip entry, with saved places that fill in the destination and one-way km
- Each trip records the date, from, to, business purpose and km. Odometer readings are not
  taken per trip.
- Trip edit and delete
- Year summary: odometer at the start and end of the year, then business km ÷ total km gives
  the business-use %
- CSV logbook export for the accountant
- Vehicle and saved-places settings. Renaming a saved place also renames it on the trips already
  logged there; changing its distance only affects future trips.

**The expense log** (`/tools/business/expenses`)
- Phone-friendly receipt entry: date, total paid, vendor (autocompletes from earlier ones),
  category, what it was for, and HST paid. A "13% of total" button works the HST out of a
  tax-included total.
- Expense edit and delete
- 12 categories grouped as on the T2125, each with its line number
  (`lib/expenses/categories.ts`):
  - Cost of goods sold: materials
  - Business expenses: shop supplies, advertising, meals and entertainment, business
    insurance, office and software, other
  - Motor vehicle expenses: fuel, maintenance and repairs, other
  - Tools and equipment: small tools under $500 (CCA class 12), larger ones (class 8)

  Rare items (accounting and legal, bank fees, memberships, delivery) go under Other, and
  vehicle insurance and licensing under Vehicle: other, with the description saying what it
  was. Line numbers are a guide; the accountant has the final say.
- Vehicle-category expenses record the vehicle they belong to, ready for the vehicle claim.
- An optional project on each expense, chosen from the projects (active ones listed first). "No project" means the
  expense isn't tied to one.
- A receipt with more than one kind of item (small tools and materials) can be split into up
  to 10 items, each with its own category, description, project and before-tax amount. The
  items must add up to the receipt before tax; its HST is shared out in proportion, to the
  cent (`lib/expenses/receipts.ts`). Each item is saved as its own expense, so every report
  works per item; items of one receipt share `expenses.receipt_group`, show as one entry in
  the list, and are edited and deleted together.
- **Receipt photos:** a photo or PDF can be attached to each receipt. Photos are shrunk on
  the phone before upload (2000 px on the long side, 80% JPEG: a few hundred KB instead of
  several MB; `lib/expenses/compressImage.ts`). Files go to a **private** Vercel Blob store
  under `receipts/<year>/<uuid>.<ext>` and are only ever served through
  `/tools/business/expenses/receipt?path=…`, which checks the session
  (`lib/expenses/receiptFiles.ts`). The path is stored on every item of the receipt
  (`expenses.receipt_path`); replacing or deleting the receipt deletes the old file.
- **Reading receipts:** when adding an expense, the chosen photo is sent to Claude
  (`claude-opus-5-5`, `lib/expenses/scan.ts`), which reads the date, vendor, total, HST and
  the items by category, and the form is filled in for checking (`lib/expenses/scanResult.ts`).
  Nothing is saved until the form is. A declined request is retried on Anthropic's default
  fallback model. On an existing expense a photo is only attached, never read over what's
  there. A photo uploaded and then abandoned (form never saved) stays in the store unlinked.
- Year summary by section and category: total paid, HST (input tax credits) and net of HST,
  plus a "By project" table once any expense has a project number
- CSV export: one row per expense, then totals by category and by project

**Projects** (`/tools/business/projects`) — built 2026-11-16
- A project has a number, a name, an optional client, notes, a status (active or complete), and
  an optional project amount: what the client pays for the whole job, HST included
  (`projects.price_cents`), set when it's agreed and editable after.
- The list shows every project with its income, expenses and profit, active ones first. Projects
  with money still owed (amount less everything paid) are flagged, with the total owed on top.
- A project's page shows the amount, what has been paid (HST included) and what is outstanding.
  Paid more than the amount is pointed out rather than hidden.
- A project's page records the payments received for it (date, amount, what it was, HST
  included) and lists the expenses and trips linked to it, each opening in its own log.
- The project's page breaks its costs down by expense category, adds a mileage estimate
  (km × `KM_RATE_CENTS`), and shows the profit.
- Expenses and trips link to a project by its **number**, stored as text
  (`expenses.project_number`, `trips.project_number`), so a trip or expense form only needs
  the project picker. Changing a project's number rewrites it on its expenses and trips.
  Payments link by id (`project_income.project_id`).
- A number used on an expense or trip that no project has is flagged on the list, with a link
  to add the project. A project can only be deleted once its payments are removed; its
  expenses and trips are kept and become unlinked.
- The trip and expense forms offer every project: active ones grouped at the top, complete ones
  below (costs often come in after a job is finished).

**Accounting** (`/tools/business/accounting`) — built 2026-11-16
- Year summary: a profit and loss for the year. Income is the payments received on projects.
  Expenses are listed by category, with meals at 50%. The vehicle line is the business-use %
  of the year's vehicle expenses and vehicle CCA once the odometer readings are in, and a
  per-km estimate until then. Tools of $500+ come in through CCA, not as an expense.
- A tax set-aside figure (30% of net income, a rule of thumb).
- HST threshold: income over the four calendar quarters ending with the current one, against
  $30,000. Clients outside Canada count. Hidden once registered.
- Capital assets: a CCA schedule per class (8 tools, 10 vehicle) showing start UCC, purchases,
  the half-year-rule limit, the amount claimed and end UCC. The amount claimed each year is
  entered by hand. Expenses in the "Tools and equipment ($500+)" category join class 8
  automatically; the vehicle and older machines are added on this page.
- **The rules live in `lib/accounting/rules.ts`**: `HST_REGISTERED_FROM` (null today; set it to
  the registration date and expenses from then on count net of HST), the per-km rate, the
  set-aside %, the threshold and the meals %. The business is not HST-registered yet, so
  every expense currently counts in full, HST included.

**Not built yet:** backup and recovery, a year-end archive, a T2125 line-by-line report, quotes
and invoices. See [Next steps](#next-steps).

## Setup

1. **Database:** in Vercel, open Storage → Marketplace → Neon and connect it to this project.
   That sets `DATABASE_URL`.
2. **Google OAuth client:** in Google Cloud Console, open APIs & Services → Credentials, create
   an OAuth client ID, and choose "Web application". Add these authorized redirect URIs:
   - `https://wfinew.com/api/auth/google/callback` (add the `www.` version too if it's served)
   - `http://localhost:3000/api/auth/google/callback`
3. **Environment variables:** set these in Vercel:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Set by the Neon integration |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From step 2 |
   | `ALLOWED_EMAILS` | Comma-separated list of the Google accounts allowed to sign in |
   | `SESSION_SECRET` | At least 32 random characters, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
   | `BLOB_STORE_ID` | Set when a **private** Blob store is connected to the project (Storage → Create → Blob → access Private; the store is `blob-wfinew`). The app signs in to it with Vercel's OIDC token, so no read-write token is needed. Connect it to **Development** as well as Production, or `vercel env pull` can't bring it down for local work; a new connection can take a minute before access works. Without it the receipt photo field is hidden. |
   | `ANTHROPIC_API_KEY` | From console.anthropic.com → API keys, for reading receipts. Without it, photos are stored but not read. |

   Vercel stores Production values as Sensitive, and Sensitive values can't be pulled to a
   dev machine. So each variable exists twice: the Production entry, and a separate
   Development entry that `vercel env pull` can read. That includes `DATABASE_URL`: the Neon
   integration only sets it for Production and Preview, so a Development copy was added by
   hand. Use a different `SESSION_SECRET` for Development.

   **Local development and production share one database.** Anything entered while testing
   locally is real data in the live log.
4. **Pull and migrate:** copy `.env.local` somewhere safe (the pull replaces the whole file),
   run `vercel env pull .env.local`, then `npm run db:migrate`. This applies every migration in
   `drizzle/` that hasn't run yet, and is safe to run again. Restart `npm run dev` after a pull:
   it only reads `.env.local` and `next.config.ts` when it starts.

To sign out every device at once, change `SESSION_SECRET` and redeploy. To revoke one
account, remove it from `ALLOWED_EMAILS`. Existing sessions are checked against the list on
every request.

## How it fits together

| Piece | Where |
| --- | --- |
| Google sign-in (OIDC with PKCE, built by hand with `jose`; no auth library) | `lib/auth/google.ts`, `app/api/auth/google/route.ts`, `app/api/auth/google/callback/route.ts` |
| Session cookie (signed JWT, 30 days, `SameSite=Lax`, which the redirect back from Google needs) | `lib/auth/session.ts` |
| Redirect to `/login` for signed-out visitors | `proxy.ts` (matcher `/tools/business/:path*`) |
| **Real authorization**: every data function calls `verifySession()` first | `lib/auth/dal.ts`, `lib/mileage/data.ts`, `lib/expenses/data.ts`, `lib/projectTracking/data.ts`, `lib/accounting/data.ts` |
| Schema and migrations (Drizzle with Neon HTTP) | `lib/db/schema.ts`, `drizzle/` |
| Receipt photos: private Blob storage and the authenticated route that serves them | `lib/expenses/receiptFiles.ts`, `lib/expenses/receiptPath.ts`, `app/tools/business/expenses/receipt/route.ts` |
| Receipt reading with Claude (the request in `scanRequest.ts`, the API call in `scan.ts`, turning the result into form values in `scanResult.ts`) | `lib/expenses/scan*.ts` |
| Pure, unit-tested logic (validation, summaries, CSV, categories) | `lib/mileage/*`, `lib/expenses/*`, `lib/projectTracking/*`, `lib/accounting/*` (the tracker; `lib/projects.ts` is the public portfolio) |
| Shared helpers: form parsing, money (cents, HST), dates, CSV | `lib/validation.ts`, `lib/money.ts`, `lib/dates.ts`, `lib/csv.ts` |
| Pages and Server Actions | `app/tools/business/` |
| Shared components: forms (submitting without React's automatic form reset), tabs, year picker | `components/business/` |

These rules matter when adding more tools:
- **Keep everything private under `/tools/business/`.** The proxy matcher, `robots.ts`, the
  `X-Robots-Tag` header in `next.config.ts`, and `public/sw.js` all key off that prefix. The
  service worker must never cache these pages.
- **Never query the database from a page or action directly.** Go through a data module whose
  functions call `verifySession()`.
- **Receipt files stay private.** Store them only through `lib/expenses/receiptFiles.ts` (private
  Blob store, `access: 'private'`) and show them only through the receipt route, which checks
  the session. Never give a receipt a public URL.
- **Dates are `YYYY-MM-DD` strings** in Toronto time (`lib/dates.ts`). Distances are km to
  1 decimal place. **Money must be integer cents** (`lib/money.ts` converts at the edges).
- **Expense category ids are stored in the database.** Add new categories freely, but never
  rename an id. The summary lists any expense with an unknown id under "Uncategorized" so it
  isn't lost.
- **Changing the schema:** edit `lib/db/schema.ts`, run `npm run db:generate`, then
  `npm run db:migrate`.

## Next steps

1. Have the accountant look over the expense categories and line numbers.
2. **Backup and recovery (to do):** the site now holds records the CRA expects kept for 6
   years: the Neon database (expenses, trips, projects, income) and the Blob store (receipt
   photos). Neon's free plan only restores recent history, and Blob has no versioning, so a
   bad migration, a mistaken delete or a lost account could lose them for good. Work out:
   scheduled off-site exports of both (e.g. a nightly `pg_dump` and a copy of new receipt
   files to storage outside Vercel), how long to keep them, how to restore from them, and a
   test restore. Also a sweep for receipt files no expense points at.
3. **Year-end archive:** a yearly export (CSV and receipt photos) to hand the accountant and
   keep with the tax records.
4. **Reports:** a T2125 summary laid out line by line for the accountant.
5. **Quotes and invoices:** moved over from the separate tool used today, with HST charged on
   invoices, and linked to projects so a paid invoice becomes the project's income.
