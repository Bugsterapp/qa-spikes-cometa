// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import * as FullStory from '@fullstory/browser';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

FullStory.init({ orgId: process.env.NEXT_PUBLIC_FULLSTORY_ORG_ID });

Sentry.init({
  dsn: SENTRY_DSN || 'https://1bf2d63e743c45fb95e7c1d3339973a8@o1300599.ingest.sentry.io/6537093',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  integrations: [new Sentry.Replay()],
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  // enabled: process.env.NODE_ENV !== 'development',
});
