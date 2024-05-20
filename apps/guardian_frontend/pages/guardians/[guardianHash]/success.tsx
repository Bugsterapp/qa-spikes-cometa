import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSession } from 'next-auth/react';
import Navbar from '~/components/organisms/guardians/Navbar';
import { useRouter } from 'next/router';
import GreenCheck from '~/public/icons/success-check.svg';
import Confetti from 'confetti-js';
import { formatPrice } from '~/utils/orders';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import Head from 'next/head';
import DialogRating from '~/components/molecules/guardians/dialogs/DialogRating';
import { SEGMENT_RATING_CSAT_PAYMENT } from '~/utils/segmentKeys';
import { WHAT_SUCCESS } from '~/utils/linksWhatsapp';
import useIntersectionObserver from '~/hooks/useIntersectionObserver';
import Cookies from 'lib/Cookies';
import Box from 'components/atoms/common/Box';
import type { Session } from 'next-auth';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { GetServerSideProps } from 'next';
import { cn } from '~/lib/cn';
import { useSelectionStore, DependentFulfillmentOrder } from '@cometa/hooks';
import { api } from '~/utils/api';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import Accordion from '~/components/atoms/guardians/Accordion';
import currencyjs from 'currency.js';
import { Color } from '~/utils/colors';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { GuardianStudent } from '@cometa/trpc/src/types';

interface SuccessListProps {
  dependents: (GuardianStudent & Color)[];
  selectedItems: DependentFulfillmentOrder[];
}

const SuccessList = ({ dependents = [], selectedItems }: SuccessListProps) => {
  const selectedSchool = useSelectedSchool();

  return (
    <div className="flex flex-col space-y-6">
      {dependents.map((dependent) => {
        const items = selectedItems.filter((item) => item.student.id === dependent.id);

        if (!items.length) return null;

        const currency = items[0].currency || 'MXN';
        const total = formatPrice(
          items.reduce(
            (total, item) =>
              currencyjs(total).add('pending_amount' in item ? item.pending_amount : item.final_amount).value,
            0
          ),
          currency
        );
        const billingName = dependent.billing_guardian?.billing_name;
        return (
          <div key={dependent.id} id={`card-${dependent.id}`} className="flex flex-col">
            <div className="flex items-center px-[26px] py-5 bg-white rounded-t-2xl">
              <span className="text-sm font-semibold text-gray-300 mr-1.5">Estudiante:</span>
              <BoxColorText
                bgcolor={dependent?.color?.background}
                color={dependent?.color?.text}
                text={dependent.first_name.toUpperCase() || ''}
              />
            </div>
            <div className="px-[26px] py-5 bg-white border-t border-[#adbbcc4d]">
              <Accordion
                tittle={
                  <div className="flex items-center">
                    <span className="mr-3 text-sm font-semibold text-gray-300">Órdenes pagadas:</span>
                    <BoxColorText
                      bgcolor={dependent?.color?.background}
                      color={dependent?.color?.text}
                      text={items.length.toString()}
                    />
                  </div>
                }
              >
                <div className="flex flex-col gap-y-1.5 ">
                  {items.map((item) => {
                    const { id, name } = item;
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{name}</span>
                        <span className="text-blue-700">
                          {formatPrice('pending_amount' in item ? item.pending_amount : item.final_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Accordion>
            </div>
            <div
              className={cn(
                'px-[26px] flex flex-row justify-between text-sm font-semibold py-5 bg-white border-t border-[#adbbcc4d]',
                { 'rounded-b-2xl': !selectedSchool?.does_invoice }
              )}
            >
              <span className="text-gray-300">Total:</span>
              <span className="text-blue-700">{total}</span>
            </div>
            {selectedSchool?.does_invoice && (
              <>
                <div className="px-[26px] py-5 bg-white rounded-b-2xl border-t border-[#adbbcc4d]">
                  {dependent.billing_guardian ? (
                    <div className="flex flex-col gap-y-1.5 text-gray-300 text-sm">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-semibold">Facturación:</span>
                      </div>
                      <span>{billingName ?? 'Datos Incompletos'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-300">No hay facturación</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

function Success({ session, isMP }: { session: Session; isMP: boolean }) {
  const { data: dependents } = api.guardian.studentList.useQuery();
  const [userName, domainName] = session.user.email?.split('@') || ['', ''];
  const hiddenEmail = `${userName.substring(0, 3)}***@${domainName}`;
  const _router = useRouter();
  const { guardianHash, status = null } = _router.query;
  const { selectedItems, totalToPay, clear } = useSelectionStore();
  const currency = selectedItems[0]?.currency || 'MXN';
  const itemsQuantity = selectedItems?.length;
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const itemValues = useRef(Cookies.get('FULLFILMENT_VALUES'));
  const totalPayed = useMemo(() => (!isMP ? itemValues.current : { total: 0, subtotal: 0, commission: 0 }), [isMP]);
  const ref = useRef(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

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

  useSendPageViewedEvent('Pago Realizado');

  const goToHome = useCallback(() => {
    Cookies.delete('COMMISSION_VALUES');
    Cookies.delete('FULLFILMENT_VALUES');
    clear();
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
          <Box className="flex justify-between w-full text-sm font-semibold text-blue-100 mb-9">
            <span>Total pagado</span>
            <span>{!isMP ? formatPrice(totalPayed?.total || 0, currency) : calculateTotalForMP()}</span>
          </Box>
          <div className="w-full mb-11">
            {Boolean(itemsQuantity) && Boolean(dependents?.length) && (
              <SuccessList selectedItems={selectedItems} dependents={dependents ?? []} />
            )}
          </div>
          {totalPayed?.commission ? (
            <ol className="flex flex-col space-y-1.5 list-none m-0 p-0 px-1 text-gray-300 w-full text-sm">
              <li className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(totalPayed?.subtotal, currency)}</span>
              </li>
              <li className="flex justify-between font-normal">
                <span>Fee administrativo</span>
                <span>{formatPrice(totalPayed?.commission, currency)}</span>
              </li>
              <hr className="w-full border-0 border-t border-solid border-gray" />
              <li className="flex justify-between font-bold">
                <span>Total pagado</span>
                <span>{formatPrice(totalPayed?.total, currency)}</span>
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
                rel="noreferrer"
                target="_blank"
                href={WHAT_SUCCESS}
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
        destination: `/guardians/${params.guardianHash}/`,
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
