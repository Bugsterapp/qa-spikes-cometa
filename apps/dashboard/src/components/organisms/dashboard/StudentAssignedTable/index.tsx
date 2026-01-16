import { ConceptStudent, StudentStatusSummary } from '@cometa/trpc/src/types';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { HighlightMatch } from '/src/components/atoms/HighlightMatch';
import { Checkbox } from '/src/components/atoms/RadixCheckbox';
import Sheet from '/src/components/atoms/Sheet';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useBackgroundConceptDeassignStore } from '/src/components/BackgroundDownload/BackgroundDeassignConcepts';
import DesassingModal from '/src/components/DesassignModal';
import MultipleFilters, {
  FormFilterData,
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { FloatingActionOverlay, TableVirtualized } from '/src/components/TableInfinityScroll';
import { convertToOrdering } from '/src/components/Table';
import { useGetPermissions, useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useToggle from '/src/hooks/useToggle';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { formatPrice } from '/src/utils/general';
import { extractPageFromURL } from '/src/utils/object-util';

import ConceptAssignmentEdit from '../ConceptAssignmentEdit';
import ConceptAssignmentOptional from '../ConceptAssignmentOptional';
import { LeadLabel } from '/src/components/admissions/labels';

export const StudentAssignedTable = ({
  setStudentsAssignedCount,
  hasAttributes,
}: {
  setStudentsAssignedCount: (count: number) => void;
  hasAttributes: boolean | undefined;
}) => {
  const selectedSchoolId = useSelectedSchoolId();
  const router = useRouter();
  const conceptId = router.query.conceptId;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const [search, setSearch] = useState('');
  const [studentsSorting, setStudentsSorting] = useState<string>();
  const [openDeassignModal, setOpenDeassignModal] = useState(false);
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const { setAlertState } = useAlert();

  const utils = api.useUtils();
  const {
    data: studentsAssigned,
    isPending: isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.schools.schoolsConceptsStudentsAssignedList.useInfiniteQuery(
    {
      schoolId: selectedSchoolId || '',
      conceptId: conceptId as string,
      query: {
        page_size: 100,
        search,
        ordering: studentsSorting ? [studentsSorting] : undefined,
        ...paramsFromForm,
      },
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000 * 60,
    }
  );
  const { data: studentIds } = api.schools.schoolsConceptsStudentsAssignedIdsList.useQuery(
    {
      schoolId: selectedSchoolId || '',
      conceptId: conceptId as string,
      query: {
        with_payment_data: false,
        search,
        page_size: 3000,
        ...paramsFromForm,
      },
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000 * 60,
    }
  );
  const flatData = useMemo(() => studentsAssigned?.pages.flatMap((page) => page?.results ?? []), [studentsAssigned]);
  const totalCount = useMemo(() => studentIds?.count ?? 0, [studentIds]);
  useEffect(() => {
    setStudentsAssignedCount(totalCount);
  }, [setStudentsAssignedCount, totalCount, isLoading, isFetching]);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const [selectedStudents, setSelectedStudents] = useState<ConceptStudent[]>([]);
  const [deselectedStudents, setDeselectedStudents] = useState<ConceptStudent[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [visibleStudentIds, setVisibleStudentIds] = useState<string[]>([]);
  const [isDeletingFromColumn, setIsDeletingFromColumn] = useState(false);
  const { isEnabled: showDeassignStudents } = useFlagWithVariableMatching('hk_show_deassign_students');

  useEffect(() => {
    if (flatData) {
      const currentlyVisibleIds = flatData.map((student) => student.id);
      setVisibleStudentIds(currentlyVisibleIds);
    }
  }, [flatData]);

  const handleOnSelectRow = useCallback((row: ConceptStudent) => {
    setSelectedStudents((prev) => {
      const isStudentSelected = prev.some((student) => student.id === row.id);

      if (isStudentSelected) {
        return prev.filter((student) => student.id !== row.id);
      } else {
        return [...prev, row];
      }
    });
  }, []);

  const selectedElementsWithoutDeselected = useMemo(
    () =>
      studentIds?.results?.filter((student) => !deselectedStudents.some((deselected) => deselected.id === student.id)),
    [studentIds?.results, deselectedStudents]
  );
  const [assignmentDelay, setAssignmentDelay] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<ConceptStudent | null>(null);
  const studentStatusMutation = api.concepts.conceptsGetStudentStatus.useMutation();
  const setIsWorking = useBackgroundConceptDeassignStore((state) => state.setIsWorking);
  const addToQueue = useBackgroundConceptDeassignStore((state) => state.addToQueue);
  const setToError = useBackgroundConceptDeassignStore((state) => state.setToError);
  const {
    toggle: openConceptAssignmentDetail,
    onClose: onCloseConceptAssignmentDetail,
    onOpen: onOpenConceptAssignmentDetail,
  } = useToggle();

  const deassignMutation = api.concepts.conceptsDeassignStudents.useMutation({
    onSuccess: async (data: any) => {
      setAssignmentDelay(true);
      setTimeout(async () => {
        try {
          const resp = await utils.client.concepts.conceptsGetDeassignStatus.query({
            schoolId: selectedSchoolId || '',
            id: data.massive_dissasignment_id as string,
          });
          if (resp?.status === 'PENDING') {
            setIsWorking();
            addToQueue(data.massive_dissasignment_id as string);
            setOpenDeassignModal(false);
            setSelectedStudents([]);
            setSelectedAll(false);
            setDeselectedStudents([]);
            setIsDeletingFromColumn(false);
            setAssignmentDelay(false);
          }
          if (resp?.status === 'FINISHED') {
            setAlertState({
              open: true,
              severity: 'success',
              message:
                selectedStudents.length === 1
                  ? `Se ha iniciado el proceso de desasignación para 1 estudiante.`
                  : `Se ha iniciado el proceso de desasignación para ${selectedStudents.length} estudiantes.`,
            });
            setSelectedStudents([]);
            setSelectedAll(false);
            setDeselectedStudents([]);
            setIsDeletingFromColumn(false);
            setAssignmentDelay(false);
            setOpenDeassignModal(false);
            await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
            await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
          }
          if (resp?.status === 'ERROR') {
            // eslint-disable-next-line no-console
            console.log('error');
          }
        } catch (e) {
          setAssignmentDelay(false);
          setAlertState({
            open: true,
            severity: 'error',
            message: '¡Ha ocurrido un problema con la desasignación de conceptos!',
          });
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }, 4000);
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: '¡Ha ocurrido un problema con la desasignación de conceptos!',
      });
      setToError();
      setIsDeletingFromColumn(false);
      setOpenDeassignModal(false);
      setSelectedStudents([]);
      setSelectedAll(false);
      setDeselectedStudents([]);
    },
  });

  const handleDeassign = async (keepDebt: boolean) => {
    await deassignMutation.mutateAsync({
      school_id: selectedSchoolId || '',
      concept_id: conceptId as string,
      students_ids: selectedStudents.map((student) => student.id),
      keep_debt: keepDebt || false,
      delete_all: false,
    });
  };

  const handleOpenDeassignModal = async () => {
    await studentStatusMutation.mutate({
      concept_id: conceptId as string,
      school_id: selectedSchoolId || '',
      student_ids:
        selectedAll && deselectedStudents.length > 0
          ? (selectedElementsWithoutDeselected || []).map((student) => student.id)
          : selectedStudents.filter((student) => student.can_be_deassigned).map((student) => student.id),
    });
  };

  const handleSelectAll = () => {
    if (!flatData) return;

    if (allVisibleSelected) {
      const visibleIds = new Set(visibleStudentIds);
      setSelectedStudents((prev) => prev.filter((student) => !visibleIds.has(student.id)));
    } else {
      const selectableVisibleStudents = flatData.filter((student) => student.can_be_deassigned);

      setSelectedStudents((prev) => {
        const combinedSelection = [...prev];

        selectableVisibleStudents.forEach((student) => {
          if (!combinedSelection.some((s) => s.id === student.id)) {
            combinedSelection.push(student);
          }
        });

        return combinedSelection;
      });
    }
  };

  const allVisibleSelected = useMemo(() => {
    if (!flatData || flatData.length === 0) return false;

    const selectableVisibleStudents = flatData.filter((student) => student.can_be_deassigned);
    if (selectableVisibleStudents.length === 0) return false;

    return selectableVisibleStudents.every((student) =>
      selectedStudents.some((selected) => selected.id === student.id)
    );
  }, [flatData, selectedStudents]);

  const columnHelper = createColumnHelper<ConceptStudent>();
  const permissions = useGetPermissions();

  const columns = [
    ...(showDeassignStudents && permissions?.can_add_concept_assignment
      ? [
          {
            header: () => (
              <span className="flex items-center">
                <GenericRowCheckBoxButton onClick={handleSelectAll} checked={allVisibleSelected} />
              </span>
            ),
            id: 'select',
            cell: ({ row }: { row: Row<ConceptStudent> }) => (
              <div>
                <Tooltip
                  message="No se puede desasignar este estudiante porque todos sus meses se encuentran pagados"
                  disableHover={row.original.can_be_deassigned as unknown as boolean}
                >
                  <GenericRowCheckBoxButton
                    key={row.original.id}
                    onClick={() => handleOnSelectRow(row.original)}
                    disabled={!row.original.can_be_deassigned}
                    checked={selectedStudents.some((student) => student.id === row.original.id)}
                  />
                </Tooltip>
              </div>
            ),
            size: 80,
          },
        ]
      : []),
    columnHelper.accessor('first_name', {
      cell: (info) => (
        <div className="flex flex-col">
          <span
            className="text-sm text-[#212B36] truncate"
            title={`${info.row.original.first_name} ${info.row.original.last_name}`}
          >
            <HighlightMatch query={search} className="flex gap-2">
              {info.row.original.first_name} {info.row.original.last_name}
              <LeadLabel state={info.row.original.state} />
            </HighlightMatch>
          </span>
          <span className="text-xs text-[#454D64]">
            <HighlightMatch query={search}>{info.row.original.enrollment_code}</HighlightMatch>
          </span>
        </div>
      ),
      size: 250,
      header: () => <span className="font-semibold">Estudiante</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('section', {
      cell: (info) => (
        <div className="flex flex-col gap-[4px]">
          <span className="text-left text-[#1C1C1D] truncate" title={info.row.original.section}>
            {info.row.original.section}
          </span>
          <span className="text-left text-xs text-[#454D64]">{info.row.original.level}</span>
        </div>
      ),
      size: 150,
      header: () => <span>Sección actual</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('orders_payed', {
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <span className="text-left pl-2 text-[#1C1C1D] text-sm">
            {!hasAttributes
              ? `${info.row.original.orders_payed || 0} de ${info.row.original.orders_to_pay || 0}`
              : `${info.row.original.orders_payed || 0} ${
                  Number(info.row.original.orders_payed) === 1 ? 'pago' : 'pagos'
                }`}
          </span>
          {Number(info.row.original.orders_to_pay_in_process) > 0 && (
            <span className="text-left pl-2 text-[#454D64] text-sm">
              {`${info.row.original.orders_to_pay_in_process || 0} en proceso`}
            </span>
          )}
        </div>
      ),
      size: 150,
      header: () => <span>Órdenes pagadas</span>,
    }),
    columnHelper.accessor('amount_paid', {
      cell: (info) => <span className="pr-6 text-right">{formatPrice(info.row.original.amount_paid || 0)}</span>,
      size: 150,
      header: () => <span>Total pagado</span>,
      meta: {
        numeric: true,
      },
    }),
    ...(!hasAttributes
      ? [
          columnHelper.accessor('amount_to_pay', {
            cell: (info) => (
              <>
                <span className="text-right">{formatPrice(info.row.original.amount_to_pay || 0)}</span>
              </>
            ),

            size: 150,
            header: () => <span>Por pagar</span>,
            meta: {
              numeric: true,
            },
            enableSorting: true,
          }),
        ]
      : []),
  ];
  const { data: filters } = api.students.studentFilters.useQuery(
    { school_id: selectedSchoolId || '' },
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000 * 60,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const schoolsStudentsFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolsStudentsFilter?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolsStudentsFilter?.sections,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: schoolsStudentsFilter?.concepts,
    },
    {
      header: 'Beca asignada',
      watchKey: 'scholarships',
      contents: schoolsStudentsFilter?.scholarships,
    },
    {
      header: 'Órdenes pagadas',
      watchKey: 'paid_status',
      contents: schoolsStudentsFilter?.paid_status,
    },
  ];
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };
  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasElementsChecked = Object.values(formFilterData).filter((item) => item.checked);

  const handleOpenConceptDetail = (row: ConceptStudent) => {
    setSelectedDetails(row);
    onOpenConceptAssignmentDetail();
  };
  return (
    <div className="bg-white">
      <div className="flex pt-4 pb-2 items-start px-10 sticky top-[135px] z-20 bg-white flex-col">
        <div className="flex items-center">
          <MultipleFilters
            filterItems={filterItems}
            handleFilter={handleFilter}
            onClearFilter={() => {
              setFormFilterData({});
            }}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
          <div className="pl-2">
            <GlobalSearch
              search={search}
              setSearch={setSearch}
              placeholder="Buscar estudiantes"
              typeButton="button"
              className="min-w-[400px]"
            />
          </div>
        </div>
      </div>
      <div className="sticky top-0 px-4 bg-white">
        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
        />
      </div>
      <div
        className={cn('relative h-[calc(100vh-205px)]', { 'h-[calc(100vh-290px)]': hasElementsChecked.length > 0 })}
        ref={wrapperRef}
      >
        {!isDeletingFromColumn && selectedStudents.length > 0 ? (
          <FloatingActionOverlay
            itemCount={selectedStudents.length}
            itemLabel={selectedStudents.length === 1 ? 'estudiante seleccionado' : 'estudiantes seleccionados'}
            actionContent="Desasignar"
            buttonType="red"
            onAction={() => setOpenDeassignModal(true)}
          />
        ) : null}
        <DesassingModal
          open={openDeassignModal}
          setOpen={setOpenDeassignModal}
          onOpen={handleOpenDeassignModal}
          onClose={() => {
            setSelectedStudents([]);
            setSelectedAll(false);
            setDeselectedStudents([]);
            setOpenDeassignModal(false);
            setIsDeletingFromColumn(false);
          }}
          students={selectedStudents}
          onDesassign={handleDeassign}
          studentStatus={studentStatusMutation.data as StudentStatusSummary}
          isLoading={studentStatusMutation.isPending}
          isMutating={deassignMutation.isPending || assignmentDelay}
        />
        <div>
          <TableVirtualized
            data={flatData || []}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage || false}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            isFetching={isFetching || isFetchingNextPage}
            columns={columns}
            maxHeight={wrapperRef.current?.offsetHeight || 500}
            totalCount={totalCount}
            hideSum
            onRowClick={handleOpenConceptDetail}
            emptyStateText="No hay ningún estudiante asignado"
            emptyEndText="No hay más estudiantes asignados." // ¿Esto es necesario? Iteracion en el PR please @Kev
            totalFetched={studentsAssigned?.pages.flatMap((page) => page?.results ?? []).length || 0}
            selectedRowsToHighlight={
              selectedAll
                ? studentIds?.results
                    ?.filter(
                      (student) => !deselectedStudents.some((deselectedStudent) => deselectedStudent.id === student.id)
                    )
                    .map((student) => student.id)
                : selectedStudents.map((student) => student.id)
            }
            onSortingChange={(sorting) => {
              const text = convertToOrdering(sorting);
              setStudentsSorting(text);
            }}
          />
        </div>
      </div>
      <Sheet
        open={openConceptAssignmentDetail}
        onOpenChange={(open) => {
          if (!open) onCloseConceptAssignmentDetail();
        }}
      >
        <Sheet.Content>
          {hasAttributes ? (
            <ConceptAssignmentOptional
              onClose={onCloseConceptAssignmentDetail}
              student={selectedDetails}
              assignment={{ conceptId: conceptId as string, assigmentId: selectedDetails?.concept_assignment_id ?? '' }}
              studentId={selectedDetails?.id || ''}
            />
          ) : (
            <ConceptAssignmentEdit
              onClose={onCloseConceptAssignmentDetail}
              student={selectedDetails}
              assignment={{ conceptId: conceptId as string, assigmentId: selectedDetails?.concept_assignment_id ?? '' }}
              studentId={selectedDetails?.id || ''}
            />
          )}
        </Sheet.Content>
      </Sheet>
    </div>
  );
};

export type GenericRowCheckBoxButtonProps = {
  disabled?: boolean;
  checked?: boolean | 'indeterminate';
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  checkboxClassName?: string;
} & React.ComponentProps<typeof Checkbox>;

export const GenericRowCheckBoxButton: React.FC<GenericRowCheckBoxButtonProps> = ({
  disabled,
  checked,
  onClick,
  className,
  checkboxClassName,
  ...props
}) => (
  <button
    type="button"
    className={cn('bg-transparent border-none rounded-md p-3 flex items-center justify-center', className)}
    disabled={disabled}
    onClick={onClick}
  >
    <Checkbox checked={checked} disabled={disabled} className={checkboxClassName} {...props} />
  </button>
);
