import { useRef, useState } from 'react';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useRouter } from 'next/router';
import { api } from '/src/utils/api';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { ConceptOrdersListSuccessResponse } from '@cometa/trpc/src/types';
import { formatDateWithSpanishFormat } from '/src/utils/general';
import { renderMoney } from '/src/utils/datagridHeaders';
import QuestionIcon from '/public/assets/icons/ic_interrogation.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { GenericRowCheckBoxButton } from '../StudentAssignedTable';
import { FloatingActionOverlay, TableVirtualized } from '/src/components/TableInfinityScroll';
import useToggle from '/src/hooks/useToggle';
import useAlert from '/src/hooks/useAlert';
import { useFlags } from '/flags/client';
import { useSession } from 'next-auth/react';

export const ConceptOrdersTable = () => {
  const [search, setSearch] = useState('');
  const selectedSchoolId = useSelectedSchoolId();
  const { setAlertState } = useAlert();

  const router = useRouter();
  const conceptId = router.query.conceptId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [key, setKey] = useState(0);
  const { toggle, onOpen, onClose, setToggle } = useToggle(false);
  const {
    data: orders,
    isLoading,
    isFetching,
  } = api.schools.schoolsConceptsOrdersRetrive.useQuery(
    {
      concept_id: conceptId as string,
      school_id: selectedSchoolId ?? '',
      search,
    },
    {
      enabled: !!conceptId,
    }
  );

  const handleSelectOrder = (orderId: string) => {
    setKey((prev) => prev + 1);
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  const columnHelper = createColumnHelper<ConceptOrdersListSuccessResponse>();

  const handleSelectAllOrders = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders?.map((order) => order.id) ?? []);
    }
    setSelectAll(!selectAll);
  };
  const editPricesMutation = api.concepts.conceptsEditOrdersPrices.useMutation({
    onSuccess: async () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: `Se modificó el precio de ${selectedOrders.length} ${
          selectedOrders.length === 1 ? 'orden' : 'órdenes'
        }.`,
      });
      await utils.schools.schoolsConceptsOrdersRetrive.invalidate();
      setSelectedOrders([]);
      setSelectAll(false);
      onClose();
      await utils.invalidate();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudieron modificar los precios seleccionados.',
      });
      onClose();
      setSelectedOrders([]);
      setSelectAll(false);
    },
  });
  const utils = api.useUtils();

  const handleEditPrices = async (data: { price: number }) => {
    await editPricesMutation.mutate({
      schoolId: selectedSchoolId || '',
      id: conceptId as string,
      orders: selectedOrders,
      price: data.price,
    });
  };
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { flags } = useFlags({ traits: { email: session?.user.email, schoolName: selectedSchool?.name } });
  const columns = [
    ...(flags?.show_edit_prices
      ? [
          {
            id: 'select',
            header: () => (
              <GenericRowCheckBoxButton checked={selectAll} onClick={handleSelectAllOrders} className="p-2" />
            ),
            cell: ({ row }: { row: Row<ConceptOrdersListSuccessResponse> }) => (
              <GenericRowCheckBoxButton
                className="p-2"
                checked={selectedOrders.includes(row.original.id)}
                onClick={() => handleSelectOrder(row.original.id)}
              />
            ),
            size: 80,
          },
        ]
      : []),
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex flex-col w-[434px]">
          <div className="text-sm text-[#212B36] truncate" title={`${info.row.original.name}`}>
            {info.row.original.name.includes('-')
              ? info.row.original.name.replaceAll('-', ' / ')
              : info.row.original.name}
          </div>
        </div>
      ),
      size: 380,
      header: () => <span className="font-semibold">Orden</span>,
    }),
    columnHelper.accessor('total_students', {
      cell: (info) => (
        <div className="text-sm text-[#212B36]">
          <span className="font-bold">{info.row.original.total_students - info.row.original.delinquent_students} </span>
          de
          <span className="font-bold"> {info.row.original.total_students} </span>
          alumnos
        </div>
      ),
      size: 150,
      header: () => (
        <div className="flex items-center">
          <span className="font-semibold">Cobranza</span>
          <Tooltip message="Son la cantidad de alumnos que han realizado un pago completo, parcial o en proceso; del total de alumnos asignados.">
            <QuestionIcon className="w-4 h-4 ml-1" />
          </Tooltip>
        </div>
      ),
    }),
    columnHelper.accessor('due', {
      cell: (info) => (
        <div className="text-sm text-[#212B36]">{formatDateWithSpanishFormat(info.row.original.due)}</div>
      ),
      size: 200,
      header: () => <span className="font-semibold">Vencimiento</span>,
    }),
    columnHelper.accessor('price', {
      cell: (info) => <div className="text-sm text-[#212B36]">{renderMoney(info.row.original.price)}</div>,
      size: 100,
      header: () => <span className="font-semibold">Precio</span>,
    }),
  ];
  const anOrderHasAPayment = selectedOrders.some((selectedOrder) => {
    const order = orders?.find((order) => order.id === selectedOrder);
    if (order) {
      const { total_students, delinquent_students } = order;
      return total_students > 0 && delinquent_students < total_students;
    }
    return false;
  });
  return (
    <div>
      <div className="flex py-8 items-start px-10 sticky top-[220px] z-20 bg-white flex-col -translate-y-3.5">
        <div className="flex items-center">
          <GlobalSearch
            search={search}
            setSearch={setSearch}
            placeholder="Buscar órdenes"
            typeButton="button"
            className="min-w-[544px]"
          />
        </div>
      </div>
      <div className="bg-white relative h-[calc(100vh-320px)]" ref={wrapperRef}>
        {selectedOrders.length > 0 ? (
          <FloatingActionOverlay
            itemCount={selectedOrders.length}
            itemLabel={selectedOrders.length === 1 ? 'orden seleccionada' : 'órdenes seleccionadas'}
            actionContent="Editar precios"
            buttonType="green"
            onAction={onOpen}
            isWide
          />
        ) : null}
        <EditPriceModal
          key={key}
          onSubmit={handleEditPrices}
          open={toggle}
          setOpen={setToggle}
          isLoading={editPricesMutation.isLoading}
          anOrderHasAPayment={anOrderHasAPayment}
        />
        <TableVirtualized
          data={orders ?? []}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          isFetchingNextPage={false}
          totalFetched={orders?.length ?? 0}
          columns={columns}
          isLoading={isLoading}
          maxHeight={wrapperRef.current?.offsetHeight}
          isFetching={isFetching}
          selectedRowsToHighlight={selectedOrders}
          hasSelectedOrders={selectedOrders?.length > 5 && orders && orders?.length > 5}
          hideSum
          totalCount={orders?.length ?? 0}
        />
      </div>
    </div>
  );
};

