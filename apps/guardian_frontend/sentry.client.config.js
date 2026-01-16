// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://1bf2d63e743c45fb95e7c1d3339973a8@o1300599.ingest.sentry.io/6537093',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.5,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration(),Sentry.browserProfilingIntegration(),],
  tracePropagationTargets: [/^https:\/\/portal\.getcometa\.com\/*/],
  profilesSampleRate: 0.5,
  sampleRate: 0.5,
});
