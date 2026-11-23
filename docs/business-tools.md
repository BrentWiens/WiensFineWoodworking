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

**Not built yet:** a year-end archive, a T2125 line-by-line report, quotes and invoices. See
[Next steps](#next-steps).

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

## Backups

The database and the receipt photos are copied to Google Drive every night by
`.github/workflows/backup.yml` (07:00 UTC, about 2 a.m. in Toronto), outside Vercel and Neon,
so they survive a mistake noticed days later, a lost account or either service going down.
One database is kept on purpose: losing at most a day's changes is acceptable.

```
wfinew-backups/
  database/2026-11-22/wfinew.sql      the whole database, to restore from
  database/2026-11-22/expenses.csv    one CSV per table, to open in Google Sheets
  receipts/2026/2026-11-14 Kitchener Building Supply $330.95 (<id>).jpg
```

- Database copies are kept for 30 days, plus the earliest copy of each month for 7 years.
- Receipts are only ever added. One deleted on the site stays in the backup. One uploaded but
  never saved to an expense is named "Not on an expense".
- The files are plain, not encrypted, so Drive can search and preview them. Keep the Google
  account behind 2-step verification.
- GitHub emails the account that last changed the schedule when a run fails. GitHub also
  pauses scheduled workflows in a public repo after 60 days without a commit, and emails
  before it does. Re-enable it under Actions → Backup.
- The repo is public, so anyone can read the run logs. The workflow and
  `scripts/backup-receipts.mjs` print counts only; keep it that way.
- Run it by hand any time: Actions → Backup → Run workflow.

**One-time setup** (GitHub → Settings → Secrets and variables → Actions → New repository secret):

| Secret | Value |
| --- | --- |
| `DATABASE_URL` | The Neon connection string, the same as `DATABASE_URL` in `.env.local`. The workflow switches it to Neon's direct (unpooled) host, which `pg_dump` needs. |
| `BLOB_READ_WRITE_TOKEN` | A read-write token for `blob-wfinew`. GitHub can't use Vercel's OIDC sign-in, so it needs a token: Storage → blob-wfinew → Projects → edit the connection → tick "Add a read-write token env var", then copy the token. |
| `RCLONE_CONFIG` | Google Drive access through rclone, with **its own Google client** (below): rclone's shared one is being retired during 2026. Paste the whole file that `rclone config file` points to. |

**Google client for rclone** (once, in [Google Cloud Console](https://console.cloud.google.com)):

1. Create a project (e.g. "wfinew-backups"), then APIs & Services → Library → enable the
   **Google Drive API**.
2. Google Auth Platform (OAuth consent screen): app name and your email, audience
   **External**. Under Data access, add only the scope `.../auth/drive.file`. It's a
   non-sensitive scope, so the app needs no Google review.
3. Audience → **Publish app** (status "In production"). Left in Testing, Google expires the
   sign-in after 7 days and the backup stops. If Publish is greyed out, add a home page
   (`https://wfinew.com`) and privacy policy URL under Branding first.
4. Clients → Create client → **Desktop app**. Copy the client ID and secret.
5. Point rclone at it and sign in again (choose the same Google account):
   `rclone config update gdrive client_id=<id> client_secret=<secret> scope=drive.file`, then
   `rclone config reconnect gdrive:`.
6. Paste the updated rclone config file into the `RCLONE_CONFIG` secret.

`drive.file` limits rclone to the files that **this Google client** created, so it can't see
the rest of the Drive. That also means a new client can't see a `wfinew-backups` folder an
earlier client made, and would create a second one beside it: when changing clients, rename or
delete the old folder, then run the backup to start a complete new one.

**Restoring**

- One record or receipt: open the CSV or the receipt in Drive.
- The whole database: install the Postgres 18 client, download a `wfinew.sql`, and run
  `psql "<connection string>" -f wfinew.sql` against an **empty** database (a new Neon
  project or branch). Then point `DATABASE_URL` in Vercel at it and redeploy.
- Receipts: upload the files back to the Blob store under `receipts/<year>/<id>.<ext>` (the
  id in brackets in each file name), e.g. with `vercel blob put`.

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
2. **Restore check:** once the nightly backup has run, restore one `wfinew.sql` into a
   temporary Neon branch and compare row counts with the live database, to prove it rebuilds.
   Also, eventually, a sweep that deletes receipt files no expense points at from the store.
3. **Year-end archive:** a yearly export (CSV and receipt photos) to hand the accountant and
   keep with the tax records.
4. **Reports:** a T2125 summary laid out line by line for the accountant.
5. **Quotes and invoices:** moved over from the separate tool used today, with HST charged on
   invoices, and linked to projects so a paid invoice becomes the project's income.
