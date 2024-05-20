import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import ApiClient from '/src/services/ApiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import FulfillmentChip from './FulfillmentChip';
import Download from '/public/assets/icons/ic_download.svg';
import { formatDateShort, formatTime, payMethods, formatPrice, formatDateNumeric } from '/src/utils/general';
import { Tooltip } from 'src/components/atoms/Tooltip';
import { Status } from '/types/paid-orders';
import InvoiceChip from '/src/components/atoms/Chip';
import cx from 'classnames';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import LinkDetail from '/src/components/atoms/LinkDetail';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import Info from '/public/assets/icons/info.svg';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { cn } from '/src/utils/cn';
import Link_To from '/public/assets/icons/ic_link_to.svg';
import { Fulfillment, PartialPayin, PayinFulfillment } from '/types/due-orders';
import { api } from '/src/utils/api';
import Sheet, { useValidateId } from '/src/components/atoms/Sheet';
import PayinSidepanel from '../PayinSidepanelDetail';
import PayoutDetail from '../PayoutSidebarDetail';
import { DeletePayinAlert } from '/src/pages/income';
import { trimId } from '/src/utils/trim-id';
import CAlert from '/src/components/atoms/CAlert';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import Dialog from '/src/components/atoms/Dialog';
import { QUERY_KEY_DUE_ORDERS_STUDENT, QUERY_KEY_ORDERS_FOR_PAY_DETAIL } from '/src/utils/reactQueryKeys';
import { sendTrackEvent } from '/src/utils/events';
import { Events } from '/src/constants/events';
import { AxiosError } from 'axios';
import useAlert from '/src/hooks/useAlert';
import { ChipVariants } from '/src/components/atoms/Chip';
import { VariantProps } from 'class-variance-authority';

