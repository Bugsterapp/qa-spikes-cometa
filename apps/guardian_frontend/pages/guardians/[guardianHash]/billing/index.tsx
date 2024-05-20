import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { Box } from '@mui/material';
import Navbar from '~/components/Navbar';
import BillingOptionView from '~/components/organisms/guardians/views/BillingOptionView';
import { useEffect } from 'react';
import { sendPageViewedEvent } from '~/utils/events';
import { Session } from 'next-auth';
import { GetServerSideProps } from 'next';

function BillingPage({ session }: { session: Session }) {
  useEffect(() => {
    sendPageViewedEvent('Datos de facturación');
  }, []);

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Head>
        <title>Facturación</title>
      </Head>
      <Box top={0} position="sticky" zIndex={999}>
        <Navbar />
      </Box>
      <BillingOptionView session={session} />
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    session: await getSession(context),
  },
});

BillingPage.auth = true;
export default BillingPage;
