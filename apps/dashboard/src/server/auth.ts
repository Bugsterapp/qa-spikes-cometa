import type { GetServerSidePropsContext } from 'next';
import { getServerSession, type NextAuthOptions, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import ApiClient from '../services/ApiClient';
import * as Sentry from '@sentry/nextjs';
/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      is_staff: string;
      first_name: string;
      last_name: string;
      date_joined: string;
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

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
        email: { label: 'Email', type: 'email', placeholder: 'mail@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese su correo y contraseña');
        }
        try {
          const result = await ApiClient.authDashboard(credentials.email, credentials.password);
          return result.status === 200 ? result.data : null;
        } catch (e: any) {
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
    maxAge: parseInt(process.env.NEXT_PUBLIC_MAX_AGE_TOKEN ?? '36000'),
  },

  callbacks: {
    jwt: async ({ token, user }) => Promise.resolve({ ...user, ...token }),
    session: async ({ session, token }) => Promise.resolve({ ...session, ...token }),
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
