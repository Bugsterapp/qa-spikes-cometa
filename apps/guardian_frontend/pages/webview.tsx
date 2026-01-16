import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useSetWebview, useSetSelectedSchool } from '~/stores/globalStore';
import Lottie from 'lottie-react';
import logoAnimation from 'assets/animations/logo.json';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { auth_token, redirect_url, ss } = context.query;

  if (!auth_token || typeof auth_token !== 'string' || !redirect_url || typeof redirect_url !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      authToken: auth_token,
      redirectUrl: redirect_url,
      selectedSchoolId: typeof ss === 'string' ? ss : null,
    },
  };
}

type WebviewPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function WebviewPage({ authToken, redirectUrl, selectedSchoolId }: WebviewPageProps) {
  const router = useRouter();
  const setWebview = useSetWebview();
  const setSelectedSchool = useSetSelectedSchool();

  useEffect(() => {
    setWebview(true);

    // Set selected school if provided via ss parameter
    if (selectedSchoolId) {
      setSelectedSchool(selectedSchoolId);
    }

    const attemptSignIn = async () => {
      if (authToken && redirectUrl) {
        const res = await signIn('credentials', {
          redirect: false,
          magicToken: authToken,
        });

        if (res && !res.error) {
          router.push(redirectUrl);
        } else {
          router.push('/404');
        }
      }
    };

    attemptSignIn();
  }, [authToken, redirectUrl, selectedSchoolId, router, setSelectedSchool]);

  return (
    <>
      <Head>
        <title>Cometa - Autenticando</title>
      </Head>
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex justify-center mb-8">
          <div className="w-[250px] h-[250px]">
            <Lottie animationData={logoAnimation} loop autoplay className="w-full h-full" />
          </div>
        </div>
      </div>
    </>
  );
}
