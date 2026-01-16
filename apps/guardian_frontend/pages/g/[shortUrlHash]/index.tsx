import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useEffect } from 'react';
import { ServiceClient } from '~/utils/api';

function Index({ link, deeplink }: { link: string; deeplink?: string | null }) {
  const _router = useRouter();

  useEffect(() => {
    // Prefer opening the native app (if installed). If it fails, fall back to the web link.
    if (!deeplink) {
      _router.push(link);
      return;
    }

    let didHide = false;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') didHide = true;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Attempt to open the app
    window.location.href = deeplink;

    // Fallback: if the app didn't open, send the user to the web destination
    const timeout = window.setTimeout(() => {
      if (!didHide) _router.push(link);
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [_router, deeplink, link]);

  return (
    <>
      <Head>
        <title>Cometa</title>
      </Head>
      <div className="bg-blue-600 flex h-screen items-center justify-center">
        <div>
          <div className="flex flex-col gap-1 items-center">
            <svg
              className="animate-spin h-20 w-20 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h1 className="text-2xl text-white">Redireccionando...</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

  try {
    const { shortUrlHash } = context?.query || { shortUrlHash: '' };
    const res = (await ServiceClient.apiV1GuardiansShortUrlsList(
      {
        hash: shortUrlHash as string,
      },
      {
        headers: {
          secret: SECRET,
        },
      }
    )) as unknown as { data: { redirect_url: string } };

    const link = res.data.redirect_url;

    // If this short url points to an announcements route, generate a deep link to open it in the app.
    // Example:
    //  web:  https://portal.getcometa.com/announcements/123?tab=unread
    //  app:  cometa://announcements/123?tab=unread
    let deeplink: string | null = null;
    try {
      const base = 'https://portal.getcometa.com';
      const url = new URL(link, base);

      const isAnnouncements = url.pathname === '/announcements' || url.pathname.startsWith('/announcements/');
      if (isAnnouncements) {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const baseScheme = isDevelopment
          ? 'exp://127.0.0.1:8081/--/' // Expo Go scheme for local development
          : `${process.env.APP_SCHEME}://`; // Production scheme

        const path = url.pathname.replace(/^\//, ''); // remove leading slash
        deeplink = `${baseScheme}${path}${url.search ?? ''}`;
      }
    } catch {
      deeplink = null;
    }

    return {
      props: {
        link,
        deeplink,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
export default Index;
