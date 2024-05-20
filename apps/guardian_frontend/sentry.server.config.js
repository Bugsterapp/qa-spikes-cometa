// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { ProfilingIntegration } from "@sentry/profiling-node";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn: SENTRY_DSN || 'https://1bf2d63e743c45fb95e7c1d3339973a8@o1300599.ingest.sentry.io/6537093',
	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 0.75,
	environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
	// ...
	// Note: if you want to override the automatic release value, do not set a
	// `release` value here - use the environment variable `SENTRY_RELEASE`, so
	// that it will also get attached to your source maps
	// enabled: process.env.NODE_ENV !== 'development',
	profilesSampleRate:1,
	  integrations: [
    // Add profiling integration to list of integrations
    new ProfilingIntegration(),
  ],
});
