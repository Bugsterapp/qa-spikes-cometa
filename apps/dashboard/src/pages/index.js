import { getSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';

function IndexPage() {
  return <></>;
}

export async function getServerSideProps(context) {
  try {
    const session = await getSession(context);
    if (session) {
      return {
        redirect: {
          permanent: false,
          destination: '/charge',
        },
      };
    }
    return {
      redirect: {
        permanent: false,
        destination: '/auth/login',
      },
    };
  } catch (e) {
    Sentry.captureException(e);
    throw new Error(e);
  }
}

export default IndexPage;
