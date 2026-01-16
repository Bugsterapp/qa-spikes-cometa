import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { TableInfinity } from '../../GridInfinityScroll';
import { formFilterDataToParams, FormFilterData, MultipleFiltersChips } from '../../MultipleFilters';
import Sheet from '../../atoms/Sheet';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import useDebounce from '../../../hooks/useDebounce';
import { useAdjustHeight } from '../../../hooks/useFullScreenHeight';
import useSendTrackEventWithUserName from '../../../hooks/useSendTrackEventWithUserName';
import { api } from '../../../utils/api';
import { extractPageFromURL } from '../../../utils/object-util';
import { ConceptTypesEnum } from '@cometa/trpc';
import { DelinquentStudentExtended, DelinquencyData, DelinquentConcept } from '../../../types';
import { useSchoolCycleSelector } from '../../organisms/dashboard/SchoolCycleSelector';
import { DelinquencyDetails } from '../DelinquencyDetails';
import { DelinquencyRow } from './DelinquencyRow';
import { HeaderTable } from './HeaderTable';
import { useDelinquencyColumnCustomizer } from '../../../hooks/useDelinquencyColumnCustomizer';
import { createColumnHelper, ExpandedState } from '@tanstack/react-table';
import { formatPrice } from '../../../utils/general';
import OrderDetailSidepanel from '../../order/OrderDetailSidepanel';
import { TrackEvents } from '../../../constants/events';

const STORE_KEY_REPORT_CONFIG = 'delinquency' as const;

interface ChargeTableProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSum?: boolean;
  studentId?: string;
  conceptId?: string;
}