import { Controller, useForm } from 'react-hook-form';
import Dialog from '/src/components/atoms/Dialog';
import MoneyInput from '../../../ui/MoneyInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../Button';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';

type EditPriceFormValues = {
  price: number;
};

type EditPriceModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: EditPriceFormValues) => void;
  isLoading?: boolean;
  anOrderHasAPayment: boolean;
};

export const EditPriceModal: React.FC<EditPriceModalProps> = ({
  open,
  setOpen,
  onSubmit,
  isLoading,
  anOrderHasAPayment,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPriceFormValues>({
    resolver: zodResolver(
      z.object({
        price: z.number({
          required_error: 'El precio es requerido',
          invalid_type_error: 'El precio debe ser un número',
        }),
      })
    ),
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} classNames="w-[433px]">
      <Dialog.Title>Editar precios</Dialog.Title>
      <Dialog.Description className="text-sm">
        Ingresa el nuevo precio que tendrán las órdenes seleccionadas.
      </Dialog.Description>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="flex flex-col gap-4">
          <div className="pb-3">
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <MoneyInput
                  {...field}
                  prefix="MXN"
                  label="Nuevo precio"
                  error={errors.price?.message}
                  value={field.value}
                />
              )}
            />
          </div>
          {anOrderHasAPayment && (
            <div className="bg-[#FFF7CD] rounded-lg p-3 text-sm flex gap-2 items-center">
              <Warning className="text-[#FFC107] w-5 h-5" />
              <p className="text-[#7A4F01] text-left max-w-[320px] text-sm">
                El cambio no afectará a los pagos que ya hayan sido realizados o se encuentren en proceso.
              </p>
            </div>
          )}
          <div className="flex px-6 items-center">
            <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 text-green">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-9">
              {isLoading ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-6" /> : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog.Root>
  );
};
