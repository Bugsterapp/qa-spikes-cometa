import type { ProjectEnum } from '@cometa/hooks';
import type { BillingStudent } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import type { NextPageContext } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import CheckoutFooter, {
  CheckoutFooterButton,
  ContainerInfo,
  LabelItemsCount,
  TotalAmount,
} from '~/components/CheckoutFooter';
import { DrawerEmptyRFC, DrawerVerifyRFCProvider, VerifyStatus } from '~/components/DrawerVerifyRFCProvider';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import ResumeCardList from '~/components/organisms/guardians/ResumeCardList';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import BlockedPaymentsBanner, {
  BannerType,
  getBannerInfo,
  getBlockedPaymentsMessage,
} from '~/components/BlockedPaymentsBanner';
import useDrawerVerifyRFC from '~/hooks/useDrawerVerifyRFC';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { useSelectedSchool } from '~/stores/globalStore';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { addColorsToDependents, type Color } from '~/utils/colors';
import { typeOfOrdersInStore } from '~/utils/orders';
import { useStock } from '~/utils/stocks';
import { api } from '~/utils/api';

interface ResumeProps {
  guardianHash: string;
}

function Resume({ guardianHash }: Readonly<ResumeProps>) {
  const router = useRouter();
  const { selectedItems, totalToPay, clear, itemQuantities, ordersHaveDependents } = useSelectionStore();
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const selectedSchool = useSelectedSchool();
  const { data: session } = useSession();
  const [stockError, setStockError] = useState(false);
  const { handleAssignRFC, allSuccess, studentsWithoutInvoice, openHasError } = useDrawerVerifyRFC();
  const needsInvoiceConfirmation = router.query.verify_status === VerifyStatus.NO_INVOICE;
  const [isLoading, setIsLoading] = useState(false);
  const { validateStock } = useStock(selectedSchool?.id ?? session?.user.schools[0]?.id ?? '');
  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  const schoolId = selectedSchool?.id ?? session?.user.schools[0]?.id ?? '';
  const { data: blockedPeriodData } = api.checkout.checkBlockedPeriods.useQuery({ schoolId }, { enabled: !!schoolId });

  const bannerInfo = getBannerInfo(blockedPeriodData);

  const blockedMessage =
    blockedPeriodData?.is_blocked && blockedPeriodData.start_date && blockedPeriodData.end_date
      ? getBlockedPaymentsMessage(blockedPeriodData.start_date, blockedPeriodData.end_date, BannerType.Active)
      : undefined;

  useEffect(() => {
    const { optional, mandatory } = typeOfOrdersInStore(selectedItems);
    sendPageEvent(TrackEvents.checkout.summary.pageViewed, PageViewedCategory, {
      optional,
      mandatory,
    });
  }, []);

  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingVerifyRfc,
    isFetchingUser,
  } = useVerifyRFC();

  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor) as (BillingStudent & Color)[];

  const itemsQuantity = cartItems.length;

  useEffect(() => {
    if (!itemsQuantity) {
      Sentry.getCurrentScope().setExtras({
        itemsQuantity,
        cartItems,
        selectedItems,
      });
      Sentry.captureEvent({
        message: 'No items in cart',
        level: 'info',
        user: session?.user,
      });
      router.push(`/guardians/${guardianHash}`);
    }
  }, [itemsQuantity]);

  const handlerBackButton = () => {
    sendEvent(TrackEvents.global.back, { page: 'summary' });
    router.push(`/guardians/${guardianHash}`);
  };

  const handleContinue = async () => {
    if (showInvoiceConfirmation) {
      sendEvent(TrackEvents.checkout.summary.invoiceConfirm);
    } else {
      sendEvent(TrackEvents.checkout.summary.payClicked);
    }
    const hasBillableItem = selectedItems.some((item) => item.concept.is_billable);
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
    const notHaveStock = await validateStock(itemQuantities);
    if (notHaveStock) {
      setStockError(true);
      return;
    }
    if (!allSuccess(!hasBillableItem)) return;
    setIsLoading(true);
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

  const showInvoiceConfirmation = Boolean(selectedSchool?.does_invoice) && needsInvoiceConfirmation;
  return (
    <>
      <TitleBackButton title="Resumen" onClick={handlerBackButton} />
      <div className="py-[18px] pb-36">
        <div className="mx-[22px]">
          {bannerInfo.show && bannerInfo.type && bannerInfo.startDate && bannerInfo.endDate && (
            <div className="mb-6">
              <BlockedPaymentsBanner
                startDate={bannerInfo.startDate}
                endDate={bannerInfo.endDate}
                type={bannerInfo.type}
              />
            </div>
          )}
          <ResumeCardList
            selectedItems={selectedItems}
            dependents={dependentsWithErrors}
            onAssignRFC={(dependent) => {
              sendEvent(TrackEvents.billing.taxId.change);
              handleAssignRFC(dependent);
            }}
            isLoadingVerify={isFetchingVerifyRfc}
            isLoading={isFetchingUser}
            ordersHaveDependents={ordersHaveDependents}
          />
        </div>
        <StockErrorAlert stockError={stockError} resetSelection={() => clear()} setStockError={setStockError} />
        <CheckoutFooter open={!!itemsQuantity}>
          <ContainerInfo>
            <LabelItemsCount count={itemsQuantity}>TOTAL</LabelItemsCount>
            <TotalAmount amount={totalToPay} />
          </ContainerInfo>
          <CheckoutFooterButton
            onClick={handleContinue}
            loading={openHasError || isFetchingVerifyRfc || isLoading}
            blockedMessage={blockedMessage}
          >
            Pagar
          </CheckoutFooterButton>
        </CheckoutFooter>
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

Resume.getLayout = function getLayout(page: React.ReactElement) {
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

Resume.auth = true;
export default Resume;
