import * as Sentry from '@sentry/nextjs';
import type { GetServerSidePropsContext } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions, type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { AUTH_ERRORS, AUTH_CONFIG } from '../constants/auth';
import { ServiceClient, ServiceClientAuth } from '../utils/api';

const calculateAccessTokenExpiry = (expiresInSeconds?: number): number => {
  const seconds = expiresInSeconds ?? AUTH_CONFIG.DEFAULT_ACCESS_TOKEN_EXPIRY_SECONDS;
  return Date.now() + (seconds - AUTH_CONFIG.TOKEN_EXPIRY_OFFSET_SECONDS) * 1000;
};

const calculateRefreshTokenExpiry = (refreshExpiresInSeconds?: number): number => {
  const seconds = refreshExpiresInSeconds ?? AUTH_CONFIG.DEFAULT_REFRESH_TOKEN_EXPIRY_SECONDS;
  return Date.now() + (seconds - AUTH_CONFIG.TOKEN_EXPIRY_OFFSET_SECONDS) * 1000;
};

const calculateSessionExpiry = (remember: boolean | undefined, refreshExpiresInSeconds?: number): number => {
  if (remember) {
    return calculateRefreshTokenExpiry(refreshExpiresInSeconds);
  }
  return Date.now() + AUTH_CONFIG.SESSION_DURATION_WITHOUT_REMEMBER_SECONDS * 1000;
};

const isTokenExpired = (expiryTimestamp: number): boolean => Date.now() >= expiryTimestamp;

const getTokenExpirationStatus = (token: JWT): 'valid' | 'access_expired' | 'session_expired' => {
  const accessTokenExpired = isTokenExpired(token.expires_in as number);

  const sessionExpired = token.remember
    ? token.refresh_expires_in && isTokenExpired(token.refresh_expires_in as number)
    : token.session_expires_in && isTokenExpired(token.session_expires_in as number);

  if (sessionExpired) {
    return 'session_expired';
  }

  if (accessTokenExpired) {
    return 'access_expired';
  }

  return 'valid';
};

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      is_staff: boolean;
      first_name: string;
      last_name: string;
      date_joined: string;
      id: string;
    } & DefaultSession['user'];
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    session_expires_in?: number; // Used when remember=false
    error?: string;
    is_legacy_auth?: boolean;
  }

  interface User {
    token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    remember?: boolean;
    user?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      name: string;
      is_staff: boolean;
      date_joined: string;
    };
    trace_context?: Record<string, string>;
  }
}

const handleAuthError = (e: any) => {
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
  } else {
    Sentry.captureException(e);
    throw new Error('En este momento no se puede ingresar');
  }
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const useNewAuth = shouldUseNewAuth();

    if (useNewAuth) {
      const response = await ServiceClientAuth.refreshTokenApiV1AuthRefreshPost({
        refresh_token: token.refresh_token as string,
      });

      const refreshedTokens = response.data;

      return {
        ...token,
        access_token: refreshedTokens.access_token,
        expires_in: calculateAccessTokenExpiry(refreshedTokens.expires_in),
        refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
        refresh_expires_in: calculateRefreshTokenExpiry(refreshedTokens.refresh_expires_in),
        session_expires_in: token.session_expires_in,
      };
    } else {
      throw new Error('Legacy auth refresh not implemented');
    }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return {
        ...token,
        error: AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
      };
    }
    return {
      ...token,
      error: AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
    };
  }
}

const createAuthOptions = (
  authenticateMethod: (credentials: { email: string; password: string }) => Promise<any>
): NextAuthOptions => ({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'mail@example.com' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese su correo y contraseña');
        }
        try {
          const result = await authenticateMethod({
            email: credentials.email,
            password: credentials.password,
          });

          if (result.status === 200) {
            return {
              ...result.data,
              remember: credentials.remember === 'true',
            };
          }
          return null;
        } catch (e: unknown) {
          return handleAuthError(e);
        }
      },
    }),
  ],
  events: {
    signIn({ user }) {
      Sentry.setUser({ id: user.id });
    },
    async signOut({ token }) {
      Sentry.setUser(null);
      const isLegacyAuth = !shouldUseNewAuth();
      if (token?.refresh_token && isLegacyAuth) {
        try {
          await ServiceClientAuth.logoutApiV1AuthLogoutPost({
            refresh_token: token.refresh_token as string,
          });
        } catch (error) {
          Sentry.captureException(error);
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.NEXT_PUBLIC_MAX_AGE_TOKEN ?? '36000'),
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          user: user.user,
          access_token: user.token,
          refresh_token: user.refresh_token,
          expires_in: calculateAccessTokenExpiry(user.expires_in),
          refresh_expires_in: calculateRefreshTokenExpiry(user.refresh_expires_in),
          session_expires_in: calculateSessionExpiry(user.remember, user.refresh_expires_in),
          remember: user.remember,
        };
      }

      const isLegacyAuth = !shouldUseNewAuth();
      if (isLegacyAuth) {
        return token;
      }

      const expirationStatus = getTokenExpirationStatus(token);

      switch (expirationStatus) {
        case 'valid':
          return token;

        case 'session_expired':
          return {
            ...token,
            error: AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
          };

        case 'access_expired':
          return await refreshAccessToken(token);

        default:
          return {
            ...token,
            error: AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
          };
      }
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error as string;
      }

      session.user = token.user as Session['user'];
      session.token = token.access_token as string;
      session.access_token = token.access_token as string;
      session.refresh_token = token.refresh_token as string;
      session.expires_in = token.expires_in as number;
      session.refresh_expires_in = token.refresh_expires_in as number;
      session.session_expires_in = token.session_expires_in as number;
      session.is_legacy_auth = !shouldUseNewAuth(); // Set legacy flag based on environment
      return session;
    },
  },
});

const legacyAuthenticate = async ({ email, password }: { email: string; password: string }) =>
  ServiceClient.apiV1UsersAuthCreate({
    username: email,
    password: password,
  });

const newAuthenticate = async ({ email, password }: { email: string; password: string }) =>
  ServiceClientAuth.authenticateWithLegacyMigrationApiV1AuthLoginPost({
    username: email,
    password: password,
  });

export const authOptionsLegacy: NextAuthOptions = createAuthOptions(legacyAuthenticate);
export const authOptionsNew: NextAuthOptions = createAuthOptions(newAuthenticate);

const shouldUseNewAuth = () => process.env.USE_LEGACY_AUTH !== 'true';

export const getAuthOptions = (): NextAuthOptions => (shouldUseNewAuth() ? authOptionsNew : authOptionsLegacy);

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  const authOptions = getAuthOptions();
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const authOptions = getAuthOptions();
