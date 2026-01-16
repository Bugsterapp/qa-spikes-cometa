/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { httpBatchLink, httpLink, isNonJsonSerializable, loggerLink, splitLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { MutationCache, QueryCache } from '@tanstack/react-query';
import superjson from 'superjson';
import { signOut, getSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';

import { type AppRouter } from '../server/api/root';
import { PATH_AUTH } from '../routes/paths';
import { Api } from '@cometa/trpc/src/types';
import { Api as ApiAuth } from '@cometa/trpc/src/auth/types';
import { Api as ApiAnnouncements } from '@cometa/trpc/src/announcements/types';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const isAuthError = (error: unknown): boolean =>
  (error as any)?.data?.code === 'UNAUTHORIZED' ||
  (error as any)?.data?.code === -32001 ||
  (error as any)?.message?.includes('Authentication credentials were not provided');

const handleAuthErrorLogout = async () => {
  try {
    const session = await getSession();
    const isLegacyAuth = session?.is_legacy_auth;

    if (isLegacyAuth) {
      window.location.href = PATH_AUTH.login;
    } else {
      signOut({ callbackUrl: PATH_AUTH.login, redirect: true }).catch(() => {
        window.location.href = PATH_AUTH.login;
      });
    }
  } catch (error) {
    window.location.href = PATH_AUTH.login;
  }
};

const queryCache = new QueryCache({
  onError: (error, query) => {
    if (isAuthError(error)) {
      handleAuthErrorLogout();
      return;
    }

    // Log to Sentry only if explicitly enabled via meta
    if (query.meta?.logErrorToSentry === true) {
      Sentry.captureException(error, (scope) => {
        scope.setContext('query', {
          queryKey: query.queryKey,
          queryHash: query.queryHash,
        });
        if (query.meta) {
          scope.setContext('queryMeta', query.meta as Record<string, unknown>);
        }
        return scope;
      });
    }
  },
});

const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (isAuthError(error)) {
      handleAuthErrorLogout();
      return;
    }

    // Log to Sentry only if explicitly enabled via meta
    if (mutation.meta?.logErrorToSentry === true) {
      Sentry.captureException(error, (scope) => {
        scope.setContext('mutation', {
          mutationKey: mutation.options.mutationKey,
        });
        if (mutation.meta) {
          scope.setContext('mutationMeta', mutation.meta as Record<string, unknown>);
        }
        return scope;
      });
    }
  },
});

/**
 * TRPC client for App Router (with Provider component)
 */
export const trpcReact = createTRPCReact<AppRouter>();

/**
 * A set of typesafe react-query hooks for your tRPC API (Pages Router)
 */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      queryClientConfig: {
        queryCache,
        mutationCache,
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      },
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
        }),

        splitLink({
          condition: (op) => isNonJsonSerializable(op.input),
          true: httpLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: {
              serialize: (data) => data,
              deserialize: superjson.deserialize,
            },
          }),
          false: splitLink({
            condition: (op) => Boolean(op.context.skipBatch),
            true: httpLink({
              url: `${getBaseUrl()}/api/trpc`,
              transformer: superjson,
            }),
            false: httpBatchLink({
              url: `${getBaseUrl()}/api/trpc`,
              transformer: superjson,
            }),
          }),
        }),
      ],
    };
  },
  ssr: false,
  transformer: superjson,
});

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const ServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL }).api;
export const ServiceClientRoot = new Api({ baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL });
export const ServiceClientAuth = new ApiAuth({ baseUrl: process.env.NEXT_PUBLIC_AUTH_URL }).api;
export const ServiceClientAuthRoot = new ApiAuth({ baseUrl: process.env.NEXT_PUBLIC_AUTH_URL });
export const ServiceClientAnnouncements = new ApiAnnouncements({
  baseUrl: process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL,
});
