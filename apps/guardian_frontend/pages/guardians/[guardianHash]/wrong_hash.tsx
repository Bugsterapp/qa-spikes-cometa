import { getSession, signOut } from 'next-auth/react';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import Head from 'next/head';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';

function WrongHash({ session, guardianHash }: { session: Session; guardianHash: string }) {
  const _router = useRouter();
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <Head>
        <title>Otra cuenta</title>
      </Head>
      <div
        className="min-h-screen w-full"
        style={{
          background:
            'linear-gradient(179.6deg, rgba(211, 239, 255, 0.4) 0.34%, rgba(190, 189, 255, 0.4) 99.68%), #FFFFFF',
        }}
      >
        <div className="max-w-sm mx-auto px-2 flex flex-col gap-6 h-screen items-center justify-center">
          <h1 className="text-xl font-bold text-gray-900 text-center">Estás tratando de entrar a otra cuenta</h1>
          <p className="text-gray-900 text-center">
            Actualmente, tienes una sesión abierta para{' '}
            <strong>
              {session?.user?.first_name} {session?.user?.last_name}
            </strong>
            .
          </p>
          <div className="flex flex-row gap-2 justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                _router.push({
                  pathname: `/guardians/${session?.user?.hash}/`,
                  query: _router.query,
                });
              }}
            >
              Continuar con sesión actual
            </button>
            <button
              name="onboarding-3-submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                signOut({ callbackUrl: `/guardians/${guardianHash}/login` });
              }}
            >
              Cerrar sesión actual
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context?.query || { guardianHash: '' };
  return {
    props: {
      session,
      guardianHash,
    },
  };
};
WrongHash.auth = true;
export default WrongHash;
