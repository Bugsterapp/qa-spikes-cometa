import AddIcon from '/public/assets/icons/ic_plus.svg';
import IcDownload from '/public/assets/icons/ic_download.svg';
import * as InfoBox from '/src/components/ui/InfoBox';
import { createColumnHelper } from '@tanstack/react-table';
import { AnchorHTMLAttributes, useState } from 'react';
import { sendTrackEvent } from '/src/utils/events';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import useToggle from '/src/hooks/useToggle';
import { Events } from '/src/constants/events';
import Sheet from '/src/components/atoms/Sheet';
import Button from '/src/components/organisms/dashboard/Button';
import ConceptAssignment from '/src/components/organisms/dashboard/ConceptAssignment';
import ConceptAssignmentOptional from '/src/components/organisms/dashboard/ConceptAssignmentOptional';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { StudentAssignment } from '@cometa/trpc/src/types';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { Tooltip } from '/src/components/atoms/Tooltip';
import PlaceToPay from '/src/components/atoms/PlaceToPay';
import InvoiceChip, { Intent } from '/src/components/atoms/Chip';
import { Status } from '/types/paid-orders';
import { OrderNameWithParcial } from '/src/components/molecules/dashboard/OrderNameWithParcial';
import { cn } from '/src/utils/cn';
import { formatDateShort } from '/src/utils/general';
import { parseCurrency, toFloat } from '@cometa/utils';
import OrderDetailSidepanel from '/src/components/order/OrderDetailSidepanel';

export function AssignedConcepts({
  studentId,
  schoolCycle,
  disabledActions,
}: {
  studentId?: string | null;
  schoolCycle?: { id: string; name: string };
  disabledActions?: boolean;
}) {
  const selectedSchool = useSelectedSchool();
  const utils = api.useUtils();

  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const [assignment, setAssignment] = useState<{ conceptId: string; assigmentId: string } | null>(null);

  const {
    toggle: openConceptAssignmentForm,
    onClose: onCloseConceptAssignmentForm,
    onOpen: onOpenConceptAssignmentForm,
  } = useToggle();
  const {
    toggle: openConceptAssignmentEdit,
    onClose: onCloseConceptAssignmentEdit,
    onOpen: onOpenConceptAssignmentEdit,
  } = useToggle();
  const permissions = useGetPermissions();

  const {
    data: concepts,
    isPending: isLoading,
    isFetching,
  } = api.students.studentsAssignments.useQuery({ studentId: studentId as string }, { enabled: !!studentId });

  const { data: conceptTypesList } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool,
    }
  );

  const handleOpenConceptAssignment = () => {
    onOpenConceptAssignmentForm();
    sendTrackEventWithUserName(Events.concept_click_assignment);
  };

  const handleOpenDetail = (row: StudentAssignment) => {
    sendTrackEvent(Events.concept_detail, { source: document.title.split(' | ')[0] });
    setAssignment({ conceptId: row.concept.id, assigmentId: row.id });
    onOpenConceptAssignmentEdit();
    sendTrackEventWithUserName(Events.concept_detail_viewed, { conceptName: row.concept.name });
  };

  const columnHelper = createColumnHelper<StudentAssignment>();
  const columns = [
    columnHelper.accessor('concept.name', {
      header: () => <span className="font-semibold text-sm">Nombre</span>,
      cell: (info) => <span className="text-sm text-[#212B36]">{info.row.original.concept.name}</span>,
    }),
    columnHelper.accessor('concept.type', {
      header: () => <span className="font-semibold text-sm">Tipo de concepto</span>,
      cell: (info) => {
        const conceptType = info.row.original.concept.type;
        const typeFound = conceptTypesList?.find((c) => c.id === conceptType);
        const typeName = typeFound ? typeFound.name : null;

        return <span className="text-sm text-[#212B36]">{typeName}</span>;
      },
    }),
    columnHelper.accessor('concept.school_cycle.name', {
      header: () => <span className="font-semibold text-sm">Ciclo escolar</span>,
      cell: (info) => info.row.original.concept.school_cycle.name,
    }),
  ];

  const conceptsCount = concepts?.length ?? 0;

  return (
    <InfoBox.Root>
      <InfoBox.Header title="Conceptos asignados">
        {permissions?.can_add_concept_assignment && !disabledActions ? (
          <Button
            onClick={handleOpenConceptAssignment}
            className="rounded-full"
            leftIcon={<AddIcon fill="currentColor" />}
          >
            Asignar concepto
          </Button>
        ) : null}
      </InfoBox.Header>

      <InfoBox.Content>
        <TableVirtualized
          data={concepts ?? []}
          columns={columns}
          onRowClick={handleOpenDetail}
          isLoading={isLoading}
          isFetching={isFetching}
          emptyStateText="Este prospecto aún no tiene conceptos asignados."
          totalCount={conceptsCount}
          totalFetched={conceptsCount}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          maxHeight={200}
          hideFooter
          rounded
          classNameContainer="min-h-[200px]"
          addMorePaddingFirstRow
        />

        {studentId ? (
          <>
            <Sheet open={openConceptAssignmentEdit} onOpenChange={onCloseConceptAssignmentEdit}>
              <Sheet.Content>
                <ConceptAssignmentOptional
                  onClose={onCloseConceptAssignmentEdit}
                  student={null}
                  assignment={assignment}
                  studentId={studentId}
                  onSuccessDesassign={async () => {
                    await utils.students.studentsAssignments.invalidate();
                  }}
                />
              </Sheet.Content>
            </Sheet>
            <Sheet open={openConceptAssignmentForm} onOpenChange={onCloseConceptAssignmentForm}>
              <Sheet.Content>
                <ConceptAssignment
                  onClose={onCloseConceptAssignmentForm}
                  studentId={studentId}
                  source="lead"
                  defaultSchoolCycle={schoolCycle}
                />
              </Sheet.Content>
            </Sheet>
          </>
        ) : null}
      </InfoBox.Content>
    </InfoBox.Root>
  );
}

