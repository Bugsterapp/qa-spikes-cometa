import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import ApiClient from '/src/services/ApiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Trash from '/public/assets/icons/ic_trash.svg';
import { Tooltip } from 'src/components/atoms/Tooltip';
import LinkTo from '/src/components/atoms/LinkDetail';
import { formatDateShort, formatTime, payMethods, formatPrice } from '/src/utils/general';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import InvoiceChip from '/src/components/atoms/Chip';
import { Status } from '/types/paid-orders';
import FulfillmentDetail, { LinkToReceipt, Title, Value } from '../FulfillmentDetail';
import useAlert from '/src/hooks/useAlert';
import File from '/public/assets/icons/download/file.svg';
import XML from '/public/assets/icons/download/xml.svg';
import Table from '/public/assets/icons/download/table.svg';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { sendTrackEvent } from '/src/utils/events';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import { cn } from '/src/utils/cn';
import Sheet, { useValidateId } from '/src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import { DashboardPayinFulfillment } from '@cometa/trpc/src/types';
import { trimId } from '/src/utils/trim-id';

interface PayinSidepanelDetailProps {
  payinId: string;
  onClose: () => void;
  setPayinDeleted: (data: any) => void;
  setIsPayinDeletedDone: (data: boolean) => void;
  open: boolean;
  keyToValidate?: string;
}

