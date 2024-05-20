import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import ApiClient from '/src/services/ApiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import cx from 'classnames';
import { formatDateShort, formatTime, formatPrice } from '/src/utils/general';
import InvoiceChip from '/src/components/atoms/Chip';
import { Status } from '/types/paid-orders';
import React, { useState } from 'react';
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
import Sheet, { useValidateId } from '/src/components/atoms/Sheet';
import FulfillmentDetail from '../FulfillmentDetail';
import { trimId } from '/src/utils/trim-id';
import { cn } from '/src/utils/cn';

interface PayoutDetailProps {
  openTo: boolean;
  onClose: () => void;
  payoutId: string;
}

export default function PayoutDetail({ openTo, onClose, payoutId }: PayoutDetailProps) {
  const [selectedFulfillment, setSelectedFulfillment] = useState<string | null>(null);
  const checkId = useValidateId();

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  const setIsWorking = useSetIsWorking();
  const setToIdle = useSetToIdle();
  const setIsError = useSetToError();

  const main = async () => {
    const res = await ApiClient.getIncomePayout(session?.token, selectedSchool?.id, payoutId);
    return res?.data;
  };

  const { data: payout, isLoading } = useQuery(['payout_detail', payoutId], main, {
    enabled: !!selectedSchool && openTo,
    onError(err) {
      Sentry.captureException(err);
    },
  });

  const getPayoutsReport = async () =>
    ApiClient.generatePayoutsReport(session?.token, selectedSchool?.id, {
      startDate: null,
      endDate: null,
      ids: [payoutId],
    });

  const addToQueue = useAddToQueue();
  const mutation = useMutation({
    mutationFn: getPayoutsReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const payoutStatus = {
    APPROVED_STATUS: 'Recibido',
    PROCESSING_STATUS: 'En proceso',
    SCHEDULED_STATUS: 'Programado',
  };

  const renderPayoutStatus = (status: string, loading: boolean, children: React.ReactNode) => {
    const classNames = cx('text-sm px-2 w-fit py-1 rounded-md font-bold text-center', {
      'text-[#229A16] bg-[#54D62C] bg-opacity-[0.16]': status === 'APPROVED_STATUS',
      'text-[#B78103] bg-[#FFC107] bg-opacity-[0.16]': status === 'PROCESSING_STATUS',
      'text-[#1890FF] bg-[#1890FF] bg-opacity-[0.12]': status === 'SCHEDULED_STATUS',
      'text-[#454F5B] bg-[#919EAB] bg-opacity-[0.12]': status === 'PENDING_STATUS',
    });
    return (
      <>
        {loading ? (
          <div role="status" className="max-w-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-28" />
          </div>
        ) : (
          <span className={classNames}>{children}</span>
        )}
      </>
    );
  };

  const handleClosePayout = () => {
    onClose();
  };

  const handleAdd = async () => {
    sendTrackEvent('dashboard: Deposits Downloaded', { Type: 'Tabla' });
    await mutation.mutate();
    setIsWorking();
  };

  const downloadInvoices = async (extension: string) => {
    setIsWorking();
    sendTrackEvent('dashboard: Deposits Downloaded', { Type: `Facturas ${extension.toUpperCase()}` });

    return ApiClient.getSchoolPayoutsInvoices(session?.token, selectedSchool?.id, extension, {
      endDate: '',
      startDate: '',
      ids: [payoutId],
    })
      .then((data: Record<string, any>) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
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

  const datePayout = payout?.deposit_date;
  const key = trimId(payoutId);

  return (
    <>
      <Sheet
        open={openTo}
        onOpenChange={(open) => {
          if (!open) handleClosePayout();
        }}
        id={key}
        key={key}
      >
        <Sheet.Content>
          <div className="flex flex-col flex-auto ">
            <div className="sticky top-0 z-10 w-full px-8 bg-white">
              <SidebarHeader
                title="Detalle del depósito"
                subtitle={payout?.correlative_id ?? 'ID por generar'}
                onClose={handleClosePayout}
                subClassName={!payout?.correlative_id ? 'text-[#919EAB] italic text-base font-medium' : undefined}
              />
            </div>
            <div className="flex flex-col justify-between h-full">
              <div className="px-8 mb-2">
                <div id="order-data">
                  <div className="grid grid-cols-1 divide-y">
                    <label className="text-xs font-bold text-[#637381] border-b pb-1">DATOS DEL DEPOSITO </label>
                  </div>
                  <div className="mt-8">
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="ID del depósito:" />
                      <Value
                        text={payout?.correlative_id ?? 'ID por generar'}
                        loading={isLoading}
                        loaderWith={30}
                        className={!payout?.correlative_id ? 'text-[#919EAB] italic text-sm font-semibold' : undefined}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Estado de depósito:" />
                      {renderPayoutStatus(
                        payout?.status,
                        isLoading,
                        payoutStatus[(payout?.status as keyof typeof payoutStatus) || 'PENDING_STATUS']
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Fecha de depósito:" />
                      <div className="flex col-span-3 w-fit">
                        {isLoading && (
                          <div role="status" className="max-w-sm animate-pulse">
                            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                          </div>
                        )}
                        {!isLoading && (
                          <>
                            <Value text={formatDateShort(datePayout, true)} />
                            <div className="w-[1px] mx-2 border border-l-[#919EAB3D]" />
                            <Value text={formatTime(datePayout)} />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Cuenta de abono:" />
                      {isLoading && (
                        <div role="status" className="max-w-sm animate-pulse">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48" />
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-40 mt-2" />
                        </div>
                      )}
                      {!isLoading && (
                        <div className="col-span-3 w-fit">
                          <div className="flex flex-col">
                            <Value text={payout?.bank_account} />
                            <label className="text-xs font-normal">{payout?.bank_account_number}</label>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <Title text="Órdenes incluídas:" />
                      <Value text={payout?.fulfillments?.length || 0} />
                    </div>
                  </div>
                  <div id="payment_amount_detail" className="mt-8 px-4 py-5 bg-[#F5F9FF] rounded-xl">
                    <div className="grid grid-cols-4 gap-4">
                      <AmountTitle
                        text={`Monto recaudado (${payout?.fulfillments?.length} órdenes)`}
                        loading={isLoading}
                      />
                      <label className="flex justify-end text-sm font-normal">
                        {!isLoading && formatPrice(payout?.total_received, 'MXN')}
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <AmountTitle text="Comisión:" loading={isLoading} />
                      <label className="flex justify-end text-sm font-normal">
                        -{!isLoading && formatPrice(payout?.commission, 'MXN')}
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4 border-t border-t-[#637381] pt-5">
                      {isLoading && (
                        <div role="status" className="max-w-sm col-span-3 animate-pulse">
                          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-24" />
                        </div>
                      )}
                      {!isLoading && (
                        <>
                          <label className="flex col-span-3 text-base font-semibold">Total depositado</label>
                          <label className="flex justify-end text-base font-semibold">
                            {formatPrice(payout?.total_received - payout?.commission, 'MXN')}
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div id="fulfillments" className="mt-8">
                  <div className="grid grid-cols-1 divide-y">
                    <div className="flex justify-between w-full pb-3 border-b">
                      <div>
                        <label className="text-xs font-bold text-[#637381] ">CONTENIDO DEL DEPÓSITO</label>
                        <label className="text-xs font-normal text-[#637381] ml-1">
                          ({payout?.fulfillments?.length} órdenes)
                        </label>
                      </div>
                      <div>
                        <button className="flex items-center bg-white cursor-pointer">
                          <label className="text-sm font-bold text-[#3366FF] cursor-pointer">Descargar</label>
                          <DownloadMenu items={DownloadMenuItems}>
                            <DownloadButton theme="blue" />
                          </DownloadMenu>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 mb-6 border rounded-lg border-[#1890FF] border-opacity-[0.9]">
                    {!isLoading &&
                      payout?.fulfillments?.map((fulfillment: Record<string, any>) => (
                        <FulfillmentPayout
                          key={fulfillment.id}
                          fulfillment={fulfillment}
                          setSelectedOrder={(id) =>
                            checkId(trimId(id), 'Ya tienes abierta esta orden en un panel anterior.', () =>
                              setSelectedFulfillment(id)
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

const FulfillmentPayout = ({
  fulfillment,
  setSelectedOrder,
}: {
  fulfillment: any;
  setSelectedOrder: (idOrder: string, correlative_id: string) => void;
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

  const invoiceStatusI18N: Record<Status, { status: string; tooltip?: string }> = {
    success: {
      status: 'Emitida',
    },
    pending: {
      status: 'Por emitir',
    },
    canceled: {
      status: 'Cancelada',
    },
    canceling: {
      status: 'Por cancelar',
    },
    not_requested: {
      status: 'No facturable',
    },
    failed: {
      status: 'En revisión',
    },
    multiple: {
      status: 'Múltiples',
    },
    sponsored: {
      status: 'Sin factura',
    },
  };
  return (
    <div
      className="grid grid-cols-4 gap-4 py-[22px] px-4 border-b border-[#919EAB] border-opacity-[0.24] hover:bg-[#1890FF] hover:bg-opacity-[0.04] group hover:cursor-pointer"
      onClick={() => {
        setSelectedOrder(fulfillment?.id, fulfillment.correlative_id);
      }}
    >
      <div className="flex items-center col-span-3">
        <label
          className={cn('text-sm text-[#919EAB] font-medium border-r border-[#919EAB3D] pr-2', {
            italic: !fulfillment?.correlative_id,
          })}
        >
          {fulfillment?.correlative_id ?? 'ID por generar'}
        </label>
        <div className="flex items-center pl-2">
          <label className="text-xs text-[#637381] font-medium mr-2">Factura:</label>
          <InvoiceChip intent={invoiceStatus[fulfillment?.invoice_status as keyof typeof invoiceStatus]}>
            {invoiceStatusI18N[fulfillment?.invoice_status as keyof typeof invoiceStatusI18N]?.status}
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
          <label className="text-sm font-semibold">{fulfillment?.order_name}</label>
          <div className="flex flex-row items-center justify-between">
            <label className="text-xs font-normal">
              {fulfillment?.student?.first_name} {fulfillment?.student?.last_name}
            </label>
            <label className="text-sm font-semibold">{formatPrice(fulfillment?.final_amount, 'MXN')}</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Title = ({ text }: { text: string }) => (
  <label className="flex items-center text-xs font-medium text-[#637381]">{text}</label>
);

const Value = ({
  text,
  loading,
  loaderWith,
  className,
}: {
  text: string;
  loading?: boolean;
  loaderWith?: number;
  className?: string;
}) => (
  <>
    {loading ? (
      <div role="status" className="max-w-sm animate-pulse">
        <div
          className={`h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 ${loaderWith ? `w-[${loaderWith}px]` : 'w-48'}`}
        />
      </div>
    ) : (
      <label className={cn('col-span-3 w-fit text-sm font-semibold text-[#212B36]', className)}>{text}</label>
    )}
  </>
);

const AmountTitle = ({ text, loading }: { text: string; loading?: boolean }) => (
  <>
    {loading ? (
      <div role="status" className="max-w-sm col-span-3 animate-pulse">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-24" />
      </div>
    ) : (
      <label className="col-span-3 flex items-center text-sm font-normal text-[#212B36]">{text}</label>
    )}
  </>
);
