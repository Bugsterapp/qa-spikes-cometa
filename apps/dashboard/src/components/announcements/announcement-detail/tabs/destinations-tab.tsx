import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { api } from '/src/utils/api';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { createColumnHelper } from '@tanstack/react-table';
import { useAdjustHeight } from 'src/hooks/useFullScreenHeight';

interface DestinationRow {
  id: string;
  type: 'student' | 'guardian';
  student?: any;
  guardian?: any;
  guardians?: any[];
  status: string;
  parentStudentId?: string;
}

interface DestinationsTabProps {
  expandedStudents: Set<string>;
  toggleStudentExpansion: (studentId: string) => void;
  announcementId: string | string[] | undefined;
}

const columnHelper = createColumnHelper<DestinationRow>();

export default function DestinationsTab({
  expandedStudents,
  toggleStudentExpansion,
  announcementId,
}: DestinationsTabProps) {
  const { data: dataDestinations, isPending: isLoading } = api.announcements.getAnnouncementResponses.useQuery(
    {
      announcementId: String(announcementId) || '',
      groupBy: 'student',
    },
    { enabled: !!announcementId }
  );

  // Transform data based on expanded students
  const filteredData = useMemo(() => {
    if (!dataDestinations?.items || !Array.isArray(dataDestinations.items)) {
      return [];
    }

    const filteredItems = dataDestinations.items;

    // Transform into flattened structure with student and guardian rows
    const destinationRows: DestinationRow[] = [];

    filteredItems.forEach((item: any) => {
      // Add student row
      const studentRow: DestinationRow = {
        id: item.id,
        type: 'student',
        student: item.student,
        guardians: item.guardians || [],
        status: item.status,
      };
      destinationRows.push(studentRow);

      // Add guardian rows if student is expanded
      if (expandedStudents.has(item.id) && item.guardians) {
        item.guardians.forEach((guardian: any, index: number) => {
          const guardianRow: DestinationRow = {
            id: `${item.id}-guardian-${index}`,
            type: 'guardian',
            guardian: guardian,
            status: guardian.notification_status,
            parentStudentId: item.id,
          };
          destinationRows.push(guardianRow);
        });
      }
    });

    return destinationRows;
  }, [dataDestinations, expandedStudents]);

  // Create columns for the table
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'student_name',
        header: 'Estudiante',
        cell: (info) => {
          const row = info.row.original;

          if (row.type === 'student') {
            const student = row.student;
            const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
            const hasGuardians = row.guardians && row.guardians.length > 0;

            return (
              <div className={`flex items-center space-x-3 py-1 ${hasGuardians ? 'expandable-student' : ''}`}>
                {hasGuardians && (
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        expandedStudents.has(row.id) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                {!hasGuardians && <div className="w-4 h-4 flex-shrink-0" />}
                <span className="font-medium text-gray-900 break-words">{studentName}</span>
              </div>
            );
          } else {
            // Guardian row
            const guardian = row.guardian;
            const guardianName = `${guardian.first_name || ''} ${guardian.last_name || ''}`.trim();

            return (
              <div className="ml-7 flex items-center space-x-3 py-1 max-w-[300px] overflow-hidden">
                <div className="text-sm text-gray-600 break-words overflow-hidden">
                  <div className="font-medium break-words overflow-wrap-anywhere max-w-[250px]">
                    Tutor: {guardianName}
                  </div>
                </div>
              </div>
            );
          }
        },
        size: 300,
      }),
      columnHelper.display({
        id: 'status',
        header: 'Leído',
        cell: (info) => {
          const row = info.row.original;
          const isRead = ['READ', 'ANSWERED'].includes(row.status);

          return (
            <div className="flex justify-center py-1">
              {isRead ? (
                <div className="flex justify-center">
                  <div className="relative size-5 rounded-full border-[1px] border-[#28c441] flex items-center justify-center">
                    <Check className="size-3 text-[#28c441]" />
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: 'section_or_contact',
        header: 'Sección',
        cell: (info) => {
          const row = info.row.original;

          if (row.type === 'student') {
            const studentGrade = row.student?.grade || 'Sin grado';
            return <span className="font-normal text-gray-900 py-1 break-words">{studentGrade}</span>;
          } else {
            // Guardian row - show contact info
            const guardian = row.guardian;
            return (
              <div className="flex items-center space-x-4 text-sm text-gray-600 py-1 w-full">
                <div className="flex items-center space-x-1 break-words flex-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm break-words break-all">{guardian.email}</span>
                </div>
              </div>
            );
          }
        },
        size: 280,
      }),
      columnHelper.display({
        id: 'tutors_or_phone',
        header: 'Tutores',
        cell: (info) => {
          const row = info.row.original;

          if (row.type === 'student') {
            const guardians = row.guardians;
            if (!guardians || guardians.length === 0) {
              return <span className="text-gray-500 py-1 break-words">Sin tutores</span>;
            }
            return <span className="text-gray-900 py-1 break-words">{guardians.length} tutor(es)</span>;
          } else {
            // Guardian row - show phone
            const guardian = row.guardian;
            return (
              <div className="flex items-center space-x-1 text-sm text-gray-600 py-1 w-full">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm break-words break-all flex-1">{guardian.phone}</span>
              </div>
            );
          }
        },
        size: 220,
      }),
    ],
    [expandedStudents, toggleStudentExpansion]
  );

  const { wrapperRef, maxHeight } = useAdjustHeight(550);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
      </div>
    );
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative w-full pt-5">
      {/* Table */}
      <div className="w-full h-full flex flex-col max-h-[calc(100vh-280px)] min-h-[calc(100vh-280px)]" ref={wrapperRef}>
        <TableVirtualized
          totalFetched={filteredData?.length || 0}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          data={filteredData}
          columns={columns as any[]}
          totalCount={filteredData?.length || 0}
          isLoading={isLoading}
          isFetching={false}
          onRowClick={(row) => {
            // Only toggle expansion for student rows that have guardians
            if (row.type === 'student' && row.guardians && row.guardians.length > 0) {
              toggleStudentExpansion(row.id);
            }
          }}
          rowClassName="hover:bg-neutral-50 [&:has(.expandable-student)]:cursor-pointer"
          emptyStateText="No hay destinatarios disponibles para este comunicado."
          classNameContainer="[&_tr:hover]:bg-gray-50 max-h-full [&_tr]:transition-colors"
          maxHeight={maxHeight}
        />
      </div>
    </div>
  );
}
