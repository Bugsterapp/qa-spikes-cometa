import type { NextPageContext } from 'next';
import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useSelectedSchool } from '~/stores/globalStore';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { cn } from '~/lib/cn';
import { addColorsToDependents } from '~/utils/colors';
import { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '~/hooks/useIntersectionObserver';
import { useSubscriptionSelection } from '@cometa/hooks';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import useDrawerVerifyRFC from '~/hooks/useDrawerVerifyRFC';
import { DrawerEmptyRFC, DrawerVerifyRFCProvider, VerifyStatus } from '~/components/DrawerVerifyRFCProvider';
import LoadingButton from '~/components/ui/LoadingButton';
import SubscriptionCardResume from '~/components/Resume/SubscriptionCardResume';
import { PreferenceTypeEnum } from '@cometa/trpc';
import { api } from '~/utils/api';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';

interface ResumeProps {
  guardianHash: string;
}

function SubscriptionResume({ guardianHash }: Readonly<ResumeProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const sendEvent = useSendEvent();
  const sendPageEvent = useSendPageEvent();
  const { selectedItems } = useSubscriptionSelection();
  const router = useRouter();
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  api.kushki.getCommissionValues.useQuery(
    {
      preference_type: PreferenceTypeEnum.CARD,
      items: selectedItems.map((item) => ({
        student: item.student_id,
        order: item.next_order_id,
      })),
    },
    {
      enabled: selectedItems.length > 0,
    }
  );
  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingUser,
    isFetchingVerifyRfc,
  } = useVerifyRFC();
  const { handleAssignRFC, studentsWithoutInvoice, allSuccess } = useDrawerVerifyRFC();
  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor);
  const handleBackButton = () => {
    sendEvent(TrackEvents.global.back, { page: 'subscriptions summary' });
    router.push(`/guardians/${guardianHash}/subscriptions?selectedTab=available`);
  };
  const selectedSchool = useSelectedSchool();

  const needsInvoiceConfirmation = router.query.verify_status === VerifyStatus.NO_INVOICE;

  const showInvoiceConfirmation = Boolean(selectedSchool?.does_invoice) && needsInvoiceConfirmation;

  useEffect(() => {
    sendPageEvent(TrackEvents.subscriptions.summaryPageViewed, PageViewedCategory);
  }, []);

  useEffect(() => {
    if (!selectedItems.length) router.push(`/guardians/${guardianHash}/subscriptions?selectedTab=available`);
  }, [selectedItems, guardianHash, router]);

  const handleContinue = () => {
    if (showInvoiceConfirmation) {
      sendEvent(TrackEvents.checkout.summary.invoiceConfirm);
    } else {
      sendEvent(TrackEvents.checkout.summary.payClicked);
    }

    if (!allSuccess()) return;

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
    setIsLoading(true);
    router.push(`/guardians/${guardianHash}/subscriptions/checkout`);
  };

  return (
    <>
      <div className="sticky top-0">
        <TitleBackButton title="Seleccionar facturación" onClick={handleBackButton} />
        <div className="mt-[38px] px-5 flex flex-col gap-y-5 items-center justify-center relative ">
          <div>Confirme la facturación para cada uno de sus dependientes.</div>
          <div className="flex flex-col w-full gap-y-6">
            {dependentsWithErrors.map((dependent) => {
              const items = selectedItems
                .filter((item) => item.student_id === dependent.id)
                .map(({ concept_id, concept_name, student_id }) => ({
                  id: `${concept_id}_${student_id}`,
                  concept_name,
                }));

              if (items.length === 0) return null;
              return (
                <SubscriptionCardResume
                  items={items}
                  selectedSchool={selectedSchool}
                  dependent={dependent}
                  key={dependent.id}
                  onAssignRFC={(dependent) => {
                    sendEvent(TrackEvents.billing.taxId.change);
                    handleAssignRFC(dependent);
                  }}
                  isLoadingVerify={isFetchingVerifyRfc}
                  isLoading={isFetchingUser}
                />
              );
            })}
          </div>
          <div
            className={cn('bottom-0 flex items-center justify-center flex-col-reverse w-full py-9 px-5 sticky top-0', {
              'z-10 backdrop-blur-[3.5px]': !isVisible,
            })}
          >
            <LoadingButton loading={isLoading} className="w-full max-w-xs font-medium" onClick={handleContinue}>
              Continuar
            </LoadingButton>
          </div>
        </div>
      </div>
      <DrawerEmptyRFC
        handleContinue={handleContinue}
        open={showInvoiceConfirmation}
        studentsWithoutInvoice={studentsWithoutInvoice}
        handleBack={() => {
          sendEvent(TrackEvents.checkout.summary.invoiceBack);
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

SubscriptionResume.getLayout = function getLayout(page: React.ReactElement) {
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

SubscriptionResume.auth = true;
export default SubscriptionResume;