export function DelinquencyTable({ hideSum }: ChargeTableProps) {
  const selectedSchool = useSelectedSchool();
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const [conceptTypes, setConceptTypes] = useState<ConceptTypesEnum[]>([]);
  const [grouping, setGrouping] = useState<string>('student_id');

  const handleConceptType = useCallback((items: { value: ConceptTypesEnum; label: string }[]) => {
    setConceptTypes(items.map((item) => item.value));
  }, []);

  const params = {
    search: searchDebounced,
  };
  const [studentDetailId, setStudentDetailId] = useState<string | null>(null);
  const [studentDetailTotalDebt, setStudentDetailTotalDebt] = useState<string | null>(null);

  const { activeCycle, schoolCycles, selectedSchoolCycle, setSelectedSchoolCycle } =
    useSchoolCycleSelector(STORE_KEY_REPORT_CONFIG);
  const {
    data: fulfillmentTable,
    isFetching,
    isPending: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.delinquency.getDelinquency.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      query: {
        concept_types: conceptTypes,
        school_cycles:
          selectedSchoolCycle === undefined && activeCycle
            ? [activeCycle.id as string]
            : selectedSchoolCycle
            ? [selectedSchoolCycle.id as string]
            : selectedSchoolCycle === null
            ? []
            : [],
        ...paramsFromForm,
        ...params,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) =>
        extractPageFromURL((firstPage as DelinquencyData)?.previous as string) ?? undefined,
      enabled: !!selectedSchool?.id,
      trpc: { context: { skipBatch: true } },
    }
  );

  const totalStudentsFetched = useMemo(
    () => fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []).length,
    [fulfillmentTable]
  );

  const flatData = useMemo(() => {
    const data = fulfillmentTable?.pages?.flatMap((page) => page?.results ?? []) ?? [];
    if (grouping === 'delinquent_concept_name') {
      return data.flatMap((student) =>
        (student.delinquent_concepts as unknown as DelinquentConcept[]).map((concept) => ({
          ...student,
          delinquent_concept_id: concept.id,
          delinquent_concept_name: concept.name,
        }))
      );
    }
    return data;
  }, [fulfillmentTable, grouping]);

  const totalCount = useMemo(() => fulfillmentTable?.pages?.[0]?.count ?? 0, [fulfillmentTable]);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  const columnHelper = createColumnHelper<DelinquentStudentExtended>();

  // 2. CRASH FIX: Use .display() for columns that don't exist in the Slim object.
  // This keeps the header visible but stops Tanstack Table from trying to read undefined data.
  const columns = [
    columnHelper.accessor('id', {
      id: 'student_id',
      header: () => null,
    }),
    columnHelper.accessor('guardian_name', {
      id: 'guardian_name',
      header: () => null,
    }),
    columnHelper.accessor('delinquent_concept_name', {
      id: 'delinquent_concept_name',
      header: () => null,
    }),
    columnHelper.accessor('level', {
      id: 'level',
      header: () => null,
    }),
    columnHelper.accessor('section', {
      id: 'section',
      header: () => null,
    }),
  ];

  const { tableColumns, visibleTableColumns, handleColumnsChange } = useDelinquencyColumnCustomizer({
    tableName: STORE_KEY_REPORT_CONFIG,
    columns,
  });

  const handleFilter = useCallback((data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  }, []);

  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const { wrapperRef, headerRef, maxHeight } = useAdjustHeight(550);

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [selectedOrder, setSelectedOrder] = useState<{ order: string; student: string } | null>(null);

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)]" ref={wrapperRef}>
      <Sheet
        open={Boolean(studentDetailId)}
        onOpenChange={(open) => {
          if (!open) setStudentDetailId(null);
        }}
      >
        <Sheet.Content>
          {studentDetailId ? (
            <DelinquencyDetails
              student_id={studentDetailId}
              total_debt={studentDetailTotalDebt ?? undefined}
              handleCloseDetails={() => setStudentDetailId(null)}
            />
          ) : (
            <> </>
          )}
        </Sheet.Content>
      </Sheet>
      <div ref={headerRef} className="pb-4">
        <HeaderTable
          title="Morosidad"
          filterParams={paramsFromForm}
          handleFilter={handleFilter}
          handleClearFilter={() => setFormFilterData({})}
          setSelectedItemsCount={setItemsCount}
          itemsCount={itemsCount}
          setSearch={setSearch}
          search={search}
          multiSelectChange={handleConceptType}
          conceptTypes={conceptTypes}
          schoolCycle={selectedSchoolCycle ?? null}
          setSchoolCycle={setSelectedSchoolCycle}
          schoolCycles={schoolCycles ?? []}
          tableColumns={tableColumns}
          handleColumnsChange={handleColumnsChange}
          searchDebounced={searchDebounced}
          selectedSchoolCycle={selectedSchoolCycle ?? undefined}
          formFilterData={formFilterData}
          grouping={grouping}
          setGrouping={setGrouping}
        />
        <div className="px-4">
          <MultipleFiltersChips
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            setItemsCount={setItemsCount}
            itemsCount={itemsCount}
            tableName={STORE_KEY_REPORT_CONFIG}
          />{' '}
        </div>
      </div>
      <div className="px-3">
        <div className="grid grid-cols-delinquency items-center gap-2 h-[56px] px-6 font-semibold text-gray-700 bg-gray-200 rounded-lg">
          <div>Orden</div>
          <div>Fecha Vcto.</div>
          <div>Estado</div>
          <div className="text-right">Recargos</div>
          <div className="text-right">Dctos y becas</div>
          <div className="text-right">Pagado</div>
          <div className="text-right">Por Pagar</div>
        </div>
      </div>
      <div>
        <TableInfinity
          hideHeader
          data={flatData || []}
          columns={visibleTableColumns}
          totalCount={totalCount || 0}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetching={isFetching}
          isLoading={isLoading}
          hideSum={hideSum}
          totalFetched={totalStudentsFetched || 0}
          maxHeight={maxHeight}
          isFetchingNextPage={isFetchingNextPage}
          emptyStateText={
            !isFetching && !isLoading && !flatData?.length
              ? 'No hemos encontrado órdenes vencidas con esos criterios de búsqueda'
              : ''
          }
          showEmptyStateImage={!isFetching && !isLoading && !flatData?.length}
          state={{
            grouping: grouping === 'student_id' ? [] : [grouping],
            expanded,
          }}
          onExpandedChange={setExpanded}
        >
          {(row) => (
            <DelinquencyRow
              row={row}
              searchDebounced={searchDebounced}
              sendTrackEventWithUserName={sendTrackEventWithUserName}
              setStudentDetailId={setStudentDetailId}
              setStudentDetailTotalDebt={setStudentDetailTotalDebt}
              setSelectedOrder={setSelectedOrder}
              grouping={grouping}
              setExpanded={setExpanded}
            />
          )}
        </TableInfinity>
      </div>
      <div className="relative">
        <footer className="absolute py-4 bg-[#F4F6F8] bottom-0 inset-x-0 px-8">
          <div className="flex items-center justify-between pr-16 pl-7">
            <span className="text-xs text-[#454F5B]">
              <strong className="text-sm text-[#212B36] font-semibold mr-1" data-testid="totalStudents-txt">
                {fulfillmentTable?.pages[0]?.count || '-'}
              </strong>
              estudiantes
            </span>
            <span className="text-xs text-[#454F5B] text-right">
              Deuda total
              <strong className="ml-1 text-sm text-[#212B36] font-semibold">
                {(fulfillmentTable?.pages[0] as DelinquencyData)?.total_debt
                  ? formatPrice((fulfillmentTable?.pages[0] as DelinquencyData)?.total_debt)
                  : '-'}
              </strong>
            </span>
          </div>
        </footer>
        {selectedOrder ? (
          <OrderDetailSidepanel
            onClose={() => {
              setSelectedOrder(null);
              sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_student_detail_close, {});
            }}
            orderId={selectedOrder?.order}
            studentId={selectedOrder?.student}
            open={!!selectedOrder}
            typeOfOrder="DUE"
          />
        ) : null}
      </div>
    </div>
  );
}
