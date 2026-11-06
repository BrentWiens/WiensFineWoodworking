# Business tools

Private tools for running the business side of Wiens Fine Woodworking. They live under
`/tools/business/*`, appear on `/tools` in a "Business tools" section marked private while
testing, and require Google sign-in. Only addresses in `ALLOWED_EMAILS` can sign in.

The long-term goal is to keep all the business accounting and supporting records in one place,
built in this order: mileage → expenses → jobs and year-end reports → quotes, invoices and income.
The business is a sole proprietorship in Kitchener, Ontario, so CRA rules apply, distances are
in km, and HST registration is coming soon, so the tools are designed as if already registered.
Multi-user access isn't needed yet, though this could become a product one day.

## Status (2026-11-06)

**Built (the mileage log):**
- Phone-friendly trip entry, with saved places that fill in the destination and one-way km
- Trip edit and delete
- Year summary: odometer at the start and end of the year, then business km ÷ total km gives
  the business-use %
- CSV logbook export for the accountant
- Vehicle and saved-places settings

**Verified:** type check, lint, unit tests, and `next build`.

**Not yet verified:** nothing has run against a real database or Google OAuth client, and the
pages haven't been checked in a browser.

## Setup

1. **Database:** in Vercel, open Storage → Marketplace → Neon and connect it to this project.
   That sets `DATABASE_URL`.
2. **Google OAuth client:** in Google Cloud Console, open APIs & Services → Credentials, create
   an OAuth client ID, and choose "Web application". Add these authorized redirect URIs:
   - `https://wfinew.com/api/auth/google/callback` (add the `www.` version too if it's served)
   - `http://localhost:3000/api/auth/google/callback`
3. **Environment variables:** set these in Vercel for Production and Development:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Set by the Neon integration |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From step 2 |
   | `ALLOWED_EMAILS` | Comma-separated list of the Google accounts allowed to sign in |
   | `SESSION_SECRET` | At least 32 random characters, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

4. **Pull and migrate:** run `vercel env pull .env.local`, then `npm run db:migrate`.

To sign out every device at once, change `SESSION_SECRET` and redeploy. To revoke one
account, remove it from `ALLOWED_EMAILS`. Existing sessions are checked against the list on
every request.

## How it fits together

| Piece | Where |
| --- | --- |
| Google sign-in (OIDC with PKCE, built by hand with `jose`; no auth library) | `lib/auth/google.ts`, `app/api/auth/google/route.ts`, `app/api/auth/google/callback/route.ts` |
| Session cookie (signed JWT, 30 days, `SameSite=Lax`, which the redirect back from Google needs) | `lib/auth/session.ts` |
| Redirect to `/login` for signed-out visitors | `proxy.ts` (matcher `/tools/business/:path*`) |
| **Real authorization**: every data function calls `verifySession()` first | `lib/auth/dal.ts`, `lib/mileage/data.ts` |
| Schema and migrations (Drizzle with Neon HTTP) | `lib/db/schema.ts`, `drizzle/` |
| Pure, unit-tested logic (validation, summary, CSV, dates) | `lib/mileage/*`, `lib/csv.ts`, `lib/dates.ts` |
| Pages and Server Actions | `app/tools/business/` |
| Shared client form helpers (submitting without React's automatic form reset) | `components/business/` |

These rules matter when adding more tools:
- **Keep everything private under `/tools/business/`.** The proxy matcher, `robots.ts`, the
  `X-Robots-Tag` header in `next.config.ts`, and `public/sw.js` all key off that prefix. The
  service worker must never cache these pages.
- **Never query the database from a page or action directly.** Go through a data module whose
  functions call `verifySession()`.
- **Dates are `YYYY-MM-DD` strings** in Toronto time (`lib/dates.ts`). Distances are km to
  1 decimal place. **Money must be integer cents.**
- **Changing the schema:** edit `lib/db/schema.ts`, run `npm run db:generate`, then
  `npm run db:migrate`.

## Next steps

1. Run the app with the env vars set and check sign-in, the redirects, and the mileage pages on
   a phone.
2. Link this document from the README.
3. **Expenses (phase 2):**
   - Categories that line up with the CRA business-income form (T2125): materials, small tools
     (deducted at once), larger tools and equipment (depreciated over several years under CCA),
     shop supplies, and vehicle categories (fuel, insurance, repairs, licence) that feed the
     vehicle claim.
   - HST paid stored separately for input tax credits.
   - Receipt photos in Vercel Blob, shrunk on the phone before upload.
   - Records must be kept 6 years, so plan a year-end archive.
4. **Jobs and reports (phase 3):** a `jobs` table that trips, expenses and invoices can all
   link to; the vehicle claim (business % × vehicle expenses); and a T2125 summary.
5. **Quotes, invoices and income (phase 4):** moved over from the separate tool used today,
   with HST charged on invoices.
