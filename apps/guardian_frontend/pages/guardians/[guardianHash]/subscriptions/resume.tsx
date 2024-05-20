import { NextPageContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CallBackProps } from 'react-joyride';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import Tour from '~/components/atoms/common/Tour';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { useTour } from '~/hooks/useTour';
import { CHANGE_RFC_JOYRIDE } from '~/utils/joyride';
import { cn } from '~/lib/cn';
import { Color, addColorsToDependents } from '~/utils/colors';
import { School } from '@cometa/trpc';
import Tag from '~/components/Tag';
import * as OrderCard from '~/components/OrderCard';
import { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '~/hooks/useIntersectionObserver';
import { useSubscriptionSelection } from '@cometa/hooks';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import useDrawerVerifyRFC from '~/hooks/useDrawerVerifyRFC';
import { DrawerEmptyRFC, DrawerVerifyRFCProvider, VerifyStatus } from '~/components/DrawerVerifyRFCProvider';
import { VerifyRFCFooter } from '~/components/ResumeCard';
import LoadingButton from '~/components/molecules/LoadingButton';

interface ResumeProps {
  guardianHash: string;
}

function SubscriptionResume({ guardianHash }: Readonly<ResumeProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedItems } = useSubscriptionSelection();
  const router = useRouter();
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingUser,
    isFetchingVerifyRfc,
  } = useVerifyRFC();
  const { handleAssignRFC, studentsWithoutInvoice, allSuccess } = useDrawerVerifyRFC();
  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor);
  const handleBackButton = () => {
    router.push(`/guardians/${guardianHash}/subscriptions?selectedTab=available`);
  };
  const selectedSchool = useSelectedSchool();
  const { showTour, handleShowTour } = useTour();
  const handleCallback = (callBack: CallBackProps) => {
    if (callBack.status === 'finished') handleShowTour('change_rfc');
  };
  const needsInvoiceConfirmation = router.query.verify_status === VerifyStatus.NO_INVOICE;

  useEffect(() => {
    if (!selectedItems.length) router.push(`/guardians/${guardianHash}/subscriptions?selectedTab=available`);
  }, [selectedItems, guardianHash, router]);

  const handleContinue = () => {
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
            {dependentsWithErrors.map((dependent, index) => {
              const items = selectedItems
                .filter((item) => item.student_id === dependent.id)
                .map(({ concept_id, concept_name, student_id }) => ({
                  id: concept_id + '_' + student_id,
                  concept_name,
                }));

              if (items.length === 0) return null;
              return (
                <SubscriptionCardResume
                  items={items}
                  selectedSchool={selectedSchool}
                  dependent={dependent}
                  key={dependent.id}
                  onAssignRFC={handleAssignRFC}
                  Tour={
                    index === 0 ? (
                      <Tour
                        run={Boolean(showTour && !showTour?.change_rfc)}
                        steps={CHANGE_RFC_JOYRIDE}
                        tooltipComponent={JoyrideTooltip}
                        callback={handleCallback}
                      />
                    ) : undefined
                  }
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

export interface SubscriptionCardResumeProps {
  isLoadingVerify?: boolean;
  isLoading?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
  dependent: DependantErrorRFC & Color;
  selectedSchool?: School;
  items: {
    id: string;
    concept_name: string;
  }[];
  Tour?: React.ReactElement;
}

/**
 * @description Card variant for section active subscription in subscription page
 */
export function SubscriptionCardResume({
  isLoadingVerify = false,
  isLoading = false,
  onAssignRFC,
  dependent,
  selectedSchool,
  Tour,
  items,
}: Readonly<SubscriptionCardResumeProps>) {
  return (
    <OrderCard.Root status="subscription">
      <OrderCard.Content className="w-full">
        <OrderCard.Info className="px-[26px] py-5">
          <div className="flex flex-row items-center gap-x-1.5">
            <span className="font-semibold text-gray-300">Estudiante:</span>
            <Tag
              bgcolor={dependent?.color?.background}
              color={dependent?.color?.text}
              text={dependent.first_name.toUpperCase() || ''}
            />
          </div>
        </OrderCard.Info>
        <OrderCard.Details className="px-[26px] py-5 data-[state='open']:pb-5 flex flex-col gap-y-2.5">
          <OrderCard.DetailsTrigger className="py-0">
            <div className="flex flex-row gap-x-3">
              <span className="font-semibold text-gray-300">Domiciliaciones</span>
              <Tag bgcolor={dependent?.color?.background} color={dependent?.color?.text} text={`${items.length}`} />
            </div>
          </OrderCard.DetailsTrigger>
          <OrderCard.DetailsContent>
            <div className="font-normal text-gray-300 flex flex-col gap-y-2.5">
              {items.map((subscribable) => (
                <span key={subscribable.id}>{subscribable.concept_name}</span>
              ))}
            </div>
          </OrderCard.DetailsContent>
        </OrderCard.Details>
        {selectedSchool?.does_invoice && (
          <VerifyRFCFooter
            isLoading={isLoading}
            isLoadingVerify={isLoadingVerify}
            dependent={dependent}
            onAssignRFC={onAssignRFC}
            Tour={Tour}
          />
        )}
      </OrderCard.Content>
    </OrderCard.Root>
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
