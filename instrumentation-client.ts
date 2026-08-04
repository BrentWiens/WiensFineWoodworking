// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Session Replay is deliberately not enabled. It pulls rrweb into the client
  // bundle (~550KB uncompressed, by far the largest chunk on the site) which is a
  // bad trade for a marketing site that has to load fast on mobile data.

  beforeSend(event) {
    // Filter out browser extension noise — "Object Not Found Matching Id" is thrown
    // by Chrome's internal Payment Handler / Autofill API, not by app code.
    const message = event.exception?.values?.[0]?.value ?? '';
    if (message.includes('Object Not Found Matching Id')) return null;
    return event;
  },

  // Sample 10% of traces. At 1.0 this exhausts the Sentry quota quickly and tells
  // us nothing that 10% of a low-traffic site doesn't already show.
  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Off: the only user data on this site is what people type into the contact
  // form, and we have no need to attach it to error reports.
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
