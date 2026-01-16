import { calculateTotalToPay, CartItem, ItemQuantity, ProjectEnum, TOrderPortal } from '@cometa/hooks';
import { GuardianStudent, RetrieveGuardian } from '@cometa/trpc/src/types';
import Box from 'components/atoms/common/Box';
import Confetti from 'confetti-js';
import Cookies from 'lib/Cookies';
import { GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '~/components/Navbar';
import BoxColorText from '~/components/Tag';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import Accordion from '~/components/atoms/guardians/Accordion';
import DialogRating from '~/components/molecules/guardians/dialogs/DialogRating';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import useIntersectionObserver from '~/hooks/useIntersectionObserver';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { cn } from '~/lib/cn';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import GreenCheck from '~/public/icons/success-check.svg';
import { useSelectedSchool } from '~/stores/globalStore';
import { useCartItems, useSelectionStore } from '~/stores/selectionStorePersisted';
import { api } from '~/utils/api';
import { Color, colors } from '~/utils/colors';
import { WHAT_SUCCESS } from '~/utils/linksWhatsapp';
import { formatPrice, typeOfOrdersInStore } from '~/utils/orders';
import { SEGMENT_RATING_CSAT_PAYMENT } from '~/utils/segmentKeys';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';

const OrderSummary = ({
  items,
  total,
  showBilling,
  hasBilling,
  billingName,
  color,
  bgColor,
  count,
}: {
  items: { id: string; name: string; amount: string }[];
  total: string;
  showBilling: boolean;
  hasBilling: boolean;
  billingName?: string | null;
  color?: string;
  bgColor?: string;
  count: number;
}) => (
  <>
    <div className="px-[26px] py-5 bg-white rounded-t-2xl">
      <Accordion
        title={
          <div className="flex items-center">
            <span className="mr-3 text-sm font-semibold text-gray-300">Órdenes pagadas:</span>
            <BoxColorText bgcolor={bgColor} color={color} text={count.toString()} />
          </div>
        }
      >
        <div className="flex flex-col gap-y-1.5">
          {items.map((item, index) => (
            <div key={`${item.id}${index}`} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{item.name}</span>
              <span className="text-blue-700">{item.amount}</span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
    <div
      className={cn(
        'px-[26px] flex flex-row justify-between text-sm font-semibold py-5 bg-white border-t border-[#adbbcc4d]',
        { 'rounded-b-2xl': !showBilling }
      )}
    >
      <span className="text-gray-300">Total:</span>
      <span className="text-blue-700">{total}</span>
    </div>
    {showBilling && (
      <div className="px-[26px] py-5 bg-white rounded-b-2xl border-t border-[#adbbcc4d]">
        {hasBilling ? (
          <div className="flex flex-col gap-y-1.5 text-gray-300 text-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-semibold">Facturación:</span>
            </div>
            <span>{billingName ?? 'Datos Incompletos'}</span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-300">No hay facturación</span>
          </div>
        )}
      </div>
    )}
  </>
);

interface SuccessListProps {
  dependents: (GuardianStudent & Color)[];
  selectedItems: TOrderPortal[];
  itemQuantities: ItemQuantity[];
  cartItems: CartItem[];
  guardian: RetrieveGuardian;
  ordersHaveDependents: boolean;
}

const SuccessList = ({
  dependents = [],
  selectedItems,
  itemQuantities,
  cartItems,
  guardian,
  ordersHaveDependents,
}: SuccessListProps) => {
  const selectedSchool = useSelectedSchool();
  const transformedCartItems = useMemo(
    () =>
      cartItems
        .map((cartItem) => {
          const item = selectedItems.find((item) => item.id === cartItem.id);
          return item
            ? {
                id: item.id,
                name: item.name,
                amount: formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount),
              }
            : null;
        })
        .filter(Boolean) as { id: string; name: string; amount: string }[],
    [cartItems, selectedItems]
  );

  if (!ordersHaveDependents) {
    const currency = selectedItems[0]?.currency ?? 'MXN';
    const total = formatPrice(calculateTotalToPay(selectedItems, itemQuantities), currency);
    const hasBilling = guardian.tax_id && guardian.taxing_system && guardian.billing_name;
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col">
          <OrderSummary
            items={transformedCartItems}
            total={total}
            showBilling={!!selectedSchool?.does_invoice}
            billingName={guardian.billing_name}
            hasBilling={!!hasBilling}
            color={colors[0].text}
            bgColor={colors[0].background}
            count={cartItems.length}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {dependents.map((dependent) => {
        const orders = selectedItems.filter((item) => item.student.id === dependent.id);
        if (!orders.length) return null;

        const currency = orders[0]?.currency ?? 'MXN';
        const total = formatPrice(calculateTotalToPay(orders, itemQuantities), currency);
        const filteredCartItems = cartItems.filter((item) => item.student === dependent.id);
        const billingName = dependent.billing_guardian?.billing_name;
        return (
          <div key={dependent.id} id={`card-${dependent.id}`} className="flex flex-col">
            <div className="flex items-center px-[26px] py-5 bg-white rounded-t-2xl">
              <span className="text-sm font-semibold text-gray-300 mr-1.5">Estudiante:</span>
              <BoxColorText
                bgcolor={dependent?.color?.background}
                color={dependent?.color?.text}
                text={dependent.first_name?.toUpperCase() || ''}
              />
            </div>
            <OrderSummary
              items={
                filteredCartItems
                  .map((cartItem) => {
                    const item = orders.find((item) => item.id === cartItem.id && item.student.id === cartItem.student);
                    return item
                      ? {
                          id: item.id,
                          name: item.name,
                          amount: formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount),
                        }
                      : null;
                  })
                  .filter(Boolean) as { id: string; name: string; amount: string }[]
              }
              total={total}
              showBilling={!!selectedSchool?.does_invoice}
              billingName={billingName}
              hasBilling={!!dependent.billing_guardian}
              color={dependent?.color?.text}
              bgColor={dependent?.color?.background}
              count={filteredCartItems.length}
            />
          </div>
        );
      })}
    </div>
  );
};

function Success({ session, isMP }: { session: Session; isMP: boolean }) {
  const { data: dependents } = api.guardian.studentList.useQuery();
  const [userName, domainName] = session.user.email?.split('@') || ['', ''];
  const hiddenEmail = `${userName?.substring(0, 3) || ''}***@${domainName || ''}`;
  const _router = useRouter();
  const { guardianHash, status = null } = _router.query;
  const { selectedItems, totalToPay, clear, itemQuantities, ordersHaveDependents } = useSelectionStore();
  const cartItems = useCartItems<ProjectEnum.PORTAL>();
  const currency = selectedItems?.[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length || 0;
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const itemValues = useRef(Cookies.get('FULLFILMENT_VALUES') || null);
  const totalPayed = useMemo(() => (!isMP ? itemValues.current : { total: 0, subtotal: 0, commission: 0 }), [isMP]);
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  useEffect(() => {
    // I'm taking Ls from a confetti lib? Not gonna lie
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti';

    canvas.setAttribute(
      'style',
      'position: absolute; top: 58px; left: 0px; z-index: 0; max-width: 100vw !important; max-height: calc(100vh - 58px) !important;'
    );
    document.body.appendChild(canvas);
    const confettiSettings = { target: 'confetti', respawn: false, rotate: true, max: 150, clock: 30 };
    const confetti = new Confetti(confettiSettings);
    confetti.render();
    return () => {
      confetti.clear();
      document.body.removeChild(canvas);
    };
  }, []);

  useEffect(() => {
    const { optional, mandatory } = typeOfOrdersInStore(selectedItems);
    sendPageEvent(TrackEvents.checkout.success.pageViewed, PageViewedCategory, { optional, mandatory });
  }, []);

  const goToHome = useCallback(() => {
    sendEvent(TrackEvents.checkout.success.backToHome);
    Cookies.delete('COMMISSION_VALUES');
    Cookies.delete('FULLFILMENT_VALUES');

    _router.push({
      pathname: `/guardians/${guardianHash}/`,
      query: { tour: 'history' },
    });
  }, [_router, guardianHash]);

  useEffect(() => {
    const MPRedirect = isMP && Boolean(itemsQuantity) === false;

    if (!itemsQuantity || !totalPayed || MPRedirect) goToHome();
  }, [itemsQuantity, goToHome, isMP, totalPayed]);

  useEffect(() => {
    const ratedPayment = localStorage.getItem(RATED_CSAT_PAYMENT);
    if (status && !ratedPayment) setOpenRatingDialog(true);
  }, [status]);

  useEffect(() => () => clear(), []);

  if (!itemsQuantity) return null;

  const calculateTotalForMP = () => formatPrice(totalToPay, currency);

  return (
    <>
      <Head>
        <title>Pago Exitoso</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="container relative z-10 block max-w-[600px] px-6 mx-auto">
        <div className="flex flex-col items-center justify-center py-[34px]" id="myScroll">
          <div className="flex flex-col items-center mb-9">
            <GreenCheck />
            <h5 className="mt-6 text-2xl font-bold text-center text-gray-300">¡Felicitaciones!</h5>
            <p className="text-center text-gray-300">Tu pago se realizó con éxito</p>
          </div>
          <Box className="flex justify-between mb-9 w-full text-sm font-semibold text-blue-100">
            <span>Total pagado</span>
            <span>{!isMP ? formatPrice(totalPayed?.total ?? 0, currency) : calculateTotalForMP()}</span>
          </Box>
          <div className="mb-11 w-full">
            {Boolean(itemsQuantity) && Boolean(dependents?.length) && (
              <SuccessList
                selectedItems={selectedItems}
                dependents={dependents ?? []}
                ordersHaveDependents={ordersHaveDependents}
                itemQuantities={itemQuantities}
                cartItems={cartItems}
                guardian={session.user}
              />
            )}
          </div>
          {totalPayed?.commission ? (
            <ol className="flex flex-col space-y-1.5 list-none m-0 p-0 px-1 text-gray-300 w-full text-sm">
              <li className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(totalPayed?.subtotal ?? 0, currency)}</span>
              </li>
              <li className="flex justify-between font-normal">
                <span>Fee administrativo</span>
                <span>{formatPrice(totalPayed?.commission ?? 0, currency)}</span>
              </li>
              <hr className="w-full border-0 border-t border-solid border-gray" />
              <li className="flex justify-between font-bold">
                <span>Total pagado</span>
                <span>{formatPrice(totalPayed?.total ?? 0, currency)}</span>
              </li>
            </ol>
          ) : null}
          <div
            className={cn('fixed bottom-0 flex justify-center flex-col-reverse w-full py-9', {
              'z-10 backdrop-blur-[3.5px]': !isVisible,
            })}
            id="myButton"
          >
            <button
              className="px-[50px] h-14 font-bold text-white bg-blue-100 rounded-full hover:bg-[#3340b2] active:bg-blue-100"
              onClick={goToHome}
            >
              Volver al inicio
            </button>
          </div>
          <div className="text-center text-gray-300">
            <p className="mb-4 text-sm" ref={ref}>
              Recibirás tu comprobante de pago al correo {hiddenEmail}
            </p>
            <p className="text-center">
              Si tienes alguna duda, escríbenos al
              <a
                className="ml-1 font-normal text-blue-100 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={WHAT_SUCCESS}
                onPointerDown={() => sendEvent(TrackEvents.checkout.success.whatsappLinkClicked)}
              >
                WhatsApp.
              </a>
            </p>
          </div>
        </div>
      </div>
      <DialogRating
        open={openRatingDialog}
        onClose={() => {
          setOpenRatingDialog(false);
        }}
        text="¿Cómo calificarías tu experiencia de pago?"
        statusPayment={status as string}
        segmentName={SEGMENT_RATING_CSAT_PAYMENT}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.query;

  if (params.payment_id) {
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${params.guardianHash}/`, context.query),
      },
    };
  }

  return {
    props: {
      session: await getSession(context),
      isMP: !!params.payment_id,
    },
  };
};
Success.auth = true;
export default Success;
