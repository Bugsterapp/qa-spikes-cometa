import Head from 'next/head';
import * as DetailCard from '~/components/SubscriptionCard';
import Navbar from '~/components/Navbar';
import Trash from '~/public/icons/trash.svg';
import { Button } from '~/components/atoms/Button';
import { Banner } from '~/components/Banner';
import Info from '~/public/icons/info_outlined.svg';
import HelpLink from '~/components/atoms/guardians/HelpLink';
import IcWhatsApp from '~/public/icons/ic_whatsapp.svg';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';
import { useRouter } from 'next/router';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { ServiceClient, api } from '~/utils/api';
import { useState } from 'react';
import { ConfirmationDrawer, InformationDrawer } from '~/components/Drawer.Variants';
import { useDrawerStore } from '~/stores/drawerStore';
import Warning from '~/public/icons/warning.svg';
import { useSubscriptionStore, useToggle } from '@cometa/hooks';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { addColorsToDependents } from '~/utils/colors';
import useDrawerVerifyRFC from '~/hooks/useDrawerVerifyRFC';
import { DrawerVerifyRFCProvider } from '~/components/DrawerVerifyRFCProvider';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { RetrieveSubscriptionResponseDTO } from '@cometa/trpc';
import { VerifyRFCFooter } from '~/components/ResumeCard';
import dayjs from '~/lib/dayjs';

interface SubscriptionDetailProps {
  guardianHash: string;
  subscription: RetrieveSubscriptionResponseDTO;
  selectedSchoolId: string;
}

