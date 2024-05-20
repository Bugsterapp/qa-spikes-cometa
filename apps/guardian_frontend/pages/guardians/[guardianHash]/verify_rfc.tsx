import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import ResumeCardList from '~/components/organisms/guardians/ResumeCardList';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { useRouter } from 'next/router';
import { PayButton } from '~/components/PayButton';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { NextPageContext } from 'next';
import { useSelectionStore } from '@cometa/hooks';
import { BillingStudent, DashboardDependentFulfillment } from '@cometa/trpc/src/types';
import { addColorsToDependents, Color } from '~/utils/colors';
import Tour from '~/components/atoms/common/Tour';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import { SET_RFC_INVOICE_CONFIRM } from '~/utils/joyride';
import { useTour } from '~/hooks/useTour';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { validateStock } from '~/utils/stocks';
import { useSession } from 'next-auth/react';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { DrawerEmptyRFC, DrawerVerifyRFCProvider, VerifyStatus } from '~/components/DrawerVerifyRFCProvider';
import useDrawerVerifyRFC from '~/hooks/useDrawerVerifyRFC';

interface ResumeProps {
  guardianHash: string;
}

function VerifyRFC({ guardianHash }: Readonly<ResumeProps>) {
  const router = useRouter();
  const { selectedItems, totalToPay, clear } = useSelectionStore();
  const selectedSchool = useSelectedSchool();
  const { data: session } = useSession();
  const [stockError, setStockError] = useState(false);
  const { handleAssignRFC, allSuccess, studentsWithoutInvoice, openHasError } = useDrawerVerifyRFC();
  const needsInvoiceConfirmation = router.query.verify_status === VerifyStatus.NO_INVOICE;

  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingVerifyRfc,
    isFetchingUser,
  } = useVerifyRFC();

  const { showTour, handleShowTour } = useTour();

  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor) as (BillingStudent & Color)[];

  const itemsQuantity = selectedItems.length;

  useEffect(() => {
    if (!itemsQuantity) router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, guardianHash, router]);

  useSendPageViewedEvent('Resumen');

  const handlerBackButton = () => {
    router.push(`/guardians/${guardianHash}`);
  };

  const handleContinue = async () => {
    const hasBillableItem = selectedItems.some((item) => (item as DashboardDependentFulfillment).is_billable);
    if (hasBillableItem) {
      router.push(
        {
          query: {
            ...router.query,
            verify_status: VerifyStatus.INVOICE_DISMISSED,
          },
        },
        undefined,
        {
          shallow: true,
        }
      );
    }
    const hasStock = await validateStock(selectedSchool?.id ?? '', session?.token ?? '', selectedItems);
    if (!hasStock) {
      setStockError(true);
      return;
    }
    if (!allSuccess(!hasBillableItem)) return;

    router.push(`/guardians/${guardianHash}/payments`);
  };

  useEffect(() => {
    if (router.query.target) {
      const target = document.getElementById(`card-${router.query.target}-change-rfc`);

      if (target) {
        const rect = target.getBoundingClientRect();

        const scrollTo = window.scrollY + rect.top - window.innerHeight / 2;

        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }
    }
  }, [router.query.target]);
  return (
    <>
      <TitleBackButton title="Resumen" onClick={handlerBackButton} />
      <div className="py-[18px]">
        <div className="mx-[22px]">
          <ResumeCardList
            selectedItems={selectedItems}
            dependents={dependentsWithErrors}
            onAssignRFC={handleAssignRFC}
            isLoadingVerify={isFetchingVerifyRfc}
            isLoading={isFetchingUser}
            isVerify
          />

          <Tour
            run={Boolean(router.query.target && showTour && !showTour.needsInvoiceConfirmation)}
            steps={SET_RFC_INVOICE_CONFIRM(router.query.target as string)}
            tooltipComponent={JoyrideTooltip}
            callback={(callback) => {
              if (callback.status === 'finished') {
                if (!showTour?.needsInvoiceConfirmation) handleShowTour('needsInvoiceConfirmation');
                router.push(
                  {
                    query: {
                      ...Object.fromEntries(Object.entries(router.query).filter((e) => e[0] !== 'target')),
                    },
                  },
                  undefined,
                  {
                    shallow: true,
                  }
                );
              }
            }}
          />
        </div>
        <StockErrorAlert stockError={stockError} resetSelection={() => clear()} setStockError={setStockError} />
        {Boolean(itemsQuantity) && (
          <div className="my-36">
            <PayButton
              priceTotal={totalToPay}
              itemsQuantity={itemsQuantity}
              currency={selectedItems[0].currency}
              onClick={handleContinue}
              buttonText="PAGAR"
              loading={openHasError || isFetchingVerifyRfc}
            />
          </div>
        )}
      </div>
      <DrawerEmptyRFC
        handleContinue={handleContinue}
        open={Boolean(selectedSchool?.does_invoice) && needsInvoiceConfirmation}
        studentsWithoutInvoice={studentsWithoutInvoice}
        handleBack={() => {
          router.push(
            {
              query: {
                ...router.query,
                verify_status: VerifyStatus.INVOICE_DISMISSED,
                target: studentsWithoutInvoice[0].id,
              },
            },
            undefined,
            {
              shallow: true,
            }
          );
        }}
      />
    </>
  );
}

VerifyRFC.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Resumen</title>
      </Head>
      <div className="max-w-md mx-auto">
        <DrawerVerifyRFCProvider>{page}</DrawerVerifyRFCProvider>
      </div>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const { guardianHash } = context?.query || { guardianHash: '' };

  return {
    props: {
      guardianHash,
    },
  };
}

VerifyRFC.auth = true;
export default VerifyRFC;
