import { useSession } from 'next-auth/react';
import PendingCardAccordion from '~/components/molecules/guardians/PendingCardAccordion';
import Navbar from '~/components/Navbar';
import { useState } from 'react';
import Head from 'next/head';
import { WHAT_PAYMENT } from '~/utils/linksWhatsapp';
import HelpLink from '~/components/atoms/guardians/HelpLink';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { PartialPayin, Dependent, DiscountBreakdown, Guardian, Order } from '~/types/OrdersApi';
import Link from 'next/link';
import { cn } from '~/lib/cn';
import { BillingGuardian, GuardianDependentPayin, GuardianStudent, StatusDc1Enum } from '@cometa/trpc/src/types';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import dayjs from '~/lib/dayjs';
import { formatPrice } from '~/utils/orders';
import { Button } from '~/components/atoms/Button';
import ClockIcon from '~/public/icons/clock.svg';
import Trash from '~/public/icons/trash.svg';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/Accordion';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import BoxColorText from '~/components/Tag';
import { api } from '~/utils/api';
import { Color } from '~/utils/colors';
import useCheckoutStore from '~/stores/checkoutStore';
import { useRouter } from 'next/router';
import { useAlert } from '~/hooks';
import { useSendTrackEvent } from '@cometa/utils';
import LoadingButton from '~/components/molecules/LoadingButton';
import { DeletePendingDrawer } from '~/components/atoms/guardians/DeletePendingDrawer';
import Box from '~/components/atoms/common/Box';
import { OrderCardSkeleton } from '~/components/molecules/guardians/OrderCardSkeleton';
import AlertSmall from '~/public/icons/alert-small.svg';

export interface Payment {
  id: string;
  created: string;
  type: string;
  method: string;
  status: string;
  total: string;
  total_currency: string;
  orders: Order[];
  transaction: Transaction;
  dependents: PaymentDependent[];
  guardian: Guardian;
  commission: string;
  expiration: string | null;
  user_reports_as_paid: {
    is_paid: boolean;
    updated_at: Date;
  };
}
export interface Fulfillment {
  id: string;
  order_name: string;
  student: PaymentDependent;
  guardian: BillingGuardian;
  amount: string;
  final_amount: string;
  paid_date: string;
  status: string;
  interest: string;
  discount: string;
  discount_breakdown: DiscountBreakdown;
  is_manual: boolean;
  due_date: Date;
  paid_amount: string;
  has_partial_payins: boolean;
  collected_at_school: boolean;
  invoice: null;
  correlative_id: string;
  payout: null;
  pending_amount: string;
  payins: PartialPayin[];
}
export interface PaymentDependent extends Dependent {
  enrollment_code: string;
  level: string;
  section: string;
}
export interface Transaction {
  id: string;
  service: string;
  identifier: string;
  status: number;
  details: any;
}

interface CardTicketProps {
  payment: GuardianDependentPayin;
  dependents: (GuardianStudent & Color)[];
  onDeleted: (id: Payment['id']) => void;
  disabled?: boolean;
}

