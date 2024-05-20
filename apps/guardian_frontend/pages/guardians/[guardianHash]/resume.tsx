import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { Box, Container } from '@mui/material';
import { useEffect } from 'react';
import ResumeCardList from '~/components/organisms/guardians/ResumeCardList';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { useRouter } from 'next/router';
import { PayButton } from '~/components/PayButton';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { useSelectionStore } from '@cometa/hooks';

function Resume({ session, guardianHash }: { session: Session; guardianHash: string }) {
  const { dependents = [] } = session.user;
  const router = useRouter();
  const { selectedItems: selectedItems, totalToPay } = useSelectionStore();
  const itemsQuantity = selectedItems?.length;
  const currency = selectedItems[0]?.currency || 'MXN';
  useEffect(() => {
    if (!itemsQuantity) router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity]);

  useEffect(() => {
    router.prefetch(`/guardians/${guardianHash}/payments`);
  }, [router, guardianHash]);

  useSendPageViewedEvent('Resumen');

  const handlerBackButton = () => {
    router.push(`/guardians/${guardianHash}`);
  };

  const handleContinue = () => {
    router.push(`/guardians/${guardianHash}/payments`);
  };

  return (
    <>
      <Head>
        <title>Resumen</title>
      </Head>
      <Container maxWidth="sm" disableGutters>
        <TitleBackButton title="Resumen" onClick={handlerBackButton} />
        <Box py={2.25}>
          <Box mx={2.75}>
            <ResumeCardList selectedItems={selectedItems} dependents={dependents} isVerify />
          </Box>
          {Boolean(itemsQuantity) && (
            <Box my={18}>
              <PayButton
                priceTotal={totalToPay}
                itemsQuantity={itemsQuantity}
                currency={currency}
                onClick={handleContinue}
                buttonText="PAGAR"
              />
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guardianHash } = context?.query || { guardianHash: '' };

  return {
    props: {
      session: await getSession(context),
      guardianHash,
    },
  };
};

Resume.auth = true;
export default Resume;
