import { useMemo, useRef, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Scholarship, DashboardStudent } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { extractPageFromURL } from '/src/utils/object-util';
import Button from '/src/components/organisms/dashboard/Button';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import IcPlus from 'public/assets/icons/ic_plus.svg';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { cn } from '/src/utils/cn';
import { renderMoney } from '/src/utils/datagridHeaders';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import Sheet from '/src/components/atoms/Sheet';
import ScholarshipAssignment from '/src/components/students/StudentScholarshipAssign';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import ScholarshipAssignmentDetailV2 from '../organisms/dashboard/scholarship/ScholarshipAssigmentDetailV2';

function StudentScholarshipsTable({
  student,
  schoolCycles,
}: {
  student: DashboardStudent | undefined;
  schoolCycles: SchoolCycleEntity[];
}) {
  const permissions = useGetPermissions();
  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);
  const [assignScholarship, setAssignScholarship] = useState<boolean | null>(false);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);

  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const closeScholarshipAssignmentDetail = () => {
    setScholarship(null);
  };

  const handlerRowClick = (scholarship: Scholarship) => {
    setScholarship(scholarship);
    sendTrackEventWithUserName(Events.scholarship_detail_viewed, { source: document.title.split(' | ')[0] });
  };

  return (
    <div className="h-full">
      <div className="pl-8 z-20 bg-white transition-all transform-gpu mr-[32px] relative rounded-t-2xl">
        <div className="flex items-center self-stretch pt-4 pb-2 gap-6">
          <h2 className="text-[#212B36] text-xl font-bold h-10">Becas y descuentos asignados</h2>
          {permissions?.can_assign_scholarship && (
            <div className="ml-auto">
              <Button
                onClick={() => setAssignScholarship(true)}
                data-testid="assignScholarship-btn"
                leftIcon={<IcPlus fill="currentColor" />}
                className="py-[6px] h-9 text-sm/[24px] flex gap-2 justify-content"
              >
                <span>Asignar beca</span>
              </Button>
            </div>
          )}
          <Sheet
            open={assignScholarship ?? false}
            onOpenChange={(open) => {
              if (!open) setAssignScholarship(false);
            }}
          >
            <Sheet.Content>
              <ScholarshipAssignment onClose={() => setAssignScholarship(false)} student={student} />
            </Sheet.Content>
          </Sheet>
        </div>
        <div className="flex items-center self-start pt-4 pb-3">
          <SchoolCycleSelector selected={schoolCycle} setFn={setSchoolCycle} cycles={schoolCycles} />
        </div>
      </div>
      <Table
        setHeaderVisible={() => void 0}
        headerVisible
        studentId={student?.id || ''}
        schoolCycleId={schoolCycle?.id || null}
        handlerRowClick={handlerRowClick}
      />
      {scholarship ? (
        <Sheet
          open={!!scholarship}
          onOpenChange={(open) => {
            if (!open) closeScholarshipAssignmentDetail();
          }}
        >
          <Sheet.Content>
            <ScholarshipAssignmentDetailV2
              onClose={closeScholarshipAssignmentDetail}
              studentId={student?.id || ''}
              scholarshipId={scholarship?.id}
            />
          </Sheet.Content>
        </Sheet>
      ) : null}
    </div>
  );
}

function Table({
  setHeaderVisible,
  headerVisible,
  studentId,
  schoolCycleId,
  handlerRowClick,
}: {
  setHeaderVisible: (value: boolean) => void;
  headerVisible: boolean;
  studentId: string;
  schoolCycleId: string | null;
  handlerRowClick: (row: Scholarship) => void;
}) {
  const {
    data: scholarshipsTable,
    isPending: isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.students.studentsScholarshipList.useInfiniteQuery(
    {
      studentId: studentId as string,
      schoolCycleId: schoolCycleId || undefined,
    },
    {
      enabled: !!studentId,
      refetchOnWindowFocus: false,
      getNextPageParam: (currentPage) => extractPageFromURL(currentPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      retry: false,
    }
  );

  const flatData = useMemo(() => scholarshipsTable?.pages.flatMap((page) => page?.results ?? []), [scholarshipsTable]);
  const totalCount = useMemo(() => scholarshipsTable?.pages[0]?.count || 0, [scholarshipsTable]);
  const columnHelper = createColumnHelper<Scholarship>();

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex flex-row">
          <span className="text-sm font-normal truncate" title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Nombre</span>,
      minSize: 400,
      maxSize: 400,
    }),
    columnHelper.accessor('type', {
      cell: (_info) => (
        <div className="flex flex-row">
          <span className="text-sm font-normal truncate" title="Beca">
            Beca
          </span>
        </div>
      ),
      header: () => <span className="whitespace-nowrap text-right">Categoría</span>,
      minSize: 112,
      maxSize: 112,
      meta: {
        numeric: true,
      },
    }),
    columnHelper.accessor('value', {
      cell: (info) => (
        <div className="flex flex-row justify-end">
          <span className="text-sm font-normal truncate whitespace-break-spaces">
            {info.row.original.type === 'PERCENT'
              ? `${Math.round(Number(info.getValue()))}%`
              : `${renderMoney(Number(info.getValue()))}`}
          </span>
        </div>
      ),
      header: () => (
        <div className="w-full flex justify-end">
          <span className="whitespace-nowrap text-right">Valor dscto</span>
        </div>
      ),
      minSize: 156,
      maxSize: 156,
    }),
    columnHelper.accessor('id', {
      cell: (_info) => '',
      header: () => <span className="whitespace-nowrap text-right" />,
      minSize: 350,
      maxSize: 350,
    }),
  ];
  const wrapperRef = useRef<HTMLDivElement>(null);
  if (flatData?.length === 0 && !isLoading && !isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
        <div className="max-w-[344px] flex flex-col gap-2">
          <span className="text-[18px] leading-[20px] text-left">¡No hay becas asignadas para mostrar!</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div ref={wrapperRef} className={cn('h-[calc(100vh-245px)] w-full', 'transition-opacity duration-300')}>
        <TableVirtualized
          data={flatData || []}
          columns={columns}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage || false}
          fetchNextPage={fetchNextPage}
          useWindowScroll
          maxHeight={wrapperRef?.current?.offsetHeight || 500}
          setHeaderVisible={setHeaderVisible}
          headerVisible={headerVisible}
          isLoading={isLoading}
          isFetching={isFetching}
          onRowClick={handlerRowClick}
          hideSum
          totalCount={totalCount || 0}
          totalFetched={flatData?.length || 0}
          addMorePaddingFirstRow
          showEmptyStateImage
        />
      </div>
    </div>
  );
}

export default StudentScholarshipsTable;
