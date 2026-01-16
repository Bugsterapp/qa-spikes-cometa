import Head from 'next/head';
import * as Sentry from '@sentry/nextjs';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@cometa/recreo/v2';
import { ChevronDownIcon, ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import { api } from '~/utils/api';
import {
  AcademicConfigOriginTypeEnum,
  ClassroomIncludeEnum,
  EvaluationScoresByAssignmentCriteriaEnum,
  AttendanceContextTypeEnum,
} from '@cometa/trpc/src/students/types';
import FilePreviewModal, { type FileMetadata } from '~/components/FilePreviewModal';
import type {
  EvaluationPeriodEntity,
  ClassroomEntity,
  ClassroomStudentAssignmentEntity,
  AssignmentScoresDTO,
  AcademicConfigEntity,
} from '@cometa/trpc/src/students/types';
import { useToast } from '~/components/Toast/useToast';

function groupPeriodsByLevel(periods: EvaluationPeriodEntity[]): Map<string, EvaluationPeriodEntity[]> {
  const periodsByLevel = new Map<string, EvaluationPeriodEntity[]>();

  periods.forEach((period) => {
    const existing = periodsByLevel.get(period.level_id) || [];
    periodsByLevel.set(period.level_id, [...existing, period]);
  });

  return periodsByLevel;
}

function findStudentAssignment(
  assignments: ClassroomStudentAssignmentEntity[],
  classroomId: string,
  studentId: string
): ClassroomStudentAssignmentEntity | undefined {
  return assignments.find(
    (assignment) => assignment.classroom_id === classroomId && assignment.student_id === studentId
  );
}

function findScoresForAssignment(
  assignmentScores: AssignmentScoresDTO[],
  assignmentId: string
): AssignmentScoresDTO | undefined {
  return assignmentScores.find((score) => score.classroom_student_assignment_id === assignmentId);
}

type UseStudentScoresDataProps = { studentId?: string; schoolId?: string };
function useStudentScoresData({ studentId, schoolId }: UseStudentScoresDataProps) {
  const { data: schoolConfig, isLoading: isLoadingSchoolConfig } = api.students.getSchoolConfig.useQuery(
    {
      school_id: schoolId as string,
    },
    {
      enabled: !!schoolId,
    }
  );
  const { data: schoolCycles, isLoading: isLoadingCycles } = api.schools.getSchoolsCycles.useQuery(
    {
      school_id: schoolId as string,
      is_active: true,
    },
    {
      enabled: !!schoolId,
    }
  );

  const activeCycle = schoolCycles?.[0];

  const { data: assignments, isLoading: isLoadingAssignments } = api.schools.listClassroomStudentAssignments.useQuery(
    {
      student_id: studentId as string,
    },
    {
      enabled: !!studentId,
    }
  );

  const classroomIds = useMemo(() => {
    if (!assignments) return [];
    return assignments.map((assignment) => assignment.classroom_id);
  }, [assignments]);

  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = api.schools.listClassrooms.useQuery(
    {
      classroom_ids: classroomIds,
      include: [ClassroomIncludeEnum.Course],
    },
    {
      enabled: classroomIds.length > 0,
    }
  );

  const classrooms = classroomsResponse?.results ?? [];

  const { data: evaluationPeriods, isLoading: isLoadingPeriods } = api.schools.listEvaluationPeriods.useQuery(
    {
      school_cycle_id: activeCycle?.id as string,
    },
    {
      enabled: !!activeCycle?.id,
    }
  );

  const { data: scoresByAssignment, isLoading: isLoadingScores } =
    api.schools.listEvaluationScoresByAssignment.useQuery(
      {
        student_id: studentId as string,
        school_cycle_id: activeCycle?.id as string,
        criteria: EvaluationScoresByAssignmentCriteriaEnum.Student,
      },
      {
        enabled: !!studentId && !!activeCycle?.id,
      }
    );

  const periodsByLevel = useMemo(() => {
    if (!evaluationPeriods) return new Map<string, EvaluationPeriodEntity[]>();
    return groupPeriodsByLevel(evaluationPeriods);
  }, [evaluationPeriods]);

  const { data: academicConfigs, isLoading: isLoadingAcademicConfig } = api.students.listAcademicConfigs.useQuery(
    {
      origin_id: classrooms.map((classroom) => classroom.level_id),
      school_cycle_id: activeCycle?.id as string,
      origin_type: AcademicConfigOriginTypeEnum.Level,
    },
    { enabled: !!classrooms.length && !!activeCycle }
  );

  const allPeriodIds = useMemo(() => {
    if (!evaluationPeriods) return [];
    return evaluationPeriods.map((p) => p.id);
  }, [evaluationPeriods]);

  const { data: attendanceCounts, isLoading: isLoadingAttendance } = api.students.countAttendanceRecords.useQuery(
    {
      student_id: studentId as string,
      evaluation_period_id: allPeriodIds,
      is_present: false,
      include_by_context: true,
    },
    { enabled: !!studentId && allPeriodIds.length > 0 }
  );

  const attendanceSummary = useMemo(() => {
    if (!attendanceCounts) return { total: 0, byClassroom: new Map<string, number>() };

    const byClassroom = new Map<string, number>();
    Object.entries(attendanceCounts.by_context ?? {}).forEach(([contextId, count]) => {
      const numericCount = typeof count === 'number' ? count : 0;
      byClassroom.set(contextId, numericCount);
    });

    return { total: attendanceCounts.total ?? 0, byClassroom };
  }, [attendanceCounts]);

  const isLoading =
    isLoadingCycles ||
    isLoadingAssignments ||
    isLoadingClassrooms ||
    isLoadingPeriods ||
    isLoadingScores ||
    isLoadingSchoolConfig ||
    isLoadingAcademicConfig ||
    isLoadingAttendance;

  return {
    activeCycle,
    classrooms,
    assignments: assignments ?? [],
    scoresByAssignment,
    periodsByLevel,
    isLoading,
    schoolConfig,
    academicConfigs,
    attendanceSummary,
  };
}

type PageHeaderProps = {
  guardianHash: string | string[] | undefined;
  studentId: string | string[] | undefined;
  cycleName?: string;
  restrictReportCard?: boolean;
};

function PageHeader({ guardianHash, studentId, cycleName, restrictReportCard }: PageHeaderProps) {
  return (
    <header className="px-5 pt-4">
      <Link
        href={`/guardians/${guardianHash}/students/${studentId}`}
        className="flex items-center gap-2 text-[#535765] mb-4"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span className="text-sm font-semibold uppercase">Volver</span>
      </Link>

      <h1 className="text-2xl font-bold text-[#22222A] mb-2">Calificaciones</h1>
      {restrictReportCard ? (
        <p className="text-sm text-[#535765]">
          El acceso a la boleta de calificaciones está restringido temporalmente por un saldo pendiente. Por favor,
          comunícate con administración para regularizar tu situación.
        </p>
      ) : (
        <p className="text-sm text-[#535765]">Estas son las calificaciones finales del {cycleName}.</p>
      )}
    </header>
  );
}

type EmptyStateProps = {
  guardianHash: string | string[] | undefined;
  studentId: string | string[] | undefined;
  message: string;
  cycleName?: string;
};

function EmptyState({ guardianHash, studentId, message, cycleName }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-[#FBFCFD]">
      <PageHeader guardianHash={guardianHash} studentId={studentId} cycleName={cycleName} />
      <div className="px-5 py-6">
        <p className="text-sm text-[#535765]">{message}</p>
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#EBEDF0] overflow-hidden animate-pulse">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-5 bg-[#F5F7FA] rounded w-32" />
          <div className="h-7 bg-[#F5F7FA] rounded w-12 ml-4" />
        </div>
        <div className="h-4 bg-[#F5F7FA] rounded w-24" />
      </div>
    </div>
  );
}

type LoadingSkeletonProps = {
  guardianHash: string | string[] | undefined;
  studentId: string | string[] | undefined;
};

function LoadingSkeleton({ guardianHash, studentId }: LoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#FBFCFD]">
      <header className="px-5 py-4">
        <Link
          href={`/guardians/${guardianHash}/students/${studentId}`}
          className="flex items-center gap-2 text-[#535765] mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase">Volver</span>
        </Link>

        <h1 className="text-2xl font-bold text-[#22222A] mb-2">Calificaciones</h1>
        <div className="h-4 bg-[#F5F7FA] rounded w-64 animate-pulse" />
      </header>

      <div className="px-5 py-4">
        <div className="flex flex-col gap-4">
          <div className="h-10 bg-[#F5F7FA] rounded-lg animate-pulse" />
          <div className="rounded-xl border border-[#EBEDF0] bg-[#F5F7FA] px-5 py-4 flex justify-between animate-pulse">
            <div className="h-5 bg-white rounded w-32" />
            <div className="h-7 bg-white rounded w-12" />
          </div>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      </div>
    </div>
  );
}

