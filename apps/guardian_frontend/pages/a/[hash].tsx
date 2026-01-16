import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { ServiceClient } from '~/utils/api';

function Index({ deeplink }: { deeplink: string }) {
  useEffect(() => {
    window.location.href = deeplink;
  }, []);

  return (
    <>
      <Head>
        <title>Cometa</title>
      </Head>
      <div className="flex h-screen items-center justify-center bg-blue-500">
        <div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-t-4 border-white border-t-transparent" />
            <p className="text-2xl text-white">Redireccionando...</p>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

  try {
    const { hash } = context?.query || { hash: '' };
    const res = (await ServiceClient.apiV1AppShortUrlsList(
      {
        hash: hash as string,
      },
      {
        headers: {
          secret: SECRET,
        },
      }
    )) as any;

    const searchParams = new URLSearchParams(res.data.redirect_url.split('?')[1]);
    const token = searchParams.get('token');

    // Determine the base scheme based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseScheme = isDevelopment
      ? 'exp://127.0.0.1:8081/--/' // Expo Go scheme for local development
      : `${process.env.APP_SCHEME}://`; // Production scheme

    const deeplink = `${baseScheme}auth/login?token=${token}`;

    return {
      props: {
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
