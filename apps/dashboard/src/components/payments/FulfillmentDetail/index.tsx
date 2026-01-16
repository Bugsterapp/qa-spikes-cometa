import {
  CreateRefundDashboardResponseDTO,
  DashboardFulfillment,
  DashboardPayout,
  DiscountBreakdownSpecialDetail,
  Invoice,
  Payin,
  StatusDc1Enum,
  Student,
} from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';

import Link_To from '/public/assets/icons/ic_link_to.svg';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import Info from '/public/assets/icons/info.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import CAlert from '/src/components/atoms/CAlert';
import Chip, { ChipVariants } from '/src/components/atoms/Chip';
import Dialog from '/src/components/atoms/Dialog';
import LinkDetail from '/src/components/atoms/LinkDetail';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import { useValidateId } from '/src/components/atoms/Sheet';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { DetailsSpecialOrder } from '/src/components/organisms/dashboard/ManualPayPartial/DetailsSpecialOrder';
import PayinSidepanel from '/src/components/organisms/dashboard/PayinSidepanelDetail';
import PayoutDetail from '/src/components/organisms/dashboard/PayoutSidebarDetail';
import InvoiceDetail from '/src/components/payments/invoice/InvoiceDetail';
import InvoiceEmitSidepanel from '/src/components/payments/invoice/InvoiceEmitSidepanel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '/src/components/ui/Accordion';
import { Skeleton as SkeletonText } from '/src/components/ui/Skeleton';
import { Events } from '/src/constants/events';
import { invoiceStatusI18N } from '/src/constants/invoice';
import { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { DeletePayInAlert } from '/src/pages/income';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { sendTrackEvent } from '/src/utils/events';
import { formatDateNumeric, formatDateShort, formatPrice, payMethods } from '/src/utils/general';
import { QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import { trimId } from '/src/utils/trim-id';

import CreateRefundSidePanel from '../refund/CreateRefundSidePanel';
import FulfillmentChip from './FulfillmentChip';

interface IFulfillmentDetailProps {
  onClose: () => void;
  paymentId: string;
  sponsored?: boolean;
  fulfillment: DashboardFulfillment | undefined;
  isLoading: boolean;
}

export default function FulfillmentDetail({
  onClose,
  fulfillment,
  isLoading, // sponsored = false,
}: IFulfillmentDetailProps) {
  const permissions = useGetPermissions();
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const queryClient = useQueryClient();
  const selectedSchool = useSelectedSchool();
  const [payMethodName, setPayMethodName] = useState<string>('');
  const [selectedPayIn, setSelectedPayIn] = useState<{ id: string; partial: boolean } | null>(null);
  const [isPayInDeletedDone, setIsPayInDeletedDone] = useState(false);
  const [payInDeleted, setPayInDeleted] = useState<{ first_name: string; last_name: string; date: string } | null>(
    null
  );

  const defaultDeleteDiscount = { id: '', discount: 0 };
  const [deleteDiscount, setDeleteDiscount] = useState(defaultDeleteDiscount);
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [openRefund, setOpenRefund] = useState(false);

  const [payInFulfillmentToInvoice, setPayInFulfillmentToInvoice] = useState<{ id: number; total_paid: number } | null>(
    null
  );
  const [emittedInvoice, setEmittedInvoice] = useState<string | null>(null);

  React.useEffect(() => {
    if (fulfillment) {
      const payMethod =
        !fulfillment.has_partial_payins && payMethods.find((method) => method.id === fulfillment.payins[0]?.type);
      setPayMethodName(payMethod ? payMethod?.label : '');
    }
  }, [fulfillment]);

  const utils = api.useUtils();

  const deleteDiscountMutation = api.schools.schoolsSpecialDiscountsDestroy.useMutation({
    async onSuccess() {
      await utils.payments.listFulfillment.invalidate();
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      await queryClient.invalidateQueries({ queryKey: ['schoolFulfillments'] });
      await utils.manualPayments.fulfillments.invalidate();
      await utils.students.orderDetail.invalidate();
      sendTrackEvent(Events.manual_pay_discount_deleted, { source: 'dashboard' });
      setDeleteDiscount(defaultDeleteDiscount);
      onClose();
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
      setDeleteDiscount(defaultDeleteDiscount);
    },
  });

  const handleDeleteDiscount = () => {
    deleteDiscountMutation.mutate({ id: deleteDiscount.id, school_id: selectedSchool?.id || '' });
  };

  useEffect(() => {
    if (fulfillment?.student) {
      utils.manualPayments.studentDetails.prefetch({
        studentId: fulfillment.student.id,
      });
    }
  }, [fulfillment]);

  const fulfillmentStatus = {
    PAID: 'Pagado',
    PARTIAL_PAID: 'Pago parcial',
    DUE: 'Pendiente',
  };

  const student = fulfillment?.student;

  const totalLabel =
    !fulfillment?.has_partial_payins || fulfillment?.status === 'PAID' ? 'Total Pagado' : 'Pendiente a pagar';

  const totalPrice =
    !fulfillment?.has_partial_payins || fulfillment?.status === 'PAID'
      ? Number(fulfillment?.paid_amount)
      : Number(fulfillment?.pending_amount);

  // const key = trimId(paymentId);

  const allHasRefund = fulfillment?.payin_fulfillments.every((payinFulfillment) => payinFulfillment.refund);
  const isDueDateEdited =
    typeof fulfillment?.due_date === 'string' &&
    typeof fulfillment?.original_due === 'string' &&
    fulfillment?.due_date !== fulfillment?.original_due;

  const studentPath = (studentId: string) => `/students/${studentId}?prev=/delinquency`;
  const admissionPath = (admissionId: string) => `/admissions/${admissionId}?prev=/delinquency`;

  return (
    <>
      <InvoiceDetail
        onClose={() => setEmittedInvoice(null)}
        invoiceId={emittedInvoice ?? ''}
        open={Boolean(emittedInvoice)}
      />
      <InvoiceEmitSidepanel
        open={Boolean(payInFulfillmentToInvoice)}
        onOpenChange={(value) => (!value ? setPayInFulfillmentToInvoice(null) : void 0)}
        fulfillment={{
          correlativeId: fulfillment?.correlative_id || '',
          guardian: {
            id: fulfillment?.guardian?.id || '',
            first_name: fulfillment?.guardian?.first_name || '',
            last_name: fulfillment?.guardian?.last_name || '',
          },
          totalPrice: payInFulfillmentToInvoice?.total_paid || 0,
          orderName: fulfillment?.order_name || '',
          student: fulfillment?.student as Student,
        }}
        payinFulfillmentId={payInFulfillmentToInvoice?.id ?? 0}
        onInvoiceEmit={(invoiceId) => setEmittedInvoice(invoiceId)}
      />
      <div className="flex flex-col flex-auto h-full">
        <div className="sticky top-0 z-10 px-8 w-full bg-white">
          {/* {sponsored ? (
            <CAlert className="my-4" type="success" message='¡Esta orden cambió de estado a "Pagado"!' />
          ) : ( */}
          <SidebarHeader
            title="Detalle de orden"
            subtitle={fulfillment?.correlative_id ?? 'ID por generar'}
            onClose={onClose}
            subClassName={!fulfillment?.correlative_id ? 'text-[#919EAB] italic text-base font-medium' : undefined}
          />
          {/* )} */}
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="px-8 mt-1 mb-2">
            <div id="order-data">
              <HeaderLabel>DATOS DE ORDEN</HeaderLabel>
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
                {Object.keys(fulfillmentStatus).includes(fulfillment?.status || '') ? (
                  <Container className="mt-4">
                    <Title text="Estado:" />
                    <div className="col-span-2">
                      <FulfillmentChip
                        intent={fulfillment?.status || ('PARTIAL_PAID' as StatusDc1Enum)}
                        as="span"
                        loading={isLoading}
                      >
                        {fulfillmentStatus[(fulfillment?.status || 'PARTIAL_PAID') as keyof typeof fulfillmentStatus]}
                      </FulfillmentChip>
                    </div>
                  </Container>
                ) : null}
                {student && (
                  <Container className="mt-4">
                    <Title text="Estudiante:" />
                    <div className="col-span-3 w-fit">
                      <LinkDetail
                        href={student?.lead_id ? admissionPath(student.lead_id) : studentPath(student.id)}
                        text={`${student.first_name} ${student.last_name}`}
                        message={student?.lead_id ? 'Ver detalle de prospecto' : 'Ver detalle de estudiante'}
                        loading={isLoading}
                        className="font-semibold"
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
                  <div className="min-w-[300px]">
                    <Value
                      text={formatDateShort(fulfillment?.due_date || fulfillment?.original_due || '', true)}
                      loading={isLoading}
                      loaderWidth={30}
                    />
                    {fulfillment?.original_due && isDueDateEdited && (
                      <p className="text-xs font-light text-[#637381] italic flex gap-2">
                        Fecha original: {formatDateShort(fulfillment?.original_due || '', true)}{' '}
                        <Tooltip message="La fecha de vencimiento fue cambiada manualmente">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_25205_47654)">
                              <path
                                d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0V0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                                fill="#A2ABB9"
                              />
                              <path
                                d="M8.00065 3.33203C7.82384 3.33203 7.65427 3.40227 7.52925 3.52729C7.40422 3.65232 7.33398 3.82189 7.33398 3.9987V9.33203C7.33398 9.50884 7.40422 9.67841 7.52925 9.80344C7.65427 9.92846 7.82384 9.9987 8.00065 9.9987C8.17747 9.9987 8.34704 9.92846 8.47206 9.80344C8.59709 9.67841 8.66733 9.50884 8.66733 9.33203V3.9987C8.66733 3.82189 8.59709 3.65232 8.47206 3.52729C8.34704 3.40227 8.17747 3.33203 8.00065 3.33203Z"
                                fill="#A2ABB9"
                              />
                              <path
                                d="M8.66733 11.9987C8.66733 11.6305 8.36885 11.332 8.00065 11.332C7.63246 11.332 7.33398 11.6305 7.33398 11.9987C7.33398 12.3669 7.63246 12.6654 8.00065 12.6654C8.36885 12.6654 8.66733 12.3669 8.66733 11.9987Z"
                                fill="#A2ABB9"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_25205_47654">
                                <rect width="16" height="16" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </Tooltip>
                      </p>
                    )}
                  </div>
                </Container>
              </div>
            </div>
            {fulfillment?.payins && fulfillment?.payins.length > 0 ? (
              <div id="payment_detail" className="mt-11">
                <div className="flex flex-row items-center justify-between border-b pb-2.5">
                  <span className="text-[#637381] text-xs font-bold">
                    {fulfillment?.has_partial_payins ? 'DETALLE DE PAGOS PARCIALES' : 'DETALLE DEL PAGO'}
                  </span>
                  {permissions.can_create_refund && fulfillment && !fulfillment?.is_sponsored ? (
                    <Tooltip
                      message="Tu pago ya contiene una devolución"
                      disableHover={!allHasRefund}
                      disableClick={!allHasRefund}
                    >
                      <button
                        className="flex flex-row items-center p-1 pr-2 text-xs font-bold transition-colors bg-transparent text-green hover:text-green-400 disabled:text-[#919EABCC] disabled:cursor-not-allowed disabled:hover:text-[#919EABCC]"
                        onClick={() => setOpenRefund(true)}
                        disabled={allHasRefund}
                      >
                        <Plus className="w-3 mr-[11px]" /> Generar devolución
                      </button>
                    </Tooltip>
                  ) : null}
                </div>
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
                {!fulfillment?.is_sponsored &&
                  fulfillment?.payin_fulfillments?.map((payinFulfillment) => {
                    const invoiceI18N = invoiceStatusI18N(selectedSchool?.config_dashboard?.emit_invoice_time);
                    const payin = fulfillment.payins.find((p) => p.id === payinFulfillment.payin);
                    if (!payin) return null;

                    const refund = payinFulfillment.refund;

                    return (
                      <Accordion
                        key={payin.id}
                        type="single"
                        collapsible
                        className="mt-4 w-full"
                        data-testid="payment-detail-card-button"
                      >
                        <AccordionItem variant="card" value="item-1">
                          <AccordionTrigger variant="card">
                            <div className="flex flex-col text-left">
                              <span className="text-[#637381] text-xs h-4 font-regular">
                                {formatDateShort(payin.paid_date, true)}
                              </span>
                              <div>
                                <span className="text-[#637381] font-semibold">ID:</span>
                                <span className="font-semibold">{payin.correlative_id}</span>
                                {refund ? (
                                  <Chip intent="warning" className="ml-2">
                                    Devuelto
                                  </Chip>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex flex-col mr-5 ml-auto text-right">
                              <span className="text-[#637381] text-xs h-4 font-regular">Monto pagado</span>
                              <span className="font-semibold">
                                {formatPrice(payinFulfillment?.total_paid ?? payin.total, 'MXN')}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 w-full">
                            <div className="bg-white rounded-lg border border-[#E9EEF7] w-full overflow-hidden p-6">
                              <PaymentDetail
                                isLoading={isLoading}
                                selectedSchoolId={selectedSchool?.id || ''}
                                payin={payin}
                                paymentMethod={payMethodName}
                              />
                              {refund ? <RefundDetail isLoading={isLoading} refund={refund} /> : null}
                              <PayoutDetailAccordion
                                isSponsored={!!fulfillment.is_sponsored}
                                collectedAtSchool={payin.collected_at === 'collected_at_school'}
                                payout={fulfillment.payout}
                                setSelectedPayout={setSelectedPayout}
                                isLoading={isLoading}
                              />
                              <InvoicesDetail
                                onClickEmit={() =>
                                  setPayInFulfillmentToInvoice({
                                    id: payinFulfillment.id,
                                    total_paid: Number(payinFulfillment.total_paid),
                                  })
                                }
                                invoices={payinFulfillment.invoices}
                                isLoading={isLoading}
                                invoiceI18N={invoiceI18N}
                                onOpenInvoice={(invoiceId) => setEmittedInvoice(invoiceId)}
                                isBillable={fulfillment.is_billable}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
              </div>
            ) : null}
          </div>
          <ContainerPaymentDetail id="payment_amount_detail">
            <Container className="grid-cols-2">
              <AmountTitle text="Monto original:" loading={isLoading} />
              <label className="justify-self-end text-sm font-normal">
                {formatPrice(fulfillment?.original_amount || '', 'MXN')}
              </label>
            </Container>
            {fulfillment?.special_over_charges &&
              (fulfillment?.special_over_charges as any).map((item: any) => (
                <DetailsSpecialOrder
                  key={item.id}
                  name={item.name}
                  value={item.value}
                  is_visible={item.is_visible}
                  id={item.id}
                  disableDelete={Number(totalPrice) < Number(item.value)}
                />
              ))}
            {fulfillment?.guardian_commission && !!Number(fulfillment?.guardian_commission) && (
              <Container className="grid-cols-2">
                <AmountTitle text="Comisión + IVA:" loading={isLoading} />
                <label className="justify-self-end text-sm font-normal">
                  {formatPrice(fulfillment?.guardian_commission, 'MXN')}
                </label>
              </Container>
            )}
            {fulfillment?.discount_breakdown?.details?.early_bird && (
              <Container className="grid-cols-2">
                <AmountTitle text="Descuento pronto pago:" loading={isLoading} />
                <label className="justify-self-end text-sm font-normal">
                  -{formatPrice(fulfillment?.discount_breakdown.details.early_bird.total, 'MXN')}
                </label>
              </Container>
            )}
            {fulfillment?.discount_breakdown?.details?.scholarships?.details.map((item: any) => (
              <ScholarshipItem
                key={item.id}
                item={item}
                fulfillmentId={fulfillment.id}
                fulfillmentStatus={fulfillment.status as StatusDc1Enum}
                isDue={fulfillment.due_date ? new Date(fulfillment.due_date) > new Date() : false}
                isLoading={isLoading}
                isSponsored={!!fulfillment.is_sponsored}
              />
            ))}
            {fulfillment?.discount_breakdown?.details?.special?.details.map((item: DiscountBreakdownSpecialDetail) => {
              const isNotInterestForgiveness = item.type !== TypeSpecialDiscount.INTEREST_FORG;
              const canModifyFulfillment = fulfillment?.status !== StatusDc1Enum.PAID || fulfillment?.is_sponsored;
              const canDeleteDiscount = isNotInterestForgiveness && canModifyFulfillment;
              return (
                <Container key={item.id} className="grid-cols-2">
                  <div className="flex gap-1 items-center">
                    <AmountTitle
                      text={`"${item.name}"`}
                      loading={isLoading}
                      className="text-[#212B36] font-semibold text-sm"
                    />
                    {canDeleteDiscount && (
                      <button
                        className="bg-transparent"
                        onClick={() => {
                          setDeleteDiscount({ id: item.id, discount: parseFloat(item.discount) });
                        }}
                      >
                        <IcTrash className="text-error" />
                      </button>
                    )}
                  </div>
                  <label className="justify-self-end text-sm font-normal">-{formatPrice(item.discount, 'MXN')}</label>
                </Container>
              );
            })}
            {fulfillment?.has_partial_payins &&
              fulfillment?.payin_fulfillments?.map((partial) => (
                <Container key={partial.id} className="grid-cols-2">
                  <AmountTitle
                    text={`Pago parcial (${formatDateShort(partial?.paid_date, true)})`}
                    loading={isLoading}
                  />
                  <label className="justify-self-end text-sm font-normal">
                    -{formatPrice(partial?.total_paid, 'MXN')}
                  </label>
                </Container>
              ))}
            {fulfillment?.interest && !!Number(fulfillment.interest) && (
              <Container className="grid-cols-2">
                <AmountTitle text="Recargo:" loading={isLoading} />
                <label className="justify-self-end text-sm font-normal">
                  +{formatPrice(fulfillment.interest, 'MXN')}
                </label>
              </Container>
            )}
            {fulfillment?.payin_fulfillments.map(({ refund }) =>
              refund ? (
                <Container key={refund.id} className="grid-cols-2">
                  <AmountTitle
                    text={`Devolución (${formatDateShort(refund?.registered_at, true)})`}
                    loading={isLoading}
                  />
                  <label className="justify-self-end text-sm font-normal">-{refund.amount}</label>
                </Container>
              ) : null
            )}
            <Container className="grid-cols-2 pt-5 border-t border-t-gray-600">
              {isLoading ? (
                <SkeletonText className="w-24" />
              ) : (
                <>
                  <label className="text-base font-semibold">{totalLabel}:</label>
                  <label className="justify-self-end text-base font-semibold">
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
              Si eliminas el descuento, esta orden volverá a mostrarse "Por pagar" y generará deuda para el estudiante
            </Dialog.Description>
            <div className="flex gap-x-10 justify-center">
              <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 whitespace-nowrap bg-transparent hover:opacity-90">
                Cancelar
              </Dialog.Close>
              <button
                className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D]"
                onClick={handleDeleteDiscount}
              >
                Eliminar
              </button>
            </div>
          </Dialog.Root>
        </div>
      </div>
      {/* </Sheet.Content>
      </Sheet> */}
      {/* <Dialog.Root
        open={!!deleteScholarship && deleteScholarship.showDialog}
        position="right"
        centerWhenSidepanelIsOpen
        onOpenChange={(state) => {
          if (!state) setDeleteScholarship(null);
        }}
      >
        <Dialog.Title>¿Estás seguro que deseas eliminar esta beca o descuento?</Dialog.Title>
        <Dialog.Description>
          Al eliminarlo, el estudiante perderá el beneficio únicamente para esta orden. Podrás reactivarlo luego si lo
          necesitas.
        </Dialog.Description>
        <div className="flex gap-x-10 justify-center">
          <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 whitespace-nowrap bg-transparent hover:opacity-90">
            Cancelar
          </Dialog.Close>
          <button
            disabled={isScholarshipLoading}
            className="text-white font-bold py-2 px-8 rounded-lg text-sm hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] w-[120px] disabled:opacity-50 disabled:cursor-wait"
            onClick={() => {
              if (deleteScholarship?.id) {
                handleDeleteScholarship({ id: deleteScholarship.id, is_active: deleteScholarship.is_active });
              }
            }}
          >
            {isScholarshipLoading ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-4" /> : 'Eliminar'}
          </button>
        </div>
      </Dialog.Root> */}
      {selectedPayIn ? (
        <PayinSidepanel
          setIsPayinDeletedDone={setIsPayInDeletedDone}
          open={Boolean(selectedPayIn)}
          onClose={() => setSelectedPayIn(null)}
          payinId={selectedPayIn?.id || ''}
          setPayinDeleted={setPayInDeleted}
        />
      ) : null}
      {selectedPayout ? (
        <PayoutDetail
          openTo={Boolean(selectedPayout)}
          onClose={() => setSelectedPayout(null)}
          payoutId={selectedPayout}
        />
      ) : null}

      {openRefund && fulfillment ? (
        <CreateRefundSidePanel
          open={openRefund}
          onClose={() => setOpenRefund(false)}
          payinFulfillments={fulfillment.payin_fulfillments}
          payins={fulfillment.payins}
        />
      ) : null}

      {isPayInDeletedDone ? (
        <DeletePayInAlert payinDeleted={payInDeleted} setIsPayinDeletedDone={setIsPayInDeletedDone} />
      ) : null}
    </>
  );
}

export const ContainerPaymentDetail = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn('flex flex-col gap-y-4 py-6 pb-14 mt-8 bg-gray-100 rounded-xl px-[30px]', className)}>
    {children}
  </div>
);

export const HeaderLabel = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 divide-y">
    <label className="pb-1 text-xs font-bold text-gray-600 border-b">{children}</label>
  </div>
);

export const LinkToReceipt = ({ href }: { href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex gap-x-2 items-center bg-transparent cursor-pointer"
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
          className={cn('col-span-3 text-sm font-semibold break-all w-fit text-foreground', className, {
            'flex gap-1 items-center p-2 rounded border border-blue-secondary hover:bg-info/8 group': Boolean(onClick),
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

export const AmountTitle = ({
  text,
  loading,
  lineThrough,
  message,
  className,
}: {
  text: ReactNode | string;
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
            'mr-1 text-sm font-normal text-foreground',
            {
              'mr-2 line-through': lineThrough,
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

import { VariantProps } from 'class-variance-authority';
import React from 'react';

import { ScholarshipItem } from '../../molecules/ScholarshipItem';
import { paymentMethodsRefund } from '../refund/CreateRefundForm';
import CreateInvoice from '/public/assets/icons/invoice/create_invoice.svg';
import { Button } from '/src/components/ui/Button';
import { invoiceStatus } from '/src/constants/invoice';
import { formatTime } from '/src/utils/general';

interface InvoicesDetailProps {
  invoices: Invoice[];
  onClickEmit: () => void;
  isLoading: boolean;
  invoiceI18N: any;
  onOpenInvoice: (invoiceId: string) => void;
  isBillable: boolean;
}

const InvoicesDetail: React.FC<InvoicesDetailProps> = ({
  invoices,
  isLoading,
  invoiceI18N,
  onClickEmit,
  onOpenInvoice,
  isBillable,
}) => {
  const selectedSchool = useSelectedSchool();

  const permissions = useGetPermissions();

  const canEmitInvoice = isBillable && permissions?.can_perform_invoicing && selectedSchool?.does_invoice;

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col mt-6">
        <span className="block text-[#637381] text-xs font-bold border-b border-neutral-300 pb-2">FACTURACIÓN</span>
        <div className="flex flex-row justify-between items-center mt-4 space-x-4 text-left">
          <span className="mr-2 font-medium text-xs leading-[18px] text-[#637381] italic max-w-[220px]">
            No hay facturas emitidas para el pago de esta orden.
          </span>

          {canEmitInvoice ? (
            <Button
              variant="rounded"
              intent="creation"
              className="flex-auto flex-shrink-0 font-bold max-w-[200px] pt-3 pb-3"
              onClick={() => onClickEmit()}
              id="emit_invoice_btn"
            >
              <CreateInvoice className="mr-1 w-4 h-4" />
              Emitir nueva factura
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-4 mt-6">
      <span className="block text-[#637381] text-xs font-bold border-b border-neutral-300 pb-2">FACTURACIÓN</span>
      <div className="border rounded-lg border-[#E4EBF6] justify-between border-solid divide-y-[#E4EBF6]">
        {invoices.map((invoice) => (
          <div
            className="flex flex-row items-start p-4 group cursor-pointer hover:bg-[#1890FF0A]"
            key={invoice.id}
            onClick={() => onOpenInvoice(invoice.id as string)}
          >
            <div className="flex flex-col w-full">
              <div className="flex flex-shrink-0 items-center mt-2 text-xs">
                <span className="text-[#919EAB] mr-2">
                  {invoice.type === 'invoice' ? 'Factura' : 'Nota de crédito'}
                </span>
                <div className="inline-block pr-2 mr-2 border-r border-neutral-300">
                  <Tooltip message={invoiceI18N[invoice.status].tooltip}>
                    <Chip
                      intent={
                        invoiceStatus?.[invoice.status ?? 'not_requested'] as VariantProps<
                          typeof ChipVariants
                        >['variant']
                      }
                    >
                      {invoiceI18N[invoice.status ?? 'not_requested'].status}
                    </Chip>
                  </Tooltip>
                </div>
                <span className="text-[#919EAB] text-sm">{invoice.client_identifier}</span>
              </div>
              {invoice.expedition_date && (
                <div className="grid grid-cols-[122px_1fr] items-center flex-shrink-0 mt-4 text-xs">
                  <span className="font-medium text-[#637381]">Fecha de emisión:</span>
                  {isLoading ? (
                    <SkeletonText />
                  ) : (
                    <div className="flex font-semibold">
                      <span className="mr-1 inline-block border-r border-neutral-300 pr-1 text-[#212B36]">
                        {formatDateShort(invoice.expedition_date, true)}
                      </span>
                      <span className="inline-block">{formatTime(invoice.expedition_date)}</span>
                    </div>
                  )}
                </div>
              )}
              {invoice.related_fiscal_identifier && (
                <div className="grid grid-cols-[122px_1fr] items-center flex-shrink-0 mt-4 text-xs">
                  <span className="font-medium text-[#637381]">Folio relacionado:</span>
                  <span>{invoice.related_fiscal_identifier}</span>
                </div>
              )}
              <div className="grid grid-cols-[122px_1fr] items-center flex-shrink-0 mt-4 text-xs">
                <span className="font-medium text-[#637381]">Folio fiscal:</span>
                <span>{invoice.fiscal_identifier}</span>
              </div>
              <div className="grid grid-cols-[122px_1fr] flex-shrink-0 mt-4 text-xs items-start">
                <span className="font-medium text-[#637381]">Facturado a:</span>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{invoice.billing_name || ''}</p>
                  <p className="text-xs">{invoice.tax_id || ''}</p>
                </div>
              </div>
            </div>
            <div className="flex items-start ml-auto">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PayoutDetailProps {
  collectedAtSchool: boolean;
  isSponsored: boolean;
  payout?: DashboardPayout | null;
  isLoading: boolean;
  setSelectedPayout: (id: string) => void;
}
interface ValueProps {
  text: string;
  loading?: boolean;
  loaderWidth?: number;
  onClick?(): void;
  className?: string;
}

const PayoutStatus = ({ status, loading, children }: { status: string; loading: boolean; children: ReactNode }) => {
  const classNames = cn('text-sm px-2 w-fit py-1 rounded-md font-bold text-center', {
    'text-successText bg-[#54D62C]/16': status === 'APPROVED_STATUS',
    'text-processingText bg-warning-500/16': status === 'PROCESSING_STATUS',
    'text-info bg-info/12': status === 'SCHEDULED_STATUS',
    'text-gray-700 bg-gray-500/12': status === 'PENDING_STATUS',
    'bg-[#FF484214]/16 text-[#FF4842]': status === 'DECLINED_STATUS',
  });
  return loading ? <SkeletonText className="w-28 h-4" /> : <span className={classNames}>{children}</span>;
};

const payoutStatus = {
  APPROVED_STATUS: 'Recibido',
  PROCESSING_STATUS: 'Pago iniciado',
  SCHEDULED_STATUS: 'Programado',
  PENDING_STATUS: 'Pendiente',
  DECLINED_STATUS: 'Declinado',
};

const PayoutDetailAccordion: React.FC<PayoutDetailProps> = ({
  collectedAtSchool,
  isSponsored,
  payout,
  isLoading,
  setSelectedPayout,
}) => {
  const checkId = useValidateId();
  return (
    <>
      {!collectedAtSchool && !isSponsored && (
        <div id="payout_detail" className="mt-6">
          <span className="block text-[#637381] text-xs font-bold border-b border-neutral-300 pb-2">
            DETALLE DEL DEPÓSITO
          </span>
          <div className="grid grid-cols-[122px_1fr] items-center  mt-4 text-xs">
            <span className="font-medium text-xs leading-[18px] text-[#637381]">Estado de depósito:</span>
            <PayoutStatus status={payout?.status ?? 'PENDING_STATUS'} loading={isLoading}>
              {payoutStatus[(payout?.status as keyof typeof payoutStatus) || 'PENDING_STATUS']}
            </PayoutStatus>
          </div>
          {payout?.correlative_id && (
            <div className="grid grid-cols-[122px_1fr] items-center  mt-4 text-xs">
              <span className="font-medium text-[#637381] mr-4">ID de depósito:</span>
              <Tooltip message="Ver detalle del depósito" disableClick={false}>
                <Value
                  text={payout.correlative_id}
                  onClick={() =>
                    checkId(trimId(payout.id), 'Ya tienes abierto este depósito en un panel anterior.', () =>
                      setSelectedPayout(payout.id)
                    )
                  }
                />
              </Tooltip>
            </div>
          )}
          {payout?.deposit_date && (
            <div className="grid grid-cols-[122px_1fr] items-center mt-4 text-xs">
              <span className="font-medium text-[#637381]">Fecha de depósito:</span>
              {isLoading ? (
                <SkeletonText />
              ) : (
                <div className="flex font-semibold flex-grid">
                  <span className="inline-block pr-1 mr-1 border-r border-neutral-300">
                    {formatDateShort(payout.deposit_date || payout.scheduled_date || null, true)}
                  </span>
                  <span className="inline-block">
                    {formatTime(payout.deposit_date || payout.scheduled_date || null)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

interface PaymentDetailProps {
  payin: Payin;
  isLoading: boolean;
  selectedSchoolId: string;
  paymentMethod: string;
}
interface ValueProps {
  text: string;
  loading?: boolean;
  loaderWidth?: number;
  onClick?(): void;
  className?: string;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ isLoading, payin, selectedSchoolId, paymentMethod }) => {
  const payedAtSchool = payin.collected_at === 'collected_at_school';
  return (
    <>
      <span className="block text-[#637381] text-xs font-bold border-b border-neutral-300 pb-2">DETALLE DEL PAGO</span>
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Lugar de pago:</span>
        <PlaceToPay className="col-span-1" at_school={payedAtSchool} loading={isLoading} />
      </div>
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Pagador:</span>
        <div className="font-bold w-fit">
          {payin.guardian?.id && (
            <LinkDetail
              href={`/guardian/${payin.guardian.id}`}
              text={`${payin.guardian.first_name} ${payin.guardian.last_name}`}
              message="Ver detalle de tutor"
              loading={isLoading}
            />
          )}
        </div>
      </div>
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Medio de pago:</span>
        <Value className="col-span-1" text={paymentMethod} loading={isLoading} />
      </div>
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Recibo:</span>
        <LinkToReceipt href={`/receipt?school_id=${selectedSchoolId}&payin_id=${payin.id}`} />
      </div>
    </>
  );
};

interface RefundProps {
  refund: CreateRefundDashboardResponseDTO;
  isLoading: boolean;
}
const RefundDetail: React.FC<RefundProps> = ({ isLoading, refund }) => (
  <div id="refund_detail" className="mt-6">
    <span className="block text-[#637381] text-xs font-bold border-b border-neutral-300 pb-2">
      DETALLE DE DEVOLUCIÓN
    </span>
    {refund.registered_at ? (
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Fecha de devolución:</span>
        {isLoading ? (
          <SkeletonText />
        ) : (
          <div className="flex font-semibold flex-grid">
            <span className="inline-block pr-1 mr-1">{formatDateShort(refund.registered_at || null, true)}</span>
          </div>
        )}
      </div>
    ) : null}
    <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
      <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Monto devuelto:</span>
      <Value className="col-span-1" text={formatPrice(refund.amount, 'MXN')} loading={isLoading} />
    </div>
    <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
      <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Método de devolución:</span>
      <Value
        className="col-span-1"
        text={paymentMethodsRefund.find((method) => refund.payment_method == method.value)?.label || ''}
        loading={isLoading}
      />
    </div>
    {refund.comment ? (
      <div className="mt-4 grid items-center grid-cols-[122px_1fr]">
        <span className="mr-4 font-medium text-xs leading-[18px] text-[#637381]">Motivo:</span>
        <Value className="col-span-1" text={refund.comment} loading={isLoading} />
      </div>
    ) : null}
  </div>
);
