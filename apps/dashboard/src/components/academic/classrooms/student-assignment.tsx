import { ReactNode, useState, useMemo, useEffect, useRef } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@cometa/recreo/v2';
import { XIcon } from 'lucide-react';
import { api } from '/src/utils/api';
import { ClassroomEntity } from '@cometa/trpc/src/students/types';
import { DashboardStudentListDueOrderSerializerV4 } from '@cometa/trpc/src/types';
import { GenericRowCheckBoxButton } from '/src/components/organisms/dashboard/StudentAssignedTable';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useFilters } from '/src/hooks/useFilters';
import MultipleFilters, {
  MultipleFiltersChips,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { cn } from '@cometa/utils';
import { Tooltip } from '../../atoms/Tooltip';
import { debounce } from 'lodash';
import useAlert from '/src/hooks/useAlert';
import { useSchoolCycleSelector } from '../../organisms/dashboard/SchoolCycleSelector';
import { keepPreviousData } from '@tanstack/react-query';

type StudentAssignmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: ClassroomEntity;
  onAssign?: () => void;
  studentIdsAlreadyAssigned?: string[];
};

function useBulkAssignStudents() {
  const { setAlertState } = useAlert();

  const mutation = api.students.bulkAssignStudentsToClassroom.useMutation({
    onSuccess(data) {
      setAlertState({
        severity: 'success',
        message: `${data?.length} Estudiantes asignados`,
        open: true,
      });
    },
    onError(_error) {
      setAlertState({
        severity: 'error',
        message: 'Error al asignar estudiantes',
        open: true,
      });
    },
  });

  return mutation;
}

function ConfirmationBar({
  selectedCount,
  onAssign,
  onCancel,
  isLoading,
}: {
  selectedCount: number;
  onAssign: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-[420px]">
      <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex justify-between items-center gap-4">
        <span className="text-sm font-medium text-gray-900">
          {selectedCount} estudiante{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-1">
          <Button variant="default" size="sm" onClick={onAssign} disabled={isLoading}>
            {isLoading ? 'Asignando...' : 'Asignar estudiantes'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            <XIcon size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StudentAssignmentModal({
  open,
  onOpenChange,
  classroom,
  onAssign,
  studentIdsAlreadyAssigned,
}: StudentAssignmentModalProps) {
  const selectedSchoolId = useSelectedSchoolId();
  const { activeCycle } = useSchoolCycleSelector();
  const [searchText, setSearchText] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bulkAssignMutation = useBulkAssignStudents();
  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();
  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const { data: filtersData } = api.students.studentFilters.useQuery(
    { school_id: selectedSchoolId as string },
    {
      enabled: !!selectedSchoolId && open,
      staleTime: 60 * 1000 * 60,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const studentsDueOrdersFilter = useMemo(() => {
    if (!filtersData) return undefined;
    return normalizeFilters(filtersData);
  }, [filtersData]);

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.students.dashboardSchoolDueOrdersStudents.useInfiniteQuery(
    {
      schoolId: selectedSchoolId || '',
      query: {
        search: searchText || undefined,
        page_size: 20,
        school_cycle: activeCycle?.id,
        ...params,
      },
    },
    {
      enabled: !!selectedSchoolId && open && !!activeCycle?.id,
      placeholderData: keepPreviousData,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => {
        if (lastPage?.next) {
          const url = new URL(lastPage.next);
          return parseInt(url.searchParams.get('page') || '1');
        }
        return undefined;
      },
    }
  );

  const students = useMemo(() => {
    if (!studentsData?.pages) return [];
    return studentsData.pages.flatMap((page) => page?.results || []);
  }, [studentsData?.pages]);

  useEffect(() => {
    function handleScroll() {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const threshold = 100;

      if (scrollHeight - (scrollTop + clientHeight) < threshold && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filterItems = [
    {
      header: 'Estado de estudiante',
      watchKey: 'state',
      contents: studentsDueOrdersFilter?.state,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: studentsDueOrdersFilter?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: studentsDueOrdersFilter?.sections,
    },
    {
      header: 'Estado de inscripción',
      watchKey: 'inscription_status',
      contents: studentsDueOrdersFilter?.inscription_status,
    },
  ];

  useEffect(() => {
    if (!open) {
      setSearchText('');
      setSelectedStudentIds([]);
      handleClearFilter();
    }
  }, [open]);

  function handleSelectStudent(student: DashboardStudentListDueOrderSerializerV4) {
    setSelectedStudentIds((prev) => {
      if (prev.includes(student.id)) {
        return prev.filter((id) => id !== student.id);
      } else {
        return [...prev, student.id];
      }
    });
  }

  function handleCancelSelection() {
    setSelectedStudentIds([]);
  }

  async function handleAssignStudents() {
    if (!classroom?.id || selectedStudentIds.length === 0) return;

    await bulkAssignMutation.mutateAsync({
      classroom_id: classroom.id,
      student_ids: selectedStudentIds,
    });

    setSelectedStudentIds([]);
    onOpenChange(false);
    onAssign?.();
  }

  const classroomTitle = `${classroom?.level?.name} · ${classroom?.grade?.name} - ${classroom?.group?.name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl h-[85vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Asignar estudiantes</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            <p>{activeCycle?.name}</p>
            <p>{classroomTitle}</p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col px-6">
          <div className="flex items-center">
            <MultipleFilters
              isLegacy={false}
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
              selectedItems={formFilterData}
            />

            <GlobalSearch
              placeholder="Buscar estudiantes"
              search={searchText}
              setSearch={debounce(setSearchText, 300)}
              className="focus:ring-primary focus:border-primary mb-1 flex-1"
            />
          </div>

          <MultipleFiltersChips
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
            tableName="students"
            className="px-0"
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-8 py-4">
            <div className="grid grid-cols-[auto_1fr_8rem] gap-4 items-center">
              <div className="w-9 px-3" />
              <span className="text-sm font-semibold text-gray-900">Estudiante</span>
              <span className="text-sm font-semibold text-gray-900">Grupo actual</span>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
            {isLoadingStudents ? (
              <div className="flex justify-center items-center h-64">
                <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
              </div>
            ) : students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No se encontraron estudiantes.</p>
              </div>
            ) : (
              <>
                {students.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const alreadyAssigned = studentIdsAlreadyAssigned?.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      className={cn('px-6 py-4 border-b border-gray-100 hover:bg-accent/50 cursor-pointer', {
                        'hover:bg-accent bg-accent': isSelected,
                        'opacity-50': alreadyAssigned,
                        'cursor-default': alreadyAssigned,
                      })}
                      onClick={() => {
                        if (alreadyAssigned) return;
                        handleSelectStudent(student);
                      }}
                    >
                      <div className="grid grid-cols-[auto_1fr_8rem] gap-4 items-center">
                        <Tooltip message={alreadyAssigned ? 'El estudiante ya ha sido asignado' : undefined}>
                          <GenericRowCheckBoxButton
                            checked={isSelected}
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleSelectStudent(student);
                            }}
                            disabled={alreadyAssigned}
                            checkboxClassName="data-[state=checked]:bg-primary"
                          />
                        </Tooltip>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.enrollment_code || 'Sin matrícula'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.section || 'Sin sección'}</div>
                          <div className="text-xs text-gray-500">{student.level || ''}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isFetchingNextPage && (
                  <div className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <img src="/assets/loading.svg" alt="Cargando más..." className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ConfirmationBar
          selectedCount={selectedStudentIds.length}
          onAssign={handleAssignStudents}
          onCancel={handleCancelSelection}
          isLoading={bulkAssignMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