const CardTicket = ({ payment, onDeleted, dependents, disabled }: CardTicketProps) => {
  const [openAccordion, setOpenAccordion] = useState(false);
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const totalAmount = parseFloat((payment.transaction?.details as any)?.total_paid_amount || payment.total);
  const commission = parseFloat(payment.commission ?? '');
  const subTotalAmount = totalAmount - commission;
  const { setCashInData } = useCheckoutStore();
  const pdfURL = (payment.transaction?.details as any)?.pdfUrl || '';
  const isExpiredTicket = !dayjs(payment.created).isToday();
  const { data: session } = useSession({ required: true });
  const utils = api.useUtils();
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();
  const selectedSchoolId = useSelectedSchoolId();

  const { mutate, isLoading: isLoadingReportAsPaid } = api.payin.reportAsPaid.useMutation({
    onSuccess() {
      utils.payin.getGuardianPayins.invalidate({ schoolId: selectedSchoolId ?? '' });
    },
    onError() {
      setAlert('No es posible realizar esta acción en este momento');
    },
  });

  const {
    mutate: mutateCheckoutCashIn,
    isLoading: isLoadingCheckoutCashIn,
    isError: isErrorCheckoutCashIn,
    isIdle: isIdleCheckoutCashIn,
  } = api.kushki.checkoutCashIn.useMutation({
    onSuccess(data) {
      setCashInData(data);
      utils.orders.getSchoolOrders.invalidate();
      utils.orders.getGuardiansOptionalOrders.invalidate();
      _router.push({
        pathname: `/guardians/${guardianHash}/payments/cash-in/kushki/cash-in-pay-order`,
        query: { back: 'pendings' },
      });
    },
    onError() {
      setAlert('No es posible realizar esta acción en este momento');
    },
  });

  const {
    mutate: mutateDeletePayin,
    isLoading: isLoadingDeletePayin,
    isIdle,
    isError,
  } = api.payin.deletePayin.useMutation({
    onSuccess() {
      sendTrackEvent('portal: Pending Payment Deleted', session, { payinId: payment.id });
      const storedCheckoutOrders = (payment.orders as any).map((order: any) => ({
        order: order.id,
        student: order.dependent.id,
      }));
      mutateCheckoutCashIn({
        items: storedCheckoutOrders,
      });
    },
    onError() {
      setAlert('No es posible realizar esta acción en este momento');
    },
  });

  const isLoading = (!isErrorCheckoutCashIn && !isIdleCheckoutCashIn) || (!isIdle && !isError);

  const handleClickPaymentOrder = () => {
    const dataCashIn = {
      expiration_date: payment.expiration ?? (payment.transaction?.details as any)?.payment_expiry_formatted,
      ticket_number: (payment.transaction?.details as any)?.ticketNumber,
      pin: (payment.transaction?.details as any)?.pin,
      pdf_url: pdfURL,
      pin_barcode: (payment.transaction?.details as any)?.getPinBarCode,
      total: totalAmount,
      currency: payment.total_currency ?? 'MXN',
    };
    setCashInData(dataCashIn);
    _router.push({
      pathname: `/guardians/${guardianHash}/pendings/details/cash/kushki`,
      query: { back: 'pendings' },
    });
  };

  const onClickIWantToPay = () => {
    mutateDeletePayin({
      payinId: payment.id,
      schoolId: selectedSchoolId ?? '',
    });
  };
  const reportAsPaid = (payment?.user_reports_as_paid as any)?.is_paid ?? false;
  const reported48HoursAgo = dayjs().diff(dayjs((payment?.user_reports_as_paid as any)?.updated_at), 'hour') >= 48;

  return (
    <div
      className="inline-flex flex-col items-center justify-start bg-white rounded-2xl"
      data-test-id={`card-ticket-${payment.id}`}
    >
      <div className="inline-flex items-center self-stretch justify-between px-[26px] py-5 border-b border-zinc-300">
        <div className="font-semibold tracking-tight text-blue-800">
          Efectivo {dayjs(payment.created).format('DD/MM')}
        </div>
        <Button
          data-test-id="button-delete-pending"
          className="p-2 bg-transparent rounded-full shadow-none hover:bg-error/5 disabled:bg-transparent disabled:cursor-not-allowed"
          onClick={() => {
            onDeleted(payment.id);
          }}
          disabled={isLoading || isLoadingReportAsPaid || disabled}
        >
          <Trash />
        </Button>
      </div>
      {!reportAsPaid && (
        <div className="self-stretch px-[26px] py-5 border-b border-zinc-300 justify-start items-center gap-1.5 inline-flex">
          {isExpiredTicket ? (
            <>
              <ClockIcon className="w-[18px] h-[18px] self-start text-error" />
              <div className="inline-flex flex-col items-start justify-center gap-1 grow shrink basis-0">
                <span className="text-sm font-medium tracking-tight text-error">Orden vencida</span>
                <span className="self-stretch text-sm font-normal tracking-tight text-gray-300">
                  Debes generar una nueva orden de pago.
                </span>
              </div>
            </>
          ) : (
            <>
              <ClockIcon className="w-[18px] h-[18px] self-start text-secondary" />
              <div className="inline-flex flex-col items-start justify-center gap-1 grow shrink basis-0">
                <span className="text-sm font-medium tracking-tight text-gray-800">Vence hoy a las 23:59</span>
                <span className="self-stretch text-sm font-normal tracking-tight text-gray-300">
                  Creado hace {dayjs.duration(dayjs().diff(dayjs(payment.created))).humanize()}
                </span>
              </div>
            </>
          )}
        </div>
      )}
      <div className="self-stretch px-[26px] py-5 border-b border-zinc-300 flex-col justify-start items-start gap-1.5 flex">
        <Accordion type="single" value={openAccordion ? 'detail' : ''} className="self-stretch">
          <AccordionItem value="detail" className="w-full">
            <AccordionTrigger
              className="w-full"
              onClick={() => {
                setOpenAccordion(!openAccordion);
              }}
            >
              <div className="inline-flex items-center self-stretch justify-between text-gray-300">
                <span className="text-sm font-semibold">Detalles:</span>
                <ExpandMore className="group-data-[state=open]:rotate-180 transition-transform ease-[cubic-bezier(0.87,_0,_0.13,_1)]" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2.5 mt-2.5">
                {dependents.map((dependent) => {
                  const listOrders = (payment.orders as any)
                    .filter((order: any) => order.dependent.id === dependent.id)
                    .map((order: any) => (
                      <div key={order.id} className="inline-flex items-center justify-between h-6">
                        <span className="text-sm tracking-tight text-gray-300">{order.name}</span>
                        <span className="text-sm text-right text-blue-700">
                          {formatPrice(order?.final_amount ?? 0, order.price_currency)}
                        </span>
                      </div>
                    ));

                  if (!listOrders.length) return null;

                  return (
                    <div key={dependent.id}>
                      <div className="mt-5 mb-2.5">
                        <span className="mr-3 text-sm font-semibold tracking-tight text-gray-300">
                          Órdenes por pagar
                        </span>
                        <BoxColorText
                          text={dependent.first_name}
                          bgcolor={dependent.color?.background}
                          color={dependent.color?.text}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">{listOrders}</div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="self-stretch px-[26px] py-5 border-b border-zinc-300">
        {!!commission && (
          <>
            <div className="inline-flex items-center justify-between w-full text-sm font-semibold text-gray-600">
              <span className="tracking-tight grow shrink basis-0">Subtotal a pagar:</span>
              <span className="text-right">{formatPrice(subTotalAmount, payment?.total_currency)}</span>
            </div>
            <div className="inline-flex items-center justify-between w-full text-sm font-semibold text-gray-600">
              <span className="tracking-tight grow shrink basis-0">Fee administrativo:</span>
              <span className="text-right">{formatPrice(commission, payment?.total_currency)}</span>
            </div>
          </>
        )}
        <div className="flex flex-col gap-y-2.5">
          <div className="inline-flex items-center justify-between w-full font-semibold">
            <span className="tracking-tight text-gray-300 grow shrink basis-0">Total a pagar:</span>
            <span className="text-lg text-right text-blue-700">
              {formatPrice(totalAmount, payment?.total_currency)}
            </span>
          </div>
          <div className="text-xs font-medium text-gray-300 px-[18px] py-2.5 bg-[#E6E9FF] rounded-lg justify-center items-center flex-row">
            <span className="font-semibold">Paga el monto exacto</span>{' '}
            <span>que figura aquí y hacerlo en un solo pago.</span>
          </div>
        </div>
      </div>
      {reportAsPaid ? (
        <div className="px-[26px] py-5 flex-col justify-center items-start gap-2.5 inline-flex">
          {reported48HoursAgo ? (
            <div className="text-sm font-medium tracking-tight text-gray-300">
              <span className="font-semibold">Por el momento su pago está en revisión,</span>
              <span>
                {' '}
                no se preocupe le enviaremos un correo de confirmación cuando se haya acreditado. <br />
                <br />
                Para cualquier duda o consulta puede comunicarse con nosotros.
              </span>
            </div>
          ) : (
            <>
              <div className="self-stretch justify-center items-center gap-2.5 inline-flex">
                <div className="justify-center items-center gap-2.5 flex">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full shadow bg-[#00D685]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" viewBox="0 0 9 8" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.86953 1.17502C8.20451 1.47361 8.234 1.98723 7.93541 2.32222L3.25204 7.57627L0.472322 5.0621C0.139512 4.76108 0.113738 4.24727 0.414755 3.91445C0.715772 3.58164 1.22959 3.55587 1.5624 3.85689L3.12814 5.27305L6.72233 1.2409C7.02092 0.905915 7.53454 0.876419 7.86953 1.17502Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold tracking-tight text-gray-300 grow shrink basis-0">
                  Gracias por confirmar el pago.
                </div>
              </div>
              <div className="self-stretch pl-8 justify-center items-center gap-2.5 inline-flex">
                <div className="grow shrink basis-0">
                  <span className="text-sm tracking-tight text-gray-300">Recuerda que el pago </span>
                  <span className="text-sm font-medium tracking-tight text-gray-300">
                    podría verse reflejado en un máximo de 48 hs.
                  </span>
                </div>
              </div>
              <div className="pl-8 justify-center items-start gap-2.5 inline-flex self-stretch">
                <div className="w-full h-px border-b border-zinc-300" />
              </div>
              <div className="self-stretch pl-8 justify-center items-center gap-2.5 inline-flex">
                <div className="text-sm tracking-tight text-gray-300 grow shrink basis-0">
                  Si confirmaste el pago por error por favor comuníquese con nosotros.
                </div>
              </div>
            </>
          )}
          <div
            className={cn('flex-col justify-center items-center gap-0.5 flex', {
              'pl-8': !reported48HoursAgo,
            })}
          >
            <HelpLink href={WHAT_PAYMENT} className="font-normal no-underline border-b border-blue-100">
              Contactarme
            </HelpLink>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center self-stretch justify-center gap-4 px-[26px] py-5">
          <Button
            className="self-stretch px-8 py-3 text-sm font-medium"
            disabled={isLoading || isLoadingReportAsPaid || disabled}
            onClick={() => {
              mutate({
                payinId: payment.id,
                schoolId: selectedSchoolId ?? '',
                data: {
                  is_paid: true,
                },
              });
            }}
          >
            Ya pagué
          </Button>
          {isExpiredTicket ? (
            <LoadingButton
              className="inline-flex items-center self-stretch justify-center py-3 text-sm font-medium text-center text-blue-100 bg-transparent shadow-none px-7 hover:text-blue-100/80 hover:bg-transparent active:bg-transparent active:text-blue-100/50 disabled:bg-transparent disabled:cursor-not-allowed"
              onClick={onClickIWantToPay}
              loading={isLoadingCheckoutCashIn || isLoadingDeletePayin}
              disabled={isLoading || isLoadingReportAsPaid || disabled}
            >
              Generar una nueva orden
            </LoadingButton>
          ) : (
            <Button
              className="inline-flex items-center self-stretch justify-center py-3 text-sm font-medium text-center text-blue-100 bg-transparent shadow-none px-7 hover:text-blue-100/80 hover:bg-transparent active:bg-transparent active:text-blue-100/50 disabled:bg-transparent disabled:cursor-not-allowed"
              onClick={handleClickPaymentOrder}
              disabled={isLoading || isLoadingReportAsPaid || disabled}
            >
              Ver orden de pago
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const modalLabels = (type: 'ticket' | 'transfer') => {
  if (type === 'ticket') {
    return {
      title: <h4 className="text-xl font-bold text-center">¿Estás seguro que deseas eliminar el pago en proceso?</h4>,
      description: (
        <p>
          Las órdenes volverán al estado <span className="font-semibold">Por Pagar</span> y los montos podrían variar
          según recargos.
        </p>
      ),
    };
  } else {
    return {
      title: (
        <h4>
          Si ya realizaste la transferencia
          <span className="font-semibold">no debes eliminar el pago en proceso. </span>
        </h4>
      ),
      description: (
        <>
          <span>Si efectuaste la transferencia,</span>
          <span className="font-semibold">
            el eliminar no cancela la transferencia que realizaste en tu banco.
          </span>{' '}
          <span>Tendrás que pagar nuevamente las órdenes que incluía este pago.</span>
        </>
      ),
    };
  }
};

function Pendings() {
  const { data: session } = useSession({ required: true });
  const [open, setOpen] = useState<{ open: boolean; type: 'ticket' | 'transfer' | null }>({ open: false, type: null });
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const selectedSchoolId = useSelectedSchoolId();
  const { data: dependents } = api.guardian.studentList.useQuery();
  const _router = useRouter();

  const {
    data: payments,
    refetch,
    isLoading: isLoadingPayins,
    isFetching: isFetchingPayments,
  } = api.payin.getGuardianPayins.useQuery(
    {
      schoolId: selectedSchoolId ?? '',
      statuses: [StatusDc1Enum.WAITING_PAID],
    },
    {
      retry: 3,
    }
  );

  useSendPageViewedEvent('Pagos en Proceso');

  const handleSelected = (paymentId: string) => {
    setOpen({ open: true, type: 'transfer' });
    setPaymentId(paymentId);
  };

  const handleSelectedToDeleteTicket = (paymentId: string) => {
    setOpen({ open: true, type: 'ticket' });

    setPaymentId(paymentId);
  };
  const handleClose = () => {
    setOpen({ open: false, type: null });
  };

  const handleDeleted = async () => {
    refetch();
  };

  if (isLoadingPayins)
    return (
      <div className="pt-4 space-y-5">
        <Box className="flex flex-col w-2/3 h-2 p-4 animate-pulse bg-slate-200" />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );

  return (
    <>
      <TitleBackButton
        title="Pagos en proceso"
        onClick={() => {
          _router.push(`/guardians/${session?.user?.hash}`);
        }}
      />
      {payments?.length ? (
        <>
          <div className="flex flex-col items-center justify-center mx-6 mt-5 mb-[35px] text-gray-300 gap-y-4">
            <div>
              <p className="font-semibold">Si quieres cambiar de método de pago:</p>
              <p>Elimina el pago en proceso que quieres cambiar y vuelve a realizar el pago.</p>
            </div>
            <div className="px-[18px] py-2.5 bg-[#E6E9FF] rounded-lg justify-center items-center gap-2.5 inline-flex">
              <div className="flex items-start self-stretch justify-center py-1">
                <AlertSmall width={16} height={16} />
              </div>
              <div className="text-sm text-gray-300 grow shrink basis-0">
                <span className="font-normal">Recuerda que</span>
                <span className="font-semibold"> si ya pagaste, no debes eliminar el pago en proceso.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-5 space-y-6" data-testid="payments-list">
            {payments?.map((payment) => {
              const {
                id,
                method,
                total_currency: totalCurrency,
                commission,
                orders,
                guardian,
                created,
                total,
                type,
                expiration,
              } = payment;
              const details = payment.transaction?.details;
              const payment_expiry_formatted = (details as any)?.payment_expiry_formatted;
              const guardianName = `${guardian.first_name} ${guardian.last_name}`;

              if (type === 'ticket')
                return (
                  <CardTicket
                    key={id}
                    payment={payment}
                    dependents={dependents ?? []}
                    onDeleted={(id) => {
                      handleSelectedToDeleteTicket(id);
                    }}
                    disabled={isFetchingPayments}
                  />
                );
              // FIXME: fix types
              return (
                <PendingCardAccordion
                  key={id}
                  method={method as string}
                  type={type}
                  currency={totalCurrency}
                  transactionDetails={details}
                  totalAmount={(details as any)?.total_paid_amount || parseFloat(total)}
                  orders={orders as any}
                  dependents={dependents ?? []}
                  guardianName={guardianName}
                  created={created}
                  commission={commission as string}
                  payinExpirationDate={expiration ?? payment_expiry_formatted ?? ''}
                  onSelected={() => {
                    handleSelected(id);
                  }}
                  payment={payment}
                  disabled={isFetchingPayments}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="inset-0 flex flex-col items-center justify-center h-[calc(100vh_-_87px_-_58px_-_24px_-_40px)]">
          <p className="text-2xl text-center text-[#57537A] mb-3 font-bold">Ya no tienes ningún pago en proceso</p>
          <span className="text-[#57537A] text-center max-w-[17rem] text-base mb-7">
            Vuelve al home para poder realizar tus pagos
          </span>
          <Link
            className={cn(
              'py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100',
              'disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6]',
              'w-full max-w-[17.3rem] text-center'
            )}
            href={`/guardians/${session?.user?.hash}`}
          >
            Volver al Home
          </Link>
        </div>
      )}
      <div className="flex flex-col items-center self-stretch">
        <DeletePendingDrawer
          open={open.open}
          onClose={handleClose}
          onDeleted={handleDeleted}
          payinId={paymentId ?? ''}
          labels={modalLabels(open.type ?? 'transfer')}
        />
      </div>
      <div className="h-full my-4">
        <HelpLink href={WHAT_PAYMENT} />
      </div>
    </>
  );
}

Pendings.auth = true;

Pendings.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <>
      <Head>
        <title>Pagos en proceso</title>
      </Head>
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>
      <div className="w-full max-w-md mx-auto">{page}</div>
    </>
  );
};

export default Pendings;
