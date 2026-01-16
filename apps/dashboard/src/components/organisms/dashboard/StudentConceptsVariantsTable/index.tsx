import { OptionalConceptOrders } from '@cometa/trpc/src/types';
import { keepPreviousData } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarVariants from '/src/components/SidebarVariants';
import { FloatingActionOverlay, TableVirtualized } from '/src/components/TableInfinityScroll';
import { convertToOrdering } from '/src/components/Table';
import { useTab } from '/src/components/ui/Tabs';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useToggle from '/src/hooks/useToggle';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { formatPrice } from '/src/utils/general';

import { EditPriceModal } from '../ConceptOrdersTable';
import { GenericRowCheckBoxButton } from '../StudentAssignedTable';

export const StudentConceptsVariantsTable = () => {
  const selectedSchoolId = useSelectedSchoolId();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const conceptId = router.query.conceptId;
  const [search, setSearch] = useState('');
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<OptionalConceptOrders['id']>();
  const [key, setKey] = useState(0);
  const [variantsSorting, setVariantsSorting] = useState<string>();
  const {
    data: ordersWithVariantsAndStock,
    isLoading: isLoadingOptionalOrders,
    isFetching: isFetchingOrdersWithVariantsAndStock,
  } = api.concepts.optionalConceptsOrdersList.useQuery(
    {
      conceptId: conceptId as string,
      schoolId: selectedSchoolId ?? '',
      query: {
        multiple_search: search,
        ordering: variantsSorting ? [variantsSorting] : undefined,
      },
    },
    {
      enabled: !!conceptId,
      placeholderData: keepPreviousData,
    }
  );

  const tabsConceptsData = [
    {
      value: 'details',
      label: 'Detalles',
    },
    {
      value: 'history-of-changes',
      label: 'Historial de cambios',
    },
  ];
  const { tab, handleChangeTab } = useTab('details');
  const handleSelectOrder = (orderId: string) => {
    setKey((prev) => prev + 1);
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleSelectAllOrders = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ordersWithVariantsAndStock?.map((order) => order.id) ?? []);
    }
    setSelectAll(!selectAll);
  };
  const { toggle, onOpen, onClose, setToggle } = useToggle(false);

  const editPricesMutation = api.concepts.conceptsEditOrdersPrices.useMutation({
    onSuccess: async () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: `Se modificó el precio de ${selectedOrders.length} ${
          selectedOrders.length === 1 ? 'variante' : 'variantes'
        }.`,
      });
      await utils.concepts.optionalConceptsOrdersList.invalidate();
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const handleEditPrices = async (data: { price: number }) => {
    await editPricesMutation.mutate({
      schoolId: selectedSchoolId || '',
      id: conceptId as string,
      orders: selectedOrders,
      price: data.price,
    });
  };

  const columnHelper = createColumnHelper<OptionalConceptOrders>();
  const { isEnabled: showEditPrices } = useFlagWithVariableMatching('hk_show_edit_prices');

  const columns = [
    ...(showEditPrices
      ? [
          {
            id: 'select',
            header: () => (
              <span className="flex items-center">
                <GenericRowCheckBoxButton
                  checked={
                    selectedOrders.length === 0
                      ? false
                      : selectedOrders.length === ordersWithVariantsAndStock?.length
                      ? true
                      : 'indeterminate'
                  }
                  onClick={handleSelectAllOrders}
                />
              </span>
            ),
            cell: ({ row }: { row: any }) => (
              <GenericRowCheckBoxButton
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
          <Tooltip message={info.row.original.name}>
            <div className="text-sm text-[#212B36] truncate max-w-[300px] w-full" title={`${info.row.original.name}`}>
              {info.row.original.name.includes('-')
                ? info.row.original.name.replaceAll('-', ' / ')
                : info.row.original.name}
            </div>
          </Tooltip>
        </div>
      ),
      size: 350,
      header: () => <span className="font-semibold">Nombre</span>,
    }),
    columnHelper.accessor('sold_units', {
      cell: (info) => (
        <div className="flex flex-col w-[222px] gap-1">
          <span className="pl-1">{+info.getValue() === 1 ? '1 unidad' : `${info.getValue()} unidades`}</span>
          {+info.row.original.in_payment_process !== 0 && (
            <span className="text-[#454D64] text-xs pl-1">
              {+info.row.original.in_payment_process === 1
                ? '1 pago en proceso'
                : `${info.row.original.in_payment_process} pagos en proceso`}
            </span>
          )}
        </div>
      ),
      header: () => <span className="font-semibold">Unidades vendidas</span>,
      size: 170,
      enableSorting: true,
    }),
    columnHelper.accessor('price', {
      cell: (info) => <div className="w-[100px] text-right">{formatPrice(info.getValue())}</div>,
      header: () => <span className="font-semibold w-[100px] text-right">Precio</span>,
      enableSorting: true,
      meta: { numeric: true },
    }),
    columnHelper.accessor('stock', {
      cell: (info) => (
        <div className="w-[100px] text-right pr-10">
          {/* this contract is gonna change in the near future (next feature) to correctly manage this field, and the correct display of it @Kevo ft @Micky */}
          {!info.row.original.stock
            ? 'Ilimitado'
            : info.row.original.stock.is_limited
            ? info.row.original.stock.quantity
            : 'Ilimitado'}
        </div>
      ),
      header: () => (
        <span id="stock-column" className="font-semibold w-[100px] text-right pr-10">
          Stock
        </span>
      ),
      enableSorting: true,
      meta: { numeric: true },
    }),
  ];
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const anOrderHasAPayment = selectedOrders.some((selectedOrder) => {
    const order = ordersWithVariantsAndStock?.find((order) => order.id === selectedOrder);
    if (order) {
      return typeof order.sold_units === 'number' && order.sold_units > 0;
    }
    return false;
  });

  return (
    <div className="bg-white">
      <div className="flex py-6 items-start px-10 sticky top-[135px] z-20 bg-white flex-col">
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
      <div
        className={cn('relative h-[calc(100vh-290px)]', { 'h-[calc(100vh-325px)]': selectedOrders.length > 0 })}
        ref={wrapperRef}
      >
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
          isLoading={editPricesMutation.isPending}
          anOrderHasAPayment={anOrderHasAPayment}
        />
        <TableVirtualized
          hasNextPage={false}
          fetchNextPage={() => void 0}
          isFetchingNextPage={false}
          totalFetched={ordersWithVariantsAndStock?.length ?? 0}
          data={ordersWithVariantsAndStock ?? []}
          columns={columns}
          totalCount={ordersWithVariantsAndStock?.length || 0}
          isLoading={isLoadingOptionalOrders}
          isFetching={isFetchingOrdersWithVariantsAndStock}
          maxHeight={wrapperRef.current?.offsetHeight}
          selectedRowsToHighlight={selectedOrders}
          hasSelectedOrders={
            selectedOrders?.length > 0 && ordersWithVariantsAndStock && ordersWithVariantsAndStock?.length > 4
          }
          onRowClick={(row) => {
            setSelectedRow(row.id);
            setOpenSideBar(true);
            handleChangeTab('details');
          }}
          hideSum
          showEmptyStateImage
          onSortingChange={(sorting) => {
            const text = convertToOrdering(sorting);
            setVariantsSorting(text);
          }}
        />

        <SidebarVariants
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          tabsConceptsData={tabsConceptsData}
          tab={tab}
          handleChangeTab={handleChangeTab}
          serverData={ordersWithVariantsAndStock}
          key={selectedRow}
        />
      </div>
    </div>
  );
};