type CourseCardProps = {
  classroom: ClassroomEntity;
  assignmentScores: AssignmentScoresDTO | undefined;
  periods: EvaluationPeriodEntity[];
  decimalPlaces: number;
  absenceCount?: number;
  showAbsences?: boolean;
};

function CourseCard({
  classroom,
  assignmentScores,
  periods,
  decimalPlaces,
  absenceCount,
  showAbsences = false,
}: CourseCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const courseName = [classroom.course?.name, classroom.variant].filter(Boolean).join(' ');

  const hasPeriodsWithScores = periods.some((period) =>
    assignmentScores?.scores.some((score) => score.origin_id === period.id)
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-xl border border-[#EBEDF0] overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-[#22222A] flex-1">{courseName}</h3>
            <span className="text-xl font-bold text-[#22222A] ml-4">
              {assignmentScores?.average !== null && assignmentScores?.average !== undefined
                ? assignmentScores.average.toFixed(decimalPlaces)
                : '-'}
            </span>
          </div>

          {showAbsences && absenceCount !== undefined && absenceCount > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#535765]">Inasistencias</span>
              <span className="text-sm text-[#535765]">{absenceCount}</span>
            </div>
          )}

          {hasPeriodsWithScores && (
            <CollapsibleTrigger className="bg-white flex items-center gap-1 text-sm text-[#535765] hover:text-[#22222A] transition-colors w-full">
              <span>Ver periodos</span>
              <ChevronDownIcon className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
          )}
        </div>

        {hasPeriodsWithScores && (
          <CollapsibleContent>
            <div className="px-5 py-3 bg-[#FBFCFD] border-t border-[#EBEDF0]">
              {periods.map((period) => {
                const scoreEntity = assignmentScores?.scores.find((score) => score.origin_id === period.id);

                return (
                  <div key={period.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#535765]">{period.name}</span>
                    <span className="text-base font-semibold text-[#22222A]">
                      {scoreEntity?.score !== null && scoreEntity?.score !== undefined
                        ? scoreEntity.score.toFixed(1)
                        : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}

function ScoresPage() {
  const router = useRouter();
  const { guardianHash, studentId } = router.query;
  const { toast, dismiss } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<FileMetadata | null>(null);

  const { data: student } = api.students.getStudent.useQuery(
    { studentId: studentId as string },
    {
      enabled: !!studentId,
    }
  );
  const { data: guardianDebt } = api.guardian.getGuardianDebt.useQuery(
    {
      school_id: student?.school_id as string,
    },
    {
      enabled: !!student?.school_id,
    }
  );

  const {
    activeCycle,
    classrooms,
    assignments,
    scoresByAssignment,
    periodsByLevel,
    isLoading,
    schoolConfig,
    academicConfigs,
    attendanceSummary,
  } = useStudentScoresData({
    studentId: studentId as string,
    schoolId: student?.school_id,
  });

  const { mutateAsync: downloadScoreCard, isPending: isDownloading } = api.students.getScoreCard.useMutation();

  useEffect(() => {
    if (pdfFile?.url) {
      return () => {
        URL.revokeObjectURL(pdfFile.url);
      };
    }
  }, [pdfFile?.url]);

  async function handleDownloadScoreCard() {
    if (!studentId || !activeCycle?.id) return;

    try {
      const report = await downloadScoreCard({
        student_id: studentId as string,
        school_cycle_id: activeCycle.id,
      });

      if (!report?.download_url) {
        throw new Error('Invalid score card data response: is empty');
      }
      const fileName = `Boleta ${activeCycle.name}.pdf`;

      if (pdfFile?.url) {
        URL.revokeObjectURL(pdfFile.url);
      }

      setPdfFile({
        name: fileName,
        url: report.download_url,
        extension: '.pdf',
      });
      setPreviewOpen(true);
    } catch (error) {
      Sentry.captureException(error);
      toast({ title: 'Error al cargar la boleta', variant: 'error' });
      setTimeout(dismiss, 3000);
    }
  }

  function handleDownloadPdf(file: FileMetadata) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Boleta descargada' });
    setTimeout(dismiss, 3000);
  }

  if (isLoading) {
    return <LoadingSkeleton guardianHash={guardianHash} studentId={studentId} />;
  }

  if (!activeCycle) {
    return (
      <EmptyState
        guardianHash={guardianHash}
        studentId={studentId}
        message="No hay un ciclo escolar activo en este momento."
      />
    );
  }

  if (classrooms.length === 0) {
    return (
      <EmptyState
        guardianHash={guardianHash}
        studentId={studentId}
        cycleName={activeCycle.name}
        message="No hay calificaciones disponibles en este momento."
      />
    );
  }

  const defaultDecimalPlaces = 2;
  const restrictReportCard = Boolean(
    schoolConfig?.academic?.restrict_report_card_for_debtors && guardianDebt?.has_due_fulfillments
  );

  const academicConfigByOriginId = new Map<string, AcademicConfigEntity>(
    academicConfigs?.map((config) => [config.origin_id, config])
  );
  function getDecimalPlaces(originId: string) {
    return academicConfigByOriginId.get(originId)?.scoring?.decimal_places ?? defaultDecimalPlaces;
  }

  return (
    <div className="min-h-screen bg-[#FBFCFD]">
      <PageHeader
        guardianHash={guardianHash}
        studentId={studentId}
        cycleName={activeCycle.name}
        restrictReportCard={restrictReportCard}
      />

      {!restrictReportCard ? (
        <div className="px-5 py-4">
          <div className="flex flex-col gap-4 pb-20">
            <Button
              variant="neutral"
              className="bg-neutral-900 text-white"
              onClick={handleDownloadScoreCard}
              disabled={isDownloading}
            >
              {isDownloading ? 'Cargando...' : 'Ver boleta'}
            </Button>
            <div className="rounded-xl border bg-[#E4E8EC] border-[#EBEDF0] px-5 py-4">
              <div className="flex justify-between items-center">
                <span>Promedio general</span>
                <span className="text-xl font-bold">
                  {scoresByAssignment?.average?.toFixed(defaultDecimalPlaces) || '-'}
                </span>
              </div>
              {attendanceSummary.total > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span>Total de inasistencias</span>
                  <span className="text-xl font-bold">{attendanceSummary.total}</span>
                </div>
              )}
            </div>
            {classrooms.map((classroom) => {
              const assignment = findStudentAssignment(assignments, classroom.id, studentId as string);
              const assignmentScores = assignment
                ? findScoresForAssignment(scoresByAssignment?.assignment_scores || [], assignment.id)
                : undefined;
              const periods = periodsByLevel.get(classroom.level_id) ?? [];
              const decimalPlaces = getDecimalPlaces(classroom.level_id);

              const attendanceConfig = academicConfigByOriginId.get(classroom.level_id)?.attendance;
              const showClassroomAbsences = attendanceConfig?.context === AttendanceContextTypeEnum.Classroom;
              const absenceCount = showClassroomAbsences
                ? attendanceSummary.byClassroom.get(classroom.id) ?? 0
                : undefined;

              return (
                <CourseCard
                  key={classroom.id}
                  classroom={classroom}
                  assignmentScores={assignmentScores}
                  periods={periods}
                  decimalPlaces={decimalPlaces}
                  absenceCount={absenceCount}
                  showAbsences={showClassroomAbsences}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {pdfFile && (
        <FilePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          files={[pdfFile]}
          initialIndex={0}
          onDownload={handleDownloadPdf}
        />
      )}
    </div>
  );
}

ScoresPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Calificaciones</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

ScoresPage.auth = true;

export default ScoresPage;
