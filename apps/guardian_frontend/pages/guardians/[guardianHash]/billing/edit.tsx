import { Container } from '@mui/material';
import { Box } from '@mui/system';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import BillingForm from '~/components/organisms/guardians/forms/BillingForm';
import Navbar from '~/components/organisms/guardians/Navbar';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const { back = '', isEditing = false } = context.query;

  return {
    props: {
      session,
      back,
      isEditing,
    },
  };
}

function EditBillingPage({ session, back, isEditing }: { session: Session; back: string; isEditing: boolean }) {
  return (
    <>
      <Head>
        <title>Editar RFC</title>
      </Head>
      <Box top={0} position="sticky" zIndex={999}>
        <Navbar backButton backButtonHref={back} />
      </Box>
      <Container maxWidth="sm">
        <Box pb={4} mx={2} mt={4}>
          <BillingForm session={session} defaultEditing={isEditing} hrefBack={back} />
        </Box>
      </Container>
    </>
  );
}

EditBillingPage.auth = true;
export default EditBillingPage;