const SubscriptionDetail = ({ guardianHash, subscription, selectedSchoolId }: SubscriptionDetailProps) => {
  const router = useRouter();
  const {
    toggle: isOpenChangeCard,
    onToggle: onToggleInfoChangeCard,
    onClose: onCloseInfoChangeCard,
  } = useToggle(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const { showDrawer } = useDrawerStore();
  const { clear } = useSubscriptionStore();
  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingVerifyRfc,
    isFetchingUser,
  } = useVerifyRFC();
  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor);
  const { handleAssignRFC } = useDrawerVerifyRFC();

  function handlerBackButton() {
    clear();
    router.push(`/guardians/${guardianHash}/subscriptions`);
  }

  const { mutate, isLoading } = api.subscriptions.cancelSubscription.useMutation({
    onSuccess: () => {
      showDrawer({
        title: 'Tu domiciliación fue dada de baja con éxito',
        description: `La domiciliación de "${subscription?.concept}" de ${subscription?.student.full_name} fue dada de baja correctamente.`,
      });
      router.push(`/guardians/${guardianHash}/subscriptions`);
    },
  });

  if (!subscription) {
    return null;
  }

  const startDate = dayjs(subscription.start_date).format('MMM YYYY');
  const endDate = dayjs(subscription.end_date).format('MMM YYYY');
  const nextPaymentDate = dayjs(subscription.next_payment_date).format('D [de] MMMM YYYY');

  return (
    <div>
      <TitleBackButton title="Detalle de domiciliación" onClick={handlerBackButton} />

      {subscription.payment_has_failed && (
        <Banner intent="warning" className="mt-6 py-2.5 px-4 text-[#283877]">
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center gap-x-2">
              <Warning className="text-[#F1BD35] h-4" />
              <strong className="block text-base font-semibold ">No se pudo realizar el cobro.</strong>
            </div>
            <div className="flex flex-col text-base font-normal gap-y-6">
              <span>Hubo un error en el cobro de tu domiciliación por errores en la tarjeta asociada. </span>
              <span>Debes pagar manualmente la orden del mes vigente para mantener la domiciliación.</span>
              <span>Una vez pagada, el pago del mes siguiente ya será cobrado de manera automática nuevamente.</span>
            </div>
          </div>
        </Banner>
      )}

      <DetailCard.Content>
        <DetailCard.Row className="items-center">
          <h2 className="text-[#283877] font-semibold text-lg">{subscription.concept}</h2>
          <Button
            variant="ghost"
            className="p-2 bg-transparent rounded-full shadow-none"
            onClick={() => setIsCanceling(true)}
            disabled={isLoading}
          >
            <Trash />
          </Button>
          <ConfirmationDrawer
            open={isCanceling}
            title="¿Estás seguro que quieres dar de baja la domiciliación?"
            description="Cuando des de baja la domiciliación deberás comenzar a pagar manualmente los pagos relacionados a este concepto."
            confirmLabel="Sí, dar de baja"
            cancelLabel="Atrás"
            onClick={() =>
              mutate({
                subscriptionId: subscription.id,
                schoolId: selectedSchoolId,
              })
            }
            onCancel={() => setIsCanceling(false)}
            onClose={() => setIsCanceling(false)}
            disabled={isLoading}
            loading={isLoading}
          />
        </DetailCard.Row>
        <DetailCard.Row>
          <DetailCard.InfoDetail>
            <DetailCard.Header>Estudiante</DetailCard.Header>
            <div className="text-[#32455E] font-medium">{subscription.student.full_name}</div>
          </DetailCard.InfoDetail>
        </DetailCard.Row>

        <DetailCard.Row className="flex-col">
          <DetailCard.InfoDetail>
            <DetailCard.Header>Detalles de cobro</DetailCard.Header>
            <DetailCard.Info title="Vigencia:" value={`${startDate} / ${endDate}`} />
            <DetailCard.Info title="Fecha de cobro:" value={nextPaymentDate} />
          </DetailCard.InfoDetail>
        </DetailCard.Row>

        <DetailCard.Row>
          <DetailCard.InfoDetail>
            <DetailCard.Header>Tarjeta domiciliada</DetailCard.Header>
            <DetailCard.CreditCard
              credit_card={subscription.metadata.card_info.card_brand.toLowerCase()}
              number={subscription.metadata.card_info.card_number_masked.slice(-4)}
            />
          </DetailCard.InfoDetail>
          <Button
            size="small"
            variant="clear"
            className="text-[#4A5CFF] font-medium leading-4"
            onClick={() => onToggleInfoChangeCard()}
          >
            CAMBIAR
          </Button>
          <InformationDrawer
            open={isOpenChangeCard}
            intent="card"
            title="Cambiar la tarjeta asociada"
            description="Si quieres que tu domiciliación sea cobrada a otra tarjeta, debes dar de baja la domiciliación actual y domiciliarte nuevamente para poder asociar la nueva tarjeta."
            onClick={onToggleInfoChangeCard}
            onClose={onCloseInfoChangeCard}
          />
        </DetailCard.Row>
        {!!dependentsWithErrors[0] && (
          <VerifyRFCFooter
            dependent={dependentsWithErrors[0]}
            onAssignRFC={handleAssignRFC}
            isLoading={isFetchingUser}
            isLoadingVerify={isFetchingVerifyRfc}
          />
        )}
      </DetailCard.Content>
      <Banner intent="info" className="mt-6 flex font-normal leading-6 py-1.5 px-3.5">
        <div>
          <Info className="h-[18px] min-w-[18px] w-[18px] my-1" />
        </div>
        <div>El precio esta sujeto a modificaciones dependiendo consideraciones del colegio.</div>
      </Banner>
      <HelpLink href={WHAT_TALK_TO_US}>
        <span className="flex flex-row items-center justify-center py-5 mt-5">
          <IcWhatsApp className="mr-3" />
          Contactar a soporte
        </span>
      </HelpLink>
    </div>
  );
};

SubscriptionDetail.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Detalle de suscripción</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">
        <DrawerVerifyRFCProvider>{page}</DrawerVerifyRFCProvider>
      </div>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  try {
    const { guardianHash, id, school } = context?.query || { guardianHash: '' };
    const session = await getSession(context);
    const response = await ServiceClient.apiV1SchoolsSubscriptionsRetrieve(id as string, school as string, {
      headers: {
        token: session?.token ?? '',
      },
    });

    return {
      props: {
        guardianHash,
        subscription: response.data,
        selectedSchoolId: school,
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      notFound: true,
    };
  }
}

SubscriptionDetail.auth = true;
export default SubscriptionDetail;