interface IFulfillmentDetailProps {
  onClose: () => void;
  paymentId: string;
  open?: boolean;
  sponsored?: boolean;
}
export default function FulfillmentDetail({ onClose, paymentId, open, sponsored = false }: IFulfillmentDetailProps) {
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const queryClient = useQueryClient();
  const selectedSchool = useSelectedSchool();
  const [payMethodName, setPayMethodName] = useState<string>('');
  const checkId = useValidateId();
  const [selectedPayin, setSelectedPayin] = useState<{ id: string; partial: boolean } | null>(null);
  const [isPayinDeletedDone, setIsPayinDeletedDone] = useState(false);
  const [payinDeleted, setPayinDeleted] = useState<{ first_name: string; last_name: string; date: string } | null>(
    null
  );
  const defaultDeleteDiscount = { id: '', discount: 0 };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);

  const main = async (): Promise<Fulfillment> => {
    const res = await ApiClient.getSchoolFulfillment(session?.token || '', selectedSchool?.id || '', paymentId);
    return res.data as Fulfillment;
  };

  const { data: fulfillment, isLoading } = useQuery<Fulfillment>(['fulfillment_detail', paymentId], main, {
    enabled: !!selectedSchool && !!paymentId,
    onSuccess: (data) => {
      const payMethod = !data.has_partial_payins && payMethods.find((method) => method.id === data.payins[0]?.type);
      setPayMethodName(payMethod ? payMethod?.label : '');
    },
    onError(err) {
      Sentry.captureException(err);
    },
  });

  const utils = api.useUtils();

  const mutationDeleteDiscount = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      queryClient.invalidateQueries({ queryKey: ['schoolFulfillments'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS_FOR_PAY_DETAIL] });
      utils.manualPayments.fulfillments.invalidate();
      sendTrackEvent(Events.manual_pay_discount_deleted, { source: 'dashboard' });
    },
    onError(err: AxiosError | Error | any, variables) {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          err.response?.data?.detail === 'You do not have permission to perform this action.'
            ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
            : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      sendTrackEvent(Events.manual_pay_discount_deleted_error, { source: 'dashboard' });
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId: student?.id,
          variables,
          session,
          selectedSchool,
        });
        return scope;
      });
    },
  });

  useEffect(() => {
    if (selectedSchool?.id && fulfillment?.payin_id) {
      utils.income.getPayinById.prefetch({
        schoolId: selectedSchool.id,
        payinId: fulfillment?.payin_id,
      });
      utils.guardian.getGuardianById.prefetch({
        schoolId: selectedSchool.id,
        id: fulfillment.guardian.id,
      });
    }
  }, [fulfillment]);

  const fulfillmentStatus = {
    PAID: 'Pagado',
    PARTIAL_PAID: 'Pago parcial',
    DUE: 'Pendiente',
  };

  const PayoutStatus = ({ status, loading, children }: { status: string; loading: boolean; children: ReactNode }) => {
    const classNames = cx('text-sm px-2 w-fit py-1 rounded-md font-bold text-center', {
      'text-successText bg-[#54D62C]/16': status === 'APPROVED_STATUS',
      'text-processingText bg-warning/16': status === 'PROCESSING_STATUS',
      'text-info bg-info/12': status === 'SCHEDULED_STATUS',
      'text-gray-700 bg-gray-500/12': status === 'PENDING_STATUS',
    });
    return loading ? <SkeletonText className="h-4 w-28" /> : <span className={classNames}>{children}</span>;
  };

  const invoiceStatus = {
    success: 'success',
    pending: 'info',
    canceled: 'error',
    canceling: 'error',
    not_requested: 'disabled',
    failed: 'warning',
    multiple: 'neutral',
    sponsored: 'disabled',
  } as const;

  const payoutStatus = {
    APPROVED_STATUS: 'Recibido',
    PROCESSING_STATUS: 'Pago iniciado',
    SCHEDULED_STATUS: 'Programado',
    PENDING_STATUS: 'Pendiente',
  };

  const invoiceStatusI18N: Record<Status, { status: string; tooltip?: string }> = {
    success: {
      status: 'Emitida',
    },
    pending: {
      status: 'Por emitir',
      tooltip: `La factura se emitirá hoy a las ${selectedSchool?.config_dashboard?.emit_invoice_time || '11:59'}`,
    },
    canceled: {
      status: 'Cancelada',
      tooltip: 'Esta factura ha sido cancelada manualmente',
    },
    canceling: {
      status: 'Por cancelar',
      tooltip: 'Se ha solicitado la cancelación de esta factura',
    },
    not_requested: {
      status: 'No facturable',
      tooltip: 'No se ha solicitado la emisión de una factura',
    },
    failed: {
      status: 'En revisión',
      tooltip: 'Hemos detectado inconsistencias con esta factura.',
    },
    multiple: {
      status: 'Múltiples',
      tooltip: 'Esta orden ha recibido múltiples pagos parciales',
    },
    sponsored: {
      status: 'Sin factura',
    },
  };

  const failOriginMessage = {
    guardian:
      'Se deben corregir los datos del tutor para poder facturar.  Cometa ya le envió una notificación al tutor.',
    student: 'Se debe corregir los datos del alumno para poder facturar. Cometa se pondrá en contacto con la familia.',
    school:
      'El equipo de Cometa estará en contacto para revisar los datos fiscales de la institución antes del fin del mes.',
    cometa: 'No hace falta tomar acción. Estas facturas se emitirán exitosamente antes del fin del mes.',
    facturama: 'No hace falta tomar acción. Estas facturas se emitirán exitosamente antes del fin del mes.',
  } as { [key: string]: string };

  const student = fulfillment?.student;

  const totalLabel =
    !fulfillment?.has_partial_payins || fulfillment?.status === 'PAID' ? 'Total Pagado' : 'Pendiente a pagar';

  const totalPrice =
    !fulfillment?.has_partial_payins || fulfillment?.status === 'PAID'
      ? Number(fulfillment?.final_amount)
      : Number(fulfillment?.pending_amount);

  const key = trimId(paymentId);
  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        id={key}
        key={key}
      >
        <Sheet.Content>
          <div className="flex flex-col flex-auto h-full">
            <div className="sticky top-0 z-10 w-full px-8 bg-white">
              {sponsored ? (
                <CAlert className="my-4" type="success" message='¡Esta orden cambió de estado a "Pagado"!' />
              ) : (
                <SidebarHeader
                  title="Detalle de la orden"
                  subtitle={fulfillment?.correlative_id ?? 'ID por generar'}
                  onClose={onClose}
                  subClassName={
                    !fulfillment?.correlative_id ? 'text-[#919EAB] italic text-base font-medium' : undefined
                  }
                />
              )}
            </div>
            <div className="flex flex-col justify-between h-full">
              <div className="px-8 mt-1 mb-2">
                <div id="order-data">
                  <HeaderLabel>DATOS DE LA ORDEN</HeaderLabel>
                  <div className="mt-8">
                    {fulfillment?.correlative_id && (
                      <Container className="mt-4">
                        <Title text="ID de orden:" />
                        <Value
                          text={fulfillment.correlative_id ?? 'ID por generar'}
                          loading={isLoading}
                          loaderWidth={30}
                          className={
                            !fulfillment?.correlative_id ? 'text-[#919EAB] italic text-sm font-semibold' : undefined
                          }
                        />
                      </Container>
                    )}
                    <Container className="mt-4">
                      <Title text="Estado:" />
                      <div className="col-span-2">
                        <FulfillmentChip intent={fulfillment?.status || 'PARTIAL_PAID'} as="span" loading={isLoading}>
                          {fulfillmentStatus[fulfillment?.status || 'PARTIAL_PAID']}
                        </FulfillmentChip>
                      </div>
                    </Container>
                    {student && (
                      <Container className="mt-4">
                        <Title text="Estudiante:" />
                        <div className="col-span-3 w-fit">
                          <LinkDetail
                            href={`/student/detail/${student.id}`}
                            text={`${student.first_name} ${student.last_name}`}
                            message="Ver detalle de estudiante"
                            loading={isLoading}
                          />
                        </div>
                      </Container>
                    )}
                    <Container className="mt-4">
                      <Title text="Concepto:" />
                      <Value text={fulfillment?.order_name || ''} loading={isLoading} />
                    </Container>
                    <Container className="mt-4">
                      <Title text="Fecha de vcto:" />
                      <Value
                        text={formatDateShort(fulfillment?.due_date || '', true)}
                        loading={isLoading}
                        loaderWidth={30}
                      />
                    </Container>
                  </div>
                </div>
                <div id="payment_detail" className="mt-11">
                  <HeaderLabel>
                    {fulfillment?.has_partial_payins ? 'DETALLE DE PAGOS PARCIALES' : 'DETALLE DEL PAGO'}
                  </HeaderLabel>
                  {fulfillment?.is_sponsored && (
                    <CAlert
                      type="info"
                      className="mt-6 bg-info/12 text-info"
                      message={`Esta orden se marcó automaticamente como "Pagada" el
                      ${formatDateNumeric(
                        fulfillment?.paid_date || ''
                      )} ya que tuvo becas o descuentos y el total a pagar llegó a $0.00`}
                    />
                  )}
                  {!fulfillment?.has_partial_payins && !fulfillment?.is_sponsored && (
                    <>
                      {fulfillment?.payin_correlative_id && (
                        <Container className="mt-4 grid-cols-[repeat(4,minmax(auto,1fr))]">
                          <Title text="ID de pago:" />
                          <Tooltip message="Ver detalle del pago" disableClick={false}>
                            <Value
                              text={fulfillment.payin_correlative_id || ''}
                              loading={isLoading}
                              loaderWidth={30}
                              onClick={() =>
                                checkId(
                                  trimId(fulfillment.payin_id as string),
                                  'Ya tienes abierto este pago en un panel anterior.',
                                  () => setSelectedPayin({ id: fulfillment.payin_id as string, partial: false })
                                )
                              }
                            />
                          </Tooltip>
                        </Container>
                      )}
                      <Container className="mt-4">
                        <Title text="Pagador:" />
                        <div className="col-span-3 w-fit">
                          <LinkDetail
                            href={`/guardian/${fulfillment?.guardian?.id}`}
                            text={`${fulfillment?.guardian?.first_name} ${fulfillment?.guardian?.last_name}`}
                            message="Ver detalle de tutor"
                            loading={isLoading}
                          />
                        </div>
                      </Container>
                      <Container className="mt-4">
                        <Title text="Fecha de pago:" />
                        <div className="flex col-span-3 w-fit">
                          {isLoading ? (
                            <SkeletonText />
                          ) : (
                            <>
                              <Value text={formatDateShort(fulfillment?.payins[0]?.paid_date || '', true)} />
                              <div className="w-px mx-2 border border-l-gray-500/24" />
                              <Value text={formatTime(fulfillment?.payins[0]?.paid_date || '')} />
                            </>
                          )}
                        </div>
                      </Container>
                      <Container className="mt-4">
                        <Title text="Medio de pago:" />
                        <Value text={payMethodName} loading={isLoading} />
                      </Container>
                      {!fulfillment?.has_partial_payins &&
                        fulfillment?.invoice_status &&
                        (fulfillment?.invoice_status !== 'failed' ? (
                          <Container className="mt-4">
                            <Title text="Estado de factura:" />
                            {!isLoading ? (
                              <Tooltip message={invoiceStatusI18N[fulfillment?.invoice_status].tooltip}>
                                <InvoiceChip intent={invoiceStatus[fulfillment?.invoice_status]}>
                                  {invoiceStatusI18N[fulfillment?.invoice_status].status}
                                </InvoiceChip>
                              </Tooltip>
                            ) : (
                              <SkeletonText className="h-4 w-28" />
                            )}
                          </Container>
                        ) : (
                          <>
                            <div className="flex flex-row mt-4 gap-4">
                              <Title text="Estado de factura:" />
                              {!isLoading ? (
                                <>
                                  <InvoiceChip intent={invoiceStatus[fulfillment?.invoice_status]}>
                                    {invoiceStatusI18N[fulfillment?.invoice_status].status}
                                  </InvoiceChip>
                                </>
                              ) : (
                                <SkeletonText className="h-4 w-28" />
                              )}
                            </div>
                            <Container className="mt-4">
                              <Title text="" />
                              <span className="text-[#637381] text-xs font-normal col-span-3 pr-6">
                                {failOriginMessage[fulfillment?.payins[0]?.invoices[0]?.fail_origin ?? 'cometa']}
                              </span>
                            </Container>
                          </>
                        ))}
                      {!fulfillment?.has_partial_payins &&
                        fulfillment?.payin_fulfillments[0]?.invoice &&
                        fulfillment?.payin_fulfillments[0]?.invoice?.pdf_url &&
                        fulfillment?.payin_fulfillments[0]?.invoice?.fiscal_identifier && (
                          <Container className="mt-4">
                            <Title text="Folio de factura:" />
                            <a
                              href={fulfillment?.payin_fulfillments[0]?.invoice?.pdf_url}
                              className="flex items-center col-span-3 cursor-pointer w-fit"
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              <label className="mr-2 text-sm font-normal cursor-pointer">
                                {fulfillment?.payin_fulfillments[0]?.invoice?.fiscal_identifier}
                              </label>
                              <Download fill="currentColor" className="text-blue-secondary-200" />
                            </a>
                          </Container>
                        )}
                      {!fulfillment?.has_partial_payins &&
                        fulfillment?.payin_fulfillments[0]?.invoice &&
                        fulfillment?.payin_fulfillments[0]?.invoice && (
                          <Container className="mt-4">
                            <Title text="Facturado a:" />
                            <span className="col-span-3">
                              <p className="text-sm font-bold">
                                {fulfillment?.payin_fulfillments[0]?.invoice.billing_name}
                              </p>
                              <p className="text-xs">{fulfillment?.payin_fulfillments[0]?.invoice.tax_id}</p>
                            </span>
                          </Container>
                        )}
                      <Container className="mt-4">
                        <Title text="Lugar de pago:" />
                        <PlaceToPay
                          at_school={fulfillment?.payins?.[0]?.collected_at === 'collected_at_school'}
                          loading={isLoading}
                        />
                      </Container>
                      <Container className="mt-4">
                        <Title text="Recibo:" />
                        <LinkToReceipt
                          href={`/receipt?school_id=${selectedSchool?.id}&payin_id=${fulfillment?.payins[0]?.id}`}
                        />
                      </Container>
                    </>
                  )}
                  {fulfillment?.has_partial_payins &&
                    !fulfillment?.is_sponsored &&
                    fulfillment?.payin_fulfillments?.map((payinFulfillment) => {
                      const payin = fulfillment.payins.find((p) => p.id === payinFulfillment.payin);

                      if (!payin) return null;

                      return (
                        <BoxPartialPayin
                          key={payinFulfillment.id}
                          payin={payin}
                          payinFulfillment={payinFulfillment}
                          isLoading={isLoading}
                          schoolId={selectedSchool?.id ?? ''}
                          collectedAt={payin?.collected_at || ''}
                          failOriginMessage={failOriginMessage}
                          onClick={() =>
                            checkId(trimId(payin.id), 'Ya tienes abierto este pago en un panel anterior.', () =>
                              setSelectedPayin({ id: payin.id, partial: true })
                            )
                          }
                        />
                      );
                    })}
                </div>
                {!fulfillment?.collected_at_school &&
                  !fulfillment?.is_sponsored &&
                  !fulfillment?.has_partial_payins && (
                    <div id="payout_detail" className="mt-11">
                      <HeaderLabel>DETALLE DEL DEPÓSITO</HeaderLabel>
                      <Container className="mt-4">
                        <Title text="Estado de depósito:" />
                        <PayoutStatus status={fulfillment?.payout?.status ?? 'PENDING_STATUS'} loading={isLoading}>
                          {payoutStatus[(fulfillment?.payout?.status as keyof typeof payoutStatus) || 'PENDING_STATUS']}
                        </PayoutStatus>
                      </Container>

                      {fulfillment?.payout?.correlative_id && (
                        <Container className="mt-4 grid-cols-[repeat(4,minmax(auto,1fr))]">
                          <Title text="ID de depósito:" />

                          <Tooltip message="Ver detalle del depósito" disableClick={false}>
                            <Value
                              text={fulfillment.payout.correlative_id}
                              onClick={() =>
                                checkId(
                                  trimId(fulfillment.payout.id),
                                  'Ya tienes abierto este depósito en un panel anterior.',
                                  () => setSelectedPayout(fulfillment.payout.id)
                                )
                              }
                            />
                          </Tooltip>
                        </Container>
                      )}
                      {fulfillment?.payout && (
                        <Container className="mt-4">
                          <Title text="Fecha de depósito:" />
                          <div className="flex col-span-3 w-fit">
                            {isLoading ? (
                              <SkeletonText />
                            ) : (
                              <>
                                <Value
                                  text={formatDateShort(
                                    fulfillment.payout.deposit_date || fulfillment.payout.scheduled_date,
                                    true
                                  )}
                                />
                                {fulfillment.payout.deposit_date && (
                                  <>
                                    <div className="w-px mx-2 border border-l-gray-500/24" />
                                    <Value
                                      text={formatTime(
                                        fulfillment.payout.deposit_date || fulfillment.payout.scheduled_date
                                      )}
                                    />
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </Container>
                      )}
                    </div>
                  )}
              </div>
              <ContainerPaymentDetail id="payment_amount_detail">
                <Container className="grid-cols-2">
                  <AmountTitle text="Monto original:" loading={isLoading} />
                  <label className="text-sm font-normal justify-self-end">
                    {formatPrice(fulfillment?.amount || '', 'MXN')}
                  </label>
                </Container>
                {fulfillment?.guardian_commission && !!Number(fulfillment?.guardian_commission) && (
                  <Container className="grid-cols-2">
                    <AmountTitle text="Comisión + IVA:" loading={isLoading} />
                    <label className="text-sm font-normal justify-self-end">
                      {formatPrice(fulfillment?.guardian_commission, 'MXN')}
                    </label>
                  </Container>
                )}
                {fulfillment?.discount_breakdown.details?.early_bird && (
                  <Container className="grid-cols-2">
                    <AmountTitle text="Descuento pronto pago:" loading={isLoading} />
                    <label className="text-sm font-normal justify-self-end">
                      -{formatPrice(fulfillment?.discount_breakdown.details.early_bird.total, 'MXN')}
                    </label>
                  </Container>
                )}
                {fulfillment?.discount_breakdown.details?.scholarships?.details.map((item) =>
                  item.active ? (
                    <Container key={`discount-breakdown-detail-${item.id}`} className="grid-cols-2">
                      <AmountTitle text={item.name} loading={isLoading} />
                      <label className="text-sm font-normal justify-self-end">
                        -{formatPrice(item.discount, 'MXN')}
                      </label>
                    </Container>
                  ) : fulfillment?.status !== 'DUE' ? (
                    <Container key={item.id} className="grid-cols-2">
                      <AmountTitle
                        text={item.name}
                        loading={isLoading}
                        message="El beneficio de la beca se ha eliminado de esta orden debido a que se encuentra vencida."
                        lineThrough
                      />
                      <label className="text-sm font-normal line-through justify-self-end">
                        -{formatPrice(item.discount, 'MXN')}
                      </label>
                    </Container>
                  ) : null
                )}
                {fulfillment?.discount_breakdown.details?.special?.details.map((item) => (
                  <Container key={item.id} className="grid-cols-2">
                    <div className="flex items-center gap-1">
                      <AmountTitle
                        text={`"${item.name}"`}
                        loading={isLoading}
                        className="text-[#212B36] font-semibold text-sm"
                      />
                      {item.type !== TypeSpecialDiscount.INTEREST_FORG && fulfillment?.is_sponsored && (
                        <button
                          className="bg-transparent"
                          onClick={() => {
                            const { id, discount } = item;
                            setDeleteDiscount({ id, discount });
                          }}
                        >
                          <IcTrash className="text-error" />
                        </button>
                      )}
                    </div>
                    <label className="text-sm font-normal justify-self-end">-{formatPrice(item.discount, 'MXN')}</label>
                  </Container>
                ))}
                {fulfillment?.has_partial_payins &&
                  fulfillment?.payin_fulfillments?.map((partial) => (
                    <Container key={partial.id} className="grid-cols-2">
                      <AmountTitle
                        text={`Pago parcial (${formatDateShort(partial?.paid_date, true)})`}
                        loading={isLoading}
                      />
                      <label className="text-sm font-normal justify-self-end">
                        -{formatPrice(partial?.total_paid, 'MXN')}
                      </label>
                    </Container>
                  ))}
                {fulfillment?.interest && !!Number(fulfillment.interest) && (
                  <Container className="grid-cols-2">
                    <AmountTitle text="Recargo:" loading={isLoading} />
                    <label className="text-sm font-normal justify-self-end">
                      +{formatPrice(fulfillment.interest, 'MXN')}
                    </label>
                  </Container>
                )}
                <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
                  {isLoading ? (
                    <SkeletonText className="w-24" />
                  ) : (
                    <>
                      <label className="text-base font-semibold">{totalLabel}:</label>
                      <label className="text-base font-semibold justify-self-end">
                        {formatPrice(totalPrice || 0, 'MXN')}
                      </label>
                    </>
                  )}
                </Container>
              </ContainerPaymentDetail>
              <Dialog.Root
                open={!!deleteDiscount.id}
                position="right"
                centerWhenSidepanelIsOpen
                onOpenChange={(state) => {
                  if (!state) setDeleteDiscount(defaultDeleteDiscount);
                }}
              >
                <Dialog.Title>¿Estás seguro que deseas eliminar este descuento?</Dialog.Title>
                <Dialog.Description>
                  Si eliminas el descuento, esta orden volverá a mostrarse "Por pagar" y generará deuda para el
                  estudiante
                </Dialog.Description>
                <div className="flex justify-center gap-x-10">
                  <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap">
                    Cancelar
                  </Dialog.Close>
                  <button
                    className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D]"
                    onClick={() => {
                      mutationDeleteDiscount.mutate(
                        { id: deleteDiscount.id, school_id: selectedSchool?.id || '' },
                        {
                          onSuccess: () => {
                            setDeleteDiscount(defaultDeleteDiscount);
                            onClose();
                          },
                          onError: () => {
                            setDeleteDiscount(defaultDeleteDiscount);
                          },
                        }
                      );
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </Dialog.Root>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
      {selectedPayin ? (
        <PayinSidepanel
          setIsPayinDeletedDone={setIsPayinDeletedDone}
          open={Boolean(selectedPayin)}
          onClose={() => setSelectedPayin(null)}
          payinId={selectedPayin?.id || ''}
          setPayinDeleted={setPayinDeleted}
        />
      ) : null}
      {selectedPayout ? (
        <PayoutDetail
          openTo={Boolean(selectedPayout)}
          onClose={() => setSelectedPayout(null)}
          payoutId={selectedPayout}
        />
      ) : null}
      {isPayinDeletedDone ? (
        <DeletePayinAlert payinDeleted={payinDeleted} setIsPayinDeletedDone={setIsPayinDeletedDone} />
      ) : null}
    </>
  );
}

export const ContainerPaymentDetail = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn('mt-8 pb-14 px-[30px] py-6 bg-gray-100 rounded-xl flex flex-col gap-y-4', className)}>
    {children}
  </div>
);

export const HeaderLabel = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 divide-y">
    <label className="pb-1 text-xs font-bold text-gray-600 border-b">{children}</label>
  </div>
);
interface BoxPartialPayinProps {
  payin: PartialPayin;
  isLoading?: boolean;
  schoolId: string;
  onClick?: () => void;
  payinFulfillment?: PayinFulfillment;
  collectedAt: string;
  invoiceStatus?: Record<string, string>;
  invoiceStatusI18N?: Record<Status, { status: string; tooltip?: string }>;
  failOriginMessage?: Record<string, string>;
}
export const BoxPartialPayin = ({
  payin,
  isLoading,
  schoolId,
  onClick,
  payinFulfillment,
  failOriginMessage,
  collectedAt,
}: BoxPartialPayinProps) => {
  const atSchool = collectedAt === 'collected_at_school';
  const invoiceStatus = {
    success: 'success',
    pending: 'info',
    canceled: 'error',
    canceling: 'error',
    not_requested: 'disabled',
    failed: 'warning',
    multiple: 'neutral',
    sponsored: 'disabled',
  } as const;

  const invoiceStatusI18N: Record<Status, { status: string; tooltip?: string }> = {
    success: {
      status: 'Emitida',
    },
    pending: {
      status: 'Por emitir',
      tooltip: `La factura se emitirá hoy a las ${useSelectedSchool()?.config_dashboard?.emit_invoice_time || '11:59'}`,
    },
    canceled: {
      status: 'Cancelada',
      tooltip: 'Esta factura ha sido cancelada manualmente',
    },
    canceling: {
      status: 'Por cancelar',
      tooltip: 'Se ha solicitado la cancelación de esta factura',
    },
    not_requested: {
      status: 'No facturable',
      tooltip: 'No se ha solicitado la emisión de una factura',
    },
    failed: {
      status: 'En revisión',
      tooltip: 'Hemos detectado inconsistencias con esta factura.',
    },
    multiple: {
      status: 'Múltiples',
      tooltip: 'Esta orden ha recibido múltiples pagos parciales',
    },
    sponsored: {
      status: 'Sin factura',
    },
  };

  return (
    <div className="p-4 mt-4 border rounded-lg border-info">
      <Container className="mt-2">
        <Title text="Pagador:" />
        <div className="col-span-3 w-fit">
          <LinkDetail
            href={`/guardian/${payin.guardian.id}`}
            text={`${payin.guardian.first_name} ${payin.guardian.last_name}`}
            message="Ver detalle de tutor"
            loading={isLoading}
          />
        </div>
      </Container>
      <div className="flex flex-col mt-4 gap-y-4">
        <Container>
          {isLoading ? (
            <SkeletonText />
          ) : (
            <>
              <Title text="Fecha de pago:" />
              <div className="flex col-span-2 w-fit">
                <Value text={formatDateShort(payin.paid_date, true)} />
              </div>
            </>
          )}
        </Container>
        <Container>
          <Title text="Medio de pago:" />
          <Value text={payMethods.find((method) => method.id === payin.type)?.label || ''} loading={isLoading} />
        </Container>
        {payin?.invoices[0]?.status === 'failed' ? (
          <>
            <div className="flex flex-row">
              <Title text="Estado de factura:" />
              <InvoiceChip
                intent={invoiceStatus?.[payin.invoices[0]?.status] as VariantProps<typeof ChipVariants>['variant']}
              >
                {invoiceStatusI18N?.[payin?.invoices[0]?.status]?.status}
              </InvoiceChip>
            </div>
            <Container>
              <Title text="" />
              <span className="text-[#637381] text-xs font-normal col-span-3 pr-6">
                {failOriginMessage?.[payin?.invoices[0]?.fail_origin ?? 'cometa']}
              </span>
            </Container>
          </>
        ) : (
          <div className="flex flex-row gap-y-4">
            <Title text="Estado de factura:" />
            <Tooltip message={invoiceStatusI18N?.[payin?.invoices[0]?.status || 'not_requested'].tooltip}>
              <InvoiceChip
                intent={
                  invoiceStatus?.[payin.invoices[0]?.status ?? 'not_requested'] as VariantProps<
                    typeof ChipVariants
                  >['variant']
                }
              >
                {invoiceStatusI18N?.[payin.invoices[0]?.status ?? 'not_requested'].status}
              </InvoiceChip>
            </Tooltip>
          </div>
        )}
        <Container className="mr-7">
          <Title text="Folio de factura:" />
          {isLoading ? (
            <SkeletonText />
          ) : payin?.invoices && payin?.invoices[0]?.fiscal_identifier && payin?.invoices[0]?.pdf_url ? (
            <a
              href={payin?.invoices[0]?.pdf_url}
              className="flex items-center col-span-3 cursor-pointer w-fit"
              rel="noreferrer noopener"
              target="_blank"
            >
              <label className="ml-2 text-sm cursor-pointer">{payin?.invoices[0]?.fiscal_identifier}</label>
              <Download fill="currentColor" className="text-blue-secondary-200" />
            </a>
          ) : (
            <label className="ml-2 text-sm">-</label>
          )}
        </Container>
        <Container className="mt-4">
          <Title text="Facturado a:" />
          <span className="col-span-3">
            <p className="text-sm font-bold">{payin?.invoices[0]?.billing_name || ''}</p>
            <p className="text-xs">{payin?.invoices[0]?.tax_id || ''}</p>
          </span>
        </Container>
        <Container>
          <Title text="Lugar de pago:" />
          <PlaceToPay at_school={atSchool} loading={!!isLoading} />
        </Container>
        {payin.correlative_id && (
          <Container>
            <Title text="ID de pago:" />
            <Value text={payin.correlative_id} loading={isLoading} loaderWidth={30} onClick={onClick} />
          </Container>
        )}
        <Container>
          <Title text="Monto pagado:" />
          {isLoading ? (
            <SkeletonText className="w-24" />
          ) : (
            formatPrice(payinFulfillment?.total_paid ?? payin.total, 'MXN')
          )}
        </Container>
        <Container>
          <Title text="Recibo:" />
          <LinkToReceipt href={`/receipt?school_id=${schoolId}&payin_id=${payin.id}`} />
        </Container>
      </div>
    </div>
  );
};