export function PaidOrders({ studentId }: { studentId?: string | null }) {
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const selectedSchool = useSelectedSchool();
  const [ordenDetailId, setOrdenDetailId] = useState('');

  const {
    data: fulfillments,
    isFetching,
    isPending: isLoading,
  } = api.payments.listFulfillment.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        students: [studentId as string],
      },
    },
    {
      enabled: !!selectedSchool?.id && !!studentId,
    }
  );

  const fulfillmentsResults = fulfillments?.results ?? [];

  function handleOpenDetail(row: (typeof fulfillmentsResults)[number]) {
    sendTrackEvent(Events.paid_orders_detail_opened, { source: document.title.split(' | ')[0] });
    setOrdenDetailId(row.id);
    onOpenTo();
  }

  const columnHelper = createColumnHelper<(typeof fulfillmentsResults)[number]>();
  const columns = [
    columnHelper.accessor('order_name', {
      header: () => <span className="font-semibold text-sm">Orden</span>,
      cell: (info) => (
        <OrderNameWithParcial
          name={info.row.original.order_name}
          isParcial={
            info.row.original.status === 'PARTIAL_PAID' ||
            (info.row.original.status !== 'PAID' && info.row.original.payins.length > 1)
          }
        />
      ),
      minSize: 250,
    }),
    columnHelper.accessor('guardian', {
      header: () => <span className="font-semibold text-sm">Pagador (Tutor)</span>,
      cell: (info) => {
        const sponsored = info.row.original.is_sponsored;
        return (
          <span className="text-sm text-[#212B36]">
            {sponsored
              ? 'Patrocinado'
              : `${info.row.original?.guardian?.first_name} ${info.row.original?.guardian?.last_name}`}
          </span>
        );
      },
    }),
    columnHelper.accessor('payins.paid_date', {
      header: () => <span className="font-semibold text-sm">Fecha de pago</span>,
      cell: (info) => {
        const date = info.row.original.payins[0]?.paid_date;
        const value =
          info.row.original.payins.length > 1 || !info.getValue()
            ? formatDateShort(date || '')
            : formatDateShort((info.getValue() as string) || '');
        return <span className="text-sm text-[#212B36]">{value}</span>;
      },
    }),
    columnHelper.accessor('total_paid', {
      header: () => <span className="font-semibold text-sm">Monto pagado</span>,
      cell: (info) => (
        <span className="text-sm text-[#212B36] py-1">
          {parseCurrency(toFloat(info.getValue() || '0'), 'MXN') || '-'}
        </span>
      ),
      meta: { numeric: true },
      footer: () => (
        <>
          {fulfillments?.total_amount && (
            <span className="flex flex-col items-start pl-3 text-xs">
              Suma{' '}
              <strong className="text-sm font-bold">{parseCurrency(toFloat(fulfillments.total_amount), 'MXN')}</strong>
            </span>
          )}
        </>
      ),
    }),
    columnHelper.accessor('invoice_status', {
      header: () => <span className="font-semibold text-sm">Facturación</span>,
      cell: (info) => {
        const status = info.row.original.is_sponsored ? 'sponsored' : info.getValue();
        const invoiceStatus: Record<string, Intent> = {
          success: 'success',
          pending: 'info',
          canceled: 'error',
          canceling: 'error',
          not_requested: 'disabled',
          failed: 'warning',
          multiple: 'neutral',
          sponsored: 'disabled',
        };
        const invoiceStatusI18N: Record<string, { status: string; tooltip?: string }> = {
          success: {
            status: 'Emitida',
          },
          pending: {
            status: 'Por emitir',
            tooltip: `La factura se emitirá hoy a las ${
              selectedSchool?.config_dashboard?.emit_invoice_time || '11:59'
            }`,
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
            status: 'Sin factura',
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
          <Tooltip message={invoiceStatusI18N[status as Status]?.tooltip}>
            <InvoiceChip intent={invoiceStatus[status as Status]}>
              {invoiceStatusI18N[status as Status]?.status}
            </InvoiceChip>
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor('invoices', {
      header: () => <span className="font-semibold text-sm">Folio de factura</span>,
      cell: (info) => {
        const { invoices } = info.row.original;
        const lastInvoice = invoices[0];
        const Element = lastInvoice?.pdf_url ? 'a' : 'span';
        const Props: AnchorHTMLAttributes<HTMLAnchorElement> = {
          href: lastInvoice?.pdf_url,
          target: '_blank',
          rel: 'noreferrer noopener',
          onClick: (e) => e.stopPropagation(),
        };
        const value = lastInvoice?.fiscal_identifier;

        return (
          <div className="grid grid-cols-3 gap-1 min-w-[200px]">
            <div className="col-span-2">
              <div className="flex items-center">
                <span className="max-w-[100px] whitespace-nowrap text-ellipsis overflow-hidden block">
                  {value || '-'}
                </span>
              </div>
            </div>
            <div>
              <Element
                {...(lastInvoice?.pdf_url ? Props : undefined)}
                className={cn('text-gray-400 text-center', {
                  'text-blue-secondary': !!lastInvoice?.pdf_url,
                })}
              >
                <IcDownload fill="currentColor" className="mx-auto" />
              </Element>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('collected_at_school', {
      header: () => <span className="font-semibold text-sm">Lugar de pago</span>,
      cell: (info) => {
        const { is_sponsored } = info.row.original;
        return <PlaceToPay at_school={info.getValue() as boolean} sponsored={is_sponsored} />;
      },
    }),
    columnHelper.accessor('payins.correlative_id', {
      header: () => <span className="font-semibold text-sm">Pagos vinculados</span>,
      cell: (info) => {
        const { payins } = info.row.original;
        const lastPayin = payins[0];
        const restPayins = payins.slice(1);

        return (
          <div className="flex flex-row">
            <span>{lastPayin?.correlative_id}</span>
            {restPayins.length ? (
              <Tooltip message={restPayins.map((payin) => payin.correlative_id).join(', ')}>
                <span className="px-2 py-1 ml-1 font-semibold text-center rounded-full text-info bg-info/8">
                  +{restPayins.length}
                </span>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor('payout', {
      header: () => <span className="font-semibold text-sm">Depósito vinculado</span>,
      cell: (info) => <span className="text-sm text-[#212B36]">{info.getValue()?.correlative_id || '-'}</span>,
    }),
  ];

  const fulfillmentsCount = fulfillments?.count ?? 0;

  return (
    <InfoBox.Root>
      <InfoBox.Header title="Órdenes pagadas" />

      <InfoBox.Content>
        <TableVirtualized
          data={fulfillments?.results || []}
          columns={columns}
          onRowClick={handleOpenDetail}
          isLoading={isLoading}
          isFetching={isFetching}
          emptyStateText="No hay órdenes pagadas"
          totalCount={fulfillmentsCount}
          totalFetched={fulfillmentsCount}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          maxHeight={200}
          hideFooter
          rounded
          classNameContainer="min-h-[200px]"
          addMorePaddingFirstRow
        />
      </InfoBox.Content>

      <OrderDetailSidepanel typeOfOrder="PAYMENT" open={openTo} onClose={onCloseTo} fulfillmentId={ordenDetailId} />
    </InfoBox.Root>
  );
}
