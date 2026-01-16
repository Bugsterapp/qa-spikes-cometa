import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';

import { authOptions } from '../../server/auth';
import { PATH_PORTAL } from '/src/routes/paths';
import { sendPageViewedEvent } from '/src/utils/events';
import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  sendPageViewedEvent('Reset Password');

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  return (
    <AuthLayout
      title={isSuccess ? 'Correo de recuperación enviado' : '¿Olvidaste tu contraseña?'}
      subtitle={
        isSuccess
          ? 'Si tu correo está registrado, te llegará un mensaje para restablecer tu contraseña. No olvides también revisar tu bandeja de spam.'
          : 'Ingresa el correo de tu cuenta y te enviaremos las instrucciones para restablecer tu contraseña.'
      }
    >
      <ResetPasswordForm onSuccess={handleSuccess} hideSuccessState={isSuccess} />
    </AuthLayout>
  );
}

const getLayout = (page: JSX.Element) => (
  <>
    <Head>
      <title>Restablecer Contraseña | Cometa</title>
      <style>{`
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

ResetPasswordPage.auth = false;
ResetPasswordPage.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
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

export default ResetPasswordPage;