export const LinkToReceipt = ({ href }: { href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center bg-transparent cursor-pointer gap-x-2"
  >
    <label className="text-sm font-bold cursor-pointer text-blue-secondary-200">Ver recibo</label>
    <Link_To />
  </a>
);

export const Container = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid grid-cols-4 gap-x-4', className)} {...props}>
    {children}
  </div>
);

export const Title = ({ text }: { text: string }) => (
  <label className="flex items-center text-xs font-medium text-gray-600 min-w-[113.5px]">{text}</label>
);
interface ValueProps {
  text: string;
  loading?: boolean;
  loaderWidth?: number;
  onClick?(): void;
  className?: string;
}

export const Value = ({ text, loading, loaderWidth, onClick, className }: ValueProps) => {
  const Tag = onClick ? 'button' : 'label';
  return (
    <>
      {loading ? (
        <SkeletonText loaderWidth={loaderWidth} />
      ) : (
        <Tag
          onClick={onClick}
          className={cn('col-span-3 text-sm font-semibold w-fit text-secondary break-all', className, {
            'border-blue-secondary border p-2 rounded hover:bg-info/8 flex items-center gap-1 group': Boolean(onClick),
          })}
        >
          {text}
          {onClick ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                className="group-hover:[transform:translate(2px,-2px)] transition-all duration-100 ease-in-out"
                d="M16.6663 4.16683C16.6663 3.70659 16.2932 3.3335 15.833 3.3335H11.6663C11.2061 3.3335 10.833 3.70659 10.833 4.16683C10.833 4.62707 11.2061 5.00016 11.6663 5.00016H13.808L11.0746 7.74183C10.9169 7.8983 10.8281 8.1113 10.8281 8.3335C10.8281 8.55569 10.9169 8.76869 11.0746 8.92516C11.2311 9.08292 11.4441 9.17166 11.6663 9.17166C11.8885 9.17166 12.1015 9.08292 12.258 8.92516L14.9996 6.1835V8.3335C14.9996 8.79373 15.3727 9.16683 15.833 9.16683C16.2932 9.16683 16.6663 8.79373 16.6663 8.3335V4.16683Z"
                fill="#3366FF"
              />
              <path
                className="group-hover:[transform:translate(-2px,2px)] transition-all duration-100 ease-in-out"
                d="M8.92467 11.0751C8.7682 10.9174 8.55521 10.8286 8.33301 10.8286C8.11081 10.8286 7.89781 10.9174 7.74134 11.0751L4.99967 13.8084V11.6668C4.99967 11.2065 4.62658 10.8334 4.16634 10.8334C3.7061 10.8334 3.33301 11.2065 3.33301 11.6668V15.8334C3.33301 16.2937 3.7061 16.6668 4.16634 16.6668H8.33301C8.79324 16.6668 9.16634 16.2937 9.16634 15.8334C9.16634 15.3732 8.79324 15.0001 8.33301 15.0001H6.18301L8.92467 12.2584C9.08243 12.102 9.17117 11.889 9.17117 11.6668C9.17117 11.4446 9.08243 11.2316 8.92467 11.0751V11.0751Z"
                fill="#3366FF"
              />
            </svg>
          ) : null}
        </Tag>
      )}
    </>
  );
};

export const SkeletonText = ({
  loaderWidth,
  className,
}: {
  loaderWidth?: ValueProps['loaderWidth'];
  className?: string;
}) => (
  <div role="status" className="max-w-sm animate-pulse">
    <div
      className={cn(
        `h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48`,
        { 'w-[var(--loader-width)]': loaderWidth },
        className
      )}
      style={{ '--loader-width': `${loaderWidth}px` } as React.CSSProperties}
    />
  </div>
);

export const AmountTitle = ({
  text,
  loading,
  lineThrough,
  message,
  className,
}: {
  text: string;
  loading?: boolean;
  lineThrough?: boolean;
  message?: string;
  className?: string;
}) => (
  <>
    {loading ? (
      <Skeleton className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-24" />
    ) : (
      <div className="flex flex-row w-fit">
        <label
          className={cn(
            'text-sm font-normal text-secondary',
            {
              'line-through mr-2': lineThrough,
            },
            className
          )}
        >
          {text}
        </label>
        {message ? (
          <Tooltip message={message}>
            <Info />
          </Tooltip>
        ) : null}
      </div>
    )}
  </>
);
