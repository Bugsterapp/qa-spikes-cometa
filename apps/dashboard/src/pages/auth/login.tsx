import { useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import { useRemoveAllFromQueue } from '/src/components/BackgroundDownload/BackgroundDownload';
import { authOptions } from '../../server/auth';
import { PATH_PORTAL } from '/src/routes/paths';
import { sendPageViewedEvent } from '/src/utils/events';
import { LoginForm } from '../../sections/auth/login';
import AuthLayout from '../../components/auth/AuthLayout';

function LoginPage() {
  const removeAllFromQueue = useRemoveAllFromQueue();
  sendPageViewedEvent('Login');

  useEffect(() => {
    removeAllFromQueue();
  }, [removeAllFromQueue]);

  return (
    <AuthLayout title="Ingresa a tu cuenta">
      <LoginForm />
    </AuthLayout>
  );
}

const getLayout = (page: JSX.Element) => (
  <>
    <Head>
      <title>Login | Cometa</title>
      <style>{`
        /* Fix password input alignment */
        input[type="password"] {
          text-align: left !important;
          padding-left: 16px !important;
        }

        /* Ensure consistent padding for all inputs */
        input[type="email"],
        input[type="text"] {
          padding-left: 16px !important;
        }
      `}</style>
    </Head>
    {page}
  </>
);

LoginPage.auth = false;

LoginPage.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const hasSchoolMembershipError = context.query.error === 'no_school_membership';

  if (session && !hasSchoolMembershipError) {
    return {
      redirect: {
        destination: PATH_PORTAL.root,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default LoginPage;
