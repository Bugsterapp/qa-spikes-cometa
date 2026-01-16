import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import BillingForm from '~/components/organisms/guardians/forms/BillingForm';
import Navbar from '~/components/Navbar';

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
    <div className="py-4">
      <BillingForm session={session} defaultEditing={isEditing} hrefBack={back} />
    </div>
  );
}

EditBillingPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Editar RFC</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

EditBillingPage.auth = true;
export default EditBillingPage;
