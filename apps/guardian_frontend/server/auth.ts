import type { GetServerSidePropsContext } from 'next';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import ApiClient from '../services/ApiClient';
import * as Sentry from '@sentry/nextjs';
import { addColorsToDependents } from '~/utils/colors';
import { Session } from 'next-auth/core/types';
import { BillingStudent, School } from '@cometa/trpc/src/types';
import { ServiceClient } from '~/utils/api';

const sanitizeSchools = (schools: School[]) =>
  schools.map(({ config_dashboard, name, id, preferences, does_invoice, is_provider }) => ({
    config_dashboard,
    preferences,
    name,
    does_invoice,
    id,
    is_provider,
  }));

const sanitizeStudents = (students: BillingStudent[]) =>
  students.map(({ first_name, id, billing_guardian }) => ({
    first_name,
    id,
    billing_guardian_id: billing_guardian?.id,
  }));

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        external: {},
        externalHash: {},
        magicToken: {},
      },
      async authorize(credentials) {
        try {
          if (credentials) {
            const res = credentials?.external
              ? await ApiClient.authExternal(credentials.externalHash)
              : await ApiClient.authGuardian(credentials?.magicToken);

            if (res.status !== 200) throw Error('Request failed');

            const { token, ...user } = res.data;
            user.dependents = addColorsToDependents(sanitizeStudents(user.dependents));
            return { token, user } as unknown as Session['user'];
          } else {
            throw Error('No credentials were provided');
          }
        } catch (e: any) {
          // Redirecting to the login page with error message in the URL
          if (e?.response) {
            if (e.response.status >= 500) {
              Sentry.withScope(function (scope) {
                scope.setFingerprint([
                  JSON.stringify(e.response.data),
                  JSON.stringify({ status: e.response.status }),
                  JSON.stringify({ url: e.response?.config?.url }),
                  JSON.stringify(e.response.headers),
                ]);
                Sentry.captureException(e);
              });
            }
            throw new Error(e.response.data.error);
          } else if (e?.request) {
            Sentry.captureException(e);
            throw new Error('En este momento no se puede ingresar');
          } else {
            Sentry.captureException(e);
            throw new Error('En este momento no se puede ingresar');
          }
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    // 60 * 60 * 24 * 7
    maxAge: parseInt(process.env.NEXT_PUBLIC_MAX_AGE_TOKEN as string),
  },

  callbacks: {
    // Getting the JWT token from API response
    jwt: async ({ token, user }) => Promise.resolve({ ...user, ...token }),

    session: async ({ session, token }) => {
      const res = await ServiceClient.apiV1GuardiansMeRetrieve({ headers: { token: token.token as string } });
      if (res.status === 200) {
        const user = res.data;
        user.dependents = addColorsToDependents(sanitizeStudents(user.dependents)) as any;
        user.schools = sanitizeSchools(user.schools) as any;
        session.user = user;
      }
      return Promise.resolve({ ...token, ...session });
    },
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => getServerSession(ctx.req, ctx.res, authOptions);
/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
