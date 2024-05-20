import { NextResponse } from 'next/server';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { URLPatternResult } from 'urlpattern-polyfill/dist/types';
const PATTERNS = [
  [
    new URLPattern({ pathname: '/guardians/:guardianHash/:route?' }),
    ({ pathname }: URLPatternResult) => pathname.groups,
  ],
] as const;

const params = (url: string): Record<string, string> => {
  const input = url.split('?')[0];
  let result = {};

  for (const [pattern, handler] of PATTERNS) {
    const patternResult = pattern.exec(input);
    if (patternResult !== null && 'pathname' in patternResult) {
      result = handler(patternResult);
      break;
    }
  }
  return result;
};

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { guardianHash } = params(req.nextUrl.href);
    const url = req.nextUrl.clone();
    const isExternal = url.pathname.includes('external-auth');
    const user = req.nextauth.token?.user;

    if (user && guardianHash) {
      const externalUser = isExternal && user.external_id !== guardianHash;
      const internalUser = !isExternal && user.hash && guardianHash !== user.hash;

      if ((externalUser || internalUser) && !url.pathname.endsWith('/wrong_hash')) {
        url.pathname = `/guardians/${guardianHash}/wrong_hash`;
        return NextResponse.redirect(url);
      }
      // already logged in and in login page, redirect home
      if (url.pathname.includes('/login')) {
        url.pathname = `/guardians/${guardianHash}`;
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized() {
        /**
         * FIXME: nasty workaround due to current magicLink implementation, should refactor in the future
         * @see: https://next-auth.js.org/configuration/nextjs#callbacks
         */
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/guardians/:path*'],
};