export default function PayinSidepanel({
  payinId,
  onClose,
  setPayinDeleted,
  setIsPayinDeletedDone,
  open,
  keyToValidate,
}: PayinSidepanelDetailProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const selectedSchool = useSelectedSchool();
  const [openDialog, setOpenDialog] = useState(false);
  const { setAlertState } = useAlert();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();

  const [selectedFulfillment, setSelectedFulfillment] = useState<string | null>(null);
  const checkId = useValidateId();

  const getPayinsReport = async () =>
    ApiClient.generatePayinsReport(session?.token, selectedSchool?.id, {
      startDate: null,
      endDate: null,
      guardians: null,
      ids: [payinId],
    });

  const deletePayin = async () => {
    ApiClient.deleteIncomePayin(session?.token, selectedSchool?.id, payinId);
  };

  const { data: incomePayin, isLoading } = api.income.getPayinById.useQuery(
    { schoolId: selectedSchool?.id as string, payinId },
    {
      enabled: !!session && !!selectedSchool && open,
    }
  );

  const { data: guardianPayin, isLoading: isLoadingGuardian } = api.guardian.getGuardianById.useQuery(
    { id: incomePayin?.guardian as string, schoolId: selectedSchool?.id as string },
    {
      enabled: !!session && !!selectedSchool && open && !!incomePayin?.guardian,
    }
  );

  const payMethodName = incomePayin && payMethods.find((method) => method.id === incomePayin.type)?.label;

  const mutation = useMutation({
    mutationFn: deletePayin,
    async onSuccess() {
      handleClosePayin();
      await queryClient.invalidateQueries({ queryKey: ['schoolPayins'] });
      setPayinDeleted({
        first_name: guardianPayin?.first_name,
        last_name: guardianPayin?.last_name,
        date: incomePayin?.paid_date,
      });
      setIsPayinDeletedDone(true);
      setTimeout(() => {
        setIsPayinDeletedDone(false);
      }, 5000);
    },
    onError(err) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      Sentry.captureException(err);
    },
  });

  const mutationDownload = useMutation({
    mutationFn: getPayinsReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const handleClosePayin = () => {
    onClose();
    setOpenDialog(false);
  };

  const downloadInvoices = async (extension: string) => {
    sendTrackEvent('dashboard: Direct Payments Downloaded', {
      PaymentType: 'complete',
      Type: `Facturas ${extension.toUpperCase()}`,
    });
    setIsWorking();
    return ApiClient.getSchoolRegisteredPaymentsInvoices(session?.token, selectedSchool?.id, extension, {
      startDate: null,
      endDate: null,
      guardians: null,
      ids: [payinId],
    })
      .then((data: Record<string, any>) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const handleAdd = async () => {
    sendTrackEvent('dashboard: Direct Payments Downloaded', { PaymentType: 'complete', Type: 'Tabla' });
    await mutationDownload.mutate();
    setIsWorking();
  };

  const DownloadMenuItems = [
    {
      key: 'invoices-zip',
      children: (
        <>
          <File className="w-4" />
          <span>Descargar facturas PDF</span>
        </>
      ),
      onClick: () => downloadInvoices('pdf'),
      disabled: !incomePayin?.has_invoice,
    },
    {
      key: 'invoices-xml',
      children: (
        <>
          <XML className="w-4" />
          <span>Descargar facturas XML</span>
        </>
      ),
      onClick: () => downloadInvoices('xml'),
      disabled: !incomePayin?.has_invoice,
    },
    {
      key: 'table-report',
      children: (
        <>
          <Table className="w-5" />
          <span>Descargar tabla</span>
        </>
      ),
      onClick: () => handleAdd(),
    },
  ];

  const key = trimId(payinId);

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(open) => {
          if (!open) handleClosePayin();
        }}
        id={key}
        key={key}
      >
        <Sheet.Content>
          <div className="flex flex-col flex-auto">
            <div className="sticky top-0 z-10 w-full px-8 bg-white">
              <SidebarHeader
                title="Detalle de pago"
                subtitle={incomePayin?.correlative_id ?? 'ID por generar'}
                onClose={handleClosePayin}
                subClassName={!incomePayin?.correlative_id ? 'text-[#919EAB] italic text-base font-medium' : undefined}
              />
            </div>
            <div className="flex flex-col justify-between h-full">
              <div id="order-data" className="px-8 mb-2">
                <div className="flex justify-between w-full pb-3 border-b">
                  <label className="text-xs font-bold text-gray-600 ">DETALLE DEL PAGO</label>
                  <Tooltip
                    message="No es posible eliminar un pago que tiene facturas emitidas"
                    disableHover={!incomePayin?.has_invoice}
                  >
                    <button
                      disabled={Boolean(incomePayin?.has_invoice)}
                      className="flex items-center bg-transparent cursor-pointer"
                      onClick={() => {
                        setOpenDialog(true);
                      }}
                    >
                      <label
                        className={cn('mr-2 text-sm font-bold cursor-pointer select-none text-error', {
                          'text-gray-500 cursor-not-allowed': incomePayin?.has_invoice,
                        })}
                      >
                        Eliminar pago
                      </label>
                      <Trash className={cn('text-error', { 'text-gray-500': incomePayin?.has_invoice })} />
                    </button>
                  </Tooltip>
                </div>
                <div className="mt-8">
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="ID del pago:" />
                    <Value
                      text={incomePayin?.correlative_id ?? 'ID por generar'}
                      loading={isLoading}
                      loaderWidth={30}
                      className={
                        !incomePayin?.correlative_id ? 'text-[#919EAB] italic text-sm font-semibold' : undefined
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Pagador:" />
                    <div className="col-span-3 w-fit">
                      <LinkTo
                        href={`/guardian/${guardianPayin?.id}`}
                        text={`${guardianPayin?.first_name || ''} ${guardianPayin?.last_name || ''}`}
                        message="Ver detalle de tutor"
                        loading={isLoading || isLoadingGuardian}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Fecha de pago:" />
                    <div className="flex col-span-3 w-fit">
                      {isLoading && (
                        <div role="status" className="max-w-sm animate-pulse">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                        </div>
                      )}
                      {!isLoading && incomePayin?.paid_date && (
                        <>
                          <Value text={formatDateShort(incomePayin?.paid_date, true)} />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Medio de pago:" />
                    <Value text={payMethodName || ''} loading={isLoading} />
                  </div>
                  {(incomePayin?.type === 'debit_card' || incomePayin?.type === 'credit_card') &&
                    incomePayin?.card_last_digits && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <Title text="Info. de tarjeta:" />
                        <div className="flex col-span-3">
                          {incomePayin?.bank_name && (
                            <>
                              <Value text={incomePayin?.bank_name} />
                              <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                            </>
                          )}
                          <Value text={`**** **** ${incomePayin?.card_last_digits}`} />
                        </div>
                      </div>
                    )}
                  {incomePayin?.type === 'bank_transfer' && incomePayin?.transaction_reference && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Ref. de transacción:" />
                      <Value text={incomePayin?.transaction_reference} />
                    </div>
                  )}
                  {incomePayin?.type === 'bank_transfer' && incomePayin?.sender_account_number && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="N° Cta. de procedencia" />
                      <Value text={incomePayin?.sender_account_number} />
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Lugar de pago:" />
                    {incomePayin && 'collected_at_school' in incomePayin ? (
                      <PlaceToPay at_school={incomePayin?.collected_at_school} loading={isLoading} />
                    ) : null}
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Cuenta de abono:" />
                    {isLoading && (
                      <div role="status" className="max-w-sm animate-pulse">
                        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-40 mt-2" />
                      </div>
                    )}
                    {!isLoading &&
                      incomePayin &&
                      incomePayin.manual_payment_account &&
                      'account_number' in incomePayin.manual_payment_account && (
                        <div className="col-span-3 w-fit">
                          <div className="flex flex-col">
                            <Value
                              text={
                                incomePayin?.manual_payment_account?.public_summary ||
                                `${incomePayin?.manual_payment_account?.bank_name} - ${incomePayin?.manual_payment_account?.owner}`
                              }
                            />
                            <label className="text-xs font-normal">
                              {incomePayin?.manual_payment_account?.account_number}
                            </label>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Registrado por:" />
                    <Value
                      text={
                        incomePayin?.created_by?.first_name || incomePayin?.created_by?.last_name
                          ? `${incomePayin.created_by?.first_name || ''} ${
                              incomePayin.created_by?.last_name || ''
                            }`.trim()
                          : incomePayin?.created_by?.email || '-'
                      }
                      loading={isLoading}
                      loaderWidth={30}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Fecha de registro:" />
                    <div className="flex col-span-3 w-fit">
                      {isLoading && (
                        <div role="status" className="max-w-sm animate-pulse">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                        </div>
                      )}
                      {!isLoading && incomePayin?.created && (
                        <>
                          <Value text={formatDateShort(incomePayin?.created, true)} />
                          <div className="w-px mx-2 border border-l-gray-500/24" />
                          <Value text={formatTime(incomePayin?.created)} />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Title text="Recibo:" />
                    <LinkToReceipt href={`/receipt?school_id=${selectedSchool?.id}&payin_id=${payinId}`} />
                  </div>
                  {incomePayin?.comment && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Comentario adicional:" />
                      <Value text={incomePayin?.comment} loading={isLoading} />
                    </div>
                  )}
                </div>
                <div id="payment_amount_detail" className="mt-8 px-4 py-5 bg-[#F5F9FF] rounded-lg">
                  <div className="grid grid-cols-4 gap-4">
                    <AmountTitle text="Total pagado:" loading={isLoading} />
                    {!isLoading && incomePayin ? (
                      <label className="flex justify-end text-base font-semibold">
                        {formatPrice(incomePayin?.total, 'MXN')}
                      </label>
                    ) : (
                      <div role="status" className="max-w-sm animate-pulse">
                        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                      </div>
                    )}
                  </div>
                </div>
                <div id="fulfillments" className="mt-8">
                  <div className="grid grid-cols-1 divide-y">
                    <div className="flex justify-between w-full pb-3 border-b">
                      <div>
                        <label className="text-xs font-bold text-gray-600 ">ÓRDENES PAGADAS</label>
                        <label className="ml-1 text-xs font-normal text-gray-600">
                          ({incomePayin?.fulfillments?.length} órdenes)
                        </label>
                      </div>
                      <div>
                        <DownloadMenu items={DownloadMenuItems}>
                          <div className="flex items-center bg-white cursor-pointer">
                            <DownloadButton theme="blue" className="cursor-pointer">
                              <label className="text-sm font-bold cursor-pointer text-blue-secondary">Descargar</label>
                            </DownloadButton>
                          </div>
                        </DownloadMenu>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 mb-6 border rounded-lg border-info border-opacity-[0.9]">
                    {!isLoading &&
                      incomePayin &&
                      typeof incomePayin?.fulfillments !== 'string' &&
                      incomePayin?.payin_fulfillments?.map((payin_fulfillment) => (
                        <FulfillmentPayout
                          key={payin_fulfillment.id}
                          payin_fulfillment={payin_fulfillment}
                          total={incomePayin?.total}
                          setSelectedOrder={(id) =>
                            checkId(
                              keyToValidate || trimId(id),
                              'Ya tienes abierta esta orden en un panel anterior.',
                              () => setSelectedFulfillment(id)
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Dialog.Root open={!!openDialog} position="right">
            <Dialog.Title>¿Estás seguro que deseas desasignar este pago?</Dialog.Title>
            <Dialog.Description>
              Se eliminará el registro de pago y no se emitirá las facturas pendientes.
            </Dialog.Description>
            <div className="flex justify-center gap-x-10">
              <button
                id="dialog-in-drawer-cancel"
                className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap"
                onClick={() => setOpenDialog(false)}
              >
                Cancelar
              </button>
              <Button
                variant="cancel"
                size="tooltip"
                onClick={() => {
                  mutation.mutate();
                  onClose();
                }}
              >
                Eliminar
              </Button>
            </div>
          </Dialog.Root>
        </Sheet.Content>
      </Sheet>
      {selectedFulfillment ? (
        <FulfillmentDetail
          open={Boolean(selectedFulfillment)}
          onClose={() => setSelectedFulfillment(null)}
          paymentId={selectedFulfillment}
        />
      ) : null}
    </>
  );
}

const AmountTitle = ({ text, loading }: { text: string; loading?: boolean }) => (
  <>
    {loading ? (
      <div role="status" className="max-w-sm col-span-3 animate-pulse">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-24" />
      </div>
    ) : (
      <label className="flex items-center col-span-3 text-base font-semibold text-secondary">{text}</label>
    )}
  </>
);

const FulfillmentPayout = ({
  payin_fulfillment,
  setSelectedOrder,
}: {
  payin_fulfillment: DashboardPayinFulfillment;
  setSelectedOrder: (idOrder: string, correlative_id: string) => void;
  total: string;
}) => {
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

  const invoiceStatusI18N: Record<Status, { invoice_status: string; tooltip?: string }> = {
    success: {
      invoice_status: 'Emitida',
    },
    pending: {
      invoice_status: 'Por emitir',
    },
    canceled: {
      invoice_status: 'Cancelada',
    },
    canceling: {
      invoice_status: 'Por cancelar',
    },
    not_requested: {
      invoice_status: 'No facturable',
    },
    failed: {
      invoice_status: 'En revisión',
    },
    multiple: {
      invoice_status: 'Múltiples',
    },
    sponsored: {
      invoice_status: 'Sin factura',
    },
  };
  return (
    <div
      className="grid grid-cols-4 gap-4 py-[22px] px-4 border-b border-gray-500 border-opacity-24 hover:bg-info hover:bg-opacity-[0.04] group hover:cursor-pointer"
      onClick={() => {
        setSelectedOrder(String(payin_fulfillment?.fulfillment?.id), payin_fulfillment?.fulfillment?.correlative_id);
      }}
    >
      <div className="flex items-center col-span-3">
        <label
          className={cn('pr-2 text-sm font-medium text-gray-500 border-r border-gray-500/24', {
            italic: !payin_fulfillment?.fulfillment?.correlative_id,
          })}
        >
          {payin_fulfillment?.fulfillment?.correlative_id ?? 'ID por generar'}
        </label>
        <div className="flex items-center pl-2">
          <label className="mr-2 text-xs font-medium text-gray-600">Factura:</label>
          <InvoiceChip intent={invoiceStatus[payin_fulfillment?.invoice?.status as keyof typeof invoiceStatus]}>
            {invoiceStatusI18N[payin_fulfillment?.invoice?.status as keyof typeof invoiceStatus]?.invoice_status}
          </InvoiceChip>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="bg-transparent">
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
        </button>
      </div>
      <div className="flex col-span-4">
        <div className="flex flex-col w-full">
          <label className="text-sm font-semibold">{payin_fulfillment?.order}</label>
          <div className="flex flex-row items-center justify-between">
            <label className="text-xs font-normal">
              {payin_fulfillment?.fulfillment?.student?.first_name} {payin_fulfillment?.fulfillment?.student?.last_name}
            </label>
            <label className="text-sm font-semibold">{formatPrice(payin_fulfillment?.total_paid, 'MXN')}</label>
          </div>
        </div>
      </div>
    </div>
  );
};
