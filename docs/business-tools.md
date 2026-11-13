# Business tools

Private tools for running the business side of Wiens Fine Woodworking. They live under
`/tools/business/*`, appear on `/tools` in a "Business tools" section marked private while
testing, and require Google sign-in. Only addresses in `ALLOWED_EMAILS` can sign in.

The long-term goal is to keep all the business accounting and supporting records in one place,
built in this order: mileage → expenses → jobs and year-end reports → quotes, invoices and income.
The business is a sole proprietorship in Kitchener, Ontario, so CRA rules apply, distances are
in km, and HST registration is coming soon, so the tools are designed as if already registered.
Multi-user access isn't needed yet, though this could become a product one day.

## Status (2026-11-13)

Live on wfinew.com since 2026-11-13. Sign-in, the mileage log and the expense log have been
used against the real database, locally and in production.

**The mileage log** (`/tools/business/mileage`)
- Phone-friendly trip entry, with saved places that fill in the destination and one-way km
- Each trip records the date, from, to, business purpose and km. Odometer readings are not
  taken per trip.
- Trip edit and delete
- Year summary: odometer at the start and end of the year, then business km ÷ total km gives
  the business-use %
- CSV logbook export for the accountant
- Vehicle and saved-places settings

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
- Year summary by section and category: total paid, HST (input tax credits) and net of HST
- CSV export: one row per expense, then totals by category

**Not built yet:** receipt photos, jobs, year-end reports, quotes and invoices. See
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

   Vercel stores Production values as Sensitive, and Sensitive values can't be pulled to a
   dev machine. So each variable exists twice: the Production entry, and a separate
   Development entry that `vercel env pull` can read. That includes `DATABASE_URL`: the Neon
   integration only sets it for Production and Preview, so a Development copy was added by
   hand. Use a different `SESSION_SECRET` for Development.

   **Local development and production share one database.** Anything entered while testing
   locally is real data in the live log.
4. **Pull and migrate:** run `vercel env pull .env.local`, then `npm run db:migrate`. This
   applies every migration in `drizzle/` that hasn't run yet.

To sign out every device at once, change `SESSION_SECRET` and redeploy. To revoke one
account, remove it from `ALLOWED_EMAILS`. Existing sessions are checked against the list on
every request.

## How it fits together

| Piece | Where |
| --- | --- |
| Google sign-in (OIDC with PKCE, built by hand with `jose`; no auth library) | `lib/auth/google.ts`, `app/api/auth/google/route.ts`, `app/api/auth/google/callback/route.ts` |
| Session cookie (signed JWT, 30 days, `SameSite=Lax`, which the redirect back from Google needs) | `lib/auth/session.ts` |
| Redirect to `/login` for signed-out visitors | `proxy.ts` (matcher `/tools/business/:path*`) |
| **Real authorization**: every data function calls `verifySession()` first | `lib/auth/dal.ts`, `lib/mileage/data.ts`, `lib/expenses/data.ts` |
| Schema and migrations (Drizzle with Neon HTTP) | `lib/db/schema.ts`, `drizzle/` |
| Pure, unit-tested logic (validation, summaries, CSV, categories) | `lib/mileage/*`, `lib/expenses/*` |
| Shared helpers: form parsing, money (cents, HST), dates, CSV | `lib/validation.ts`, `lib/money.ts`, `lib/dates.ts`, `lib/csv.ts` |
| Pages and Server Actions | `app/tools/business/` |
| Shared components: forms (submitting without React's automatic form reset), tabs, year picker | `components/business/` |

These rules matter when adding more tools:
- **Keep everything private under `/tools/business/`.** The proxy matcher, `robots.ts`, the
  `X-Robots-Tag` header in `next.config.ts`, and `public/sw.js` all key off that prefix. The
  service worker must never cache these pages.
- **Never query the database from a page or action directly.** Go through a data module whose
  functions call `verifySession()`.
- **Dates are `YYYY-MM-DD` strings** in Toronto time (`lib/dates.ts`). Distances are km to
  1 decimal place. **Money must be integer cents** (`lib/money.ts` converts at the edges).
- **Expense category ids are stored in the database.** Add new categories freely, but never
  rename an id. The summary lists any expense with an unknown id under "Uncategorized" so it
  isn't lost.
- **Changing the schema:** edit `lib/db/schema.ts`, run `npm run db:generate`, then
  `npm run db:migrate`.

## Next steps

1. Have the accountant look over the expense categories and line numbers.
2. **Receipt photos:** stored in Vercel Blob and shrunk on the phone before upload. Receipts
   are private records, so decide first whether a public-but-unguessable blob URL is acceptable
   or the photos must be served through an authenticated route. This needs a Blob store
   connected in Vercel (`BLOB_READ_WRITE_TOKEN`) and the Blob host added to the CSP's `img-src`.
3. **Year-end archive:** records must be kept 6 years, and Neon's free plan only restores
   recent history.
4. **Jobs and reports:** a `jobs` table that trips, expenses and invoices can all link to; the
   vehicle claim (business % × the year's vehicle expenses, which already carry their
   `vehicle_id`); CCA for tools and equipment; and a T2125 summary.
5. **Quotes, invoices and income:** moved over from the separate tool used today, with HST
   charged on invoices.
