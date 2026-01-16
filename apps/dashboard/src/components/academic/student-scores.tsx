import * as Sentry from '@sentry/nextjs';
import { useMemo } from 'react';
import { DownloadIcon, GraduationCapIcon } from 'lucide-react';
import { Button } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import {
  AcademicConfigOriginTypeEnum,
  ClassroomIncludeEnum,
  EvaluationScoresByAssignmentCriteriaEnum,
  type ClassroomEntity,
  type ClassroomStudentAssignmentEntity,
  type EvaluationPeriodEntity,
  type AssignmentScoresDTO,
  type AcademicConfigEntity,
} from '@cometa/trpc/src/students/types';

interface StudentScoresProps {
  studentId: string;
}

interface CourseScoreRowProps {
  classroom: ClassroomEntity;
  assignmentScores: AssignmentScoresDTO | undefined;
  periods: EvaluationPeriodEntity[];
  decimalPlaces: number;
}

interface ScoresTableProps {
  classrooms: ClassroomEntity[];
  assignments: ClassroomStudentAssignmentEntity[];
  scoresByAssignment: any;
  periodsByLevel: Map<string, EvaluationPeriodEntity[]>;
  academicConfigs: AcademicConfigEntity[] | undefined;
  studentId: string;
}

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

function useStudentScoresData({ studentId, schoolId }: { studentId?: string; schoolId?: string }) {
  const { activeCycle } = useSchoolCycleSelector();

  const { data: assignments, isLoading: isLoadingAssignments } = api.students.listClassroomStudentAssignments.useQuery(
    { student_id: studentId as string },
    { enabled: !!studentId }
  );

  const classroomIds = useMemo(() => assignments?.map((assignment) => assignment.classroom_id) || [], [assignments]);

  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = api.students.listClassrooms.useQuery(
    {
      schoolId: schoolId as string,
      query: {
        id: classroomIds,
        include: [ClassroomIncludeEnum.Course],
        limit: 100,
      },
    },
    { enabled: classroomIds.length > 0 && !!schoolId }
  );

  const classrooms = classroomsResponse?.results ?? [];

  const { data: evaluationPeriods, isLoading: isLoadingPeriods } = api.students.listEvaluationPeriods.useQuery(
    { school_cycle_id: activeCycle?.id as string },
    { enabled: !!activeCycle?.id }
  );

  const periodsByLevel = useMemo(() => {
    if (!evaluationPeriods) return new Map<string, EvaluationPeriodEntity[]>();
    return groupPeriodsByLevel(evaluationPeriods);
  }, [evaluationPeriods]);

  const { data: scoresByAssignment, isLoading: isLoadingScores } =
    api.students.listEvaluationScoresByAssignment.useQuery(
      {
        student_id: studentId as string,
        school_cycle_id: activeCycle?.id as string,
        criteria: EvaluationScoresByAssignmentCriteriaEnum.Student,
      },
      { enabled: !!studentId && !!activeCycle?.id }
    );

  const { data: academicConfigs, isLoading: isLoadingAcademicConfig } = api.students.listAcademicConfigs.useQuery(
    {
      origin_id: classrooms.map((classroom) => classroom.level_id),
      school_cycle_id: activeCycle?.id as string,
      origin_type: AcademicConfigOriginTypeEnum.Level,
    },
    { enabled: !!classrooms.length && !!activeCycle }
  );

  const isLoading =
    isLoadingAssignments || isLoadingClassrooms || isLoadingPeriods || isLoadingScores || isLoadingAcademicConfig;

  return {
    activeCycle,
    classrooms,
    assignments: assignments ?? [],
    scoresByAssignment,
    periodsByLevel,
    academicConfigs,
    isLoading,
  };
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center h-64">
      <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border p-8">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex items-center justify-center w-24 h-24 bg-accent rounded-full mb-4">
          <GraduationCapIcon className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay calificaciones disponibles</h3>
        <p className="text-sm text-gray-500 text-center">{message}</p>
      </div>
    </div>
  );
}

function CourseScoreRow({ classroom, assignmentScores, periods, decimalPlaces }: CourseScoreRowProps) {
  const courseName = [classroom.course?.name, classroom.variant].filter(Boolean).join(' ');

  const scoresByPeriod = useMemo(() => {
    const map = new Map<string, number>();
    periods.forEach((period) => {
      const score = assignmentScores?.scores.find((s) => s.origin_id === period.id);
      if (score?.score !== null && score?.score !== undefined) {
        map.set(period.id, score.score);
      }
    });
    return map;
  }, [assignmentScores, periods]);

  return (
    <div
      className="grid gap-4 items-center px-6 py-3 hover:bg-gray-50 border-b last:border-b-0"
      style={{
        gridTemplateColumns: `1fr repeat(${periods.length}, minmax(120px, auto)) minmax(80px, auto)`,
      }}
    >
      <div className="text-gray-700 font-medium">{courseName}</div>

      {periods.map((period) => {
        const score = scoresByPeriod.get(period.id);
        return (
          <div key={period.id} className="flex justify-center">
            <span className="text-gray-700">
              {score !== null && score !== undefined ? score.toFixed(decimalPlaces) : '-'}
            </span>
          </div>
        );
      })}

      <div className="flex justify-center">
        <span className="text-gray-800 font-semibold">
          {assignmentScores?.average !== null && assignmentScores?.average !== undefined
            ? assignmentScores.average.toFixed(decimalPlaces)
            : '-'}
        </span>
      </div>
    </div>
  );
}

function ScoresTable({
  classrooms,
  assignments,
  scoresByAssignment,
  periodsByLevel,
  academicConfigs,
  studentId,
}: ScoresTableProps) {
  const assignmentScoresMap = useMemo(() => {
    const map = new Map<string, AssignmentScoresDTO>();
    scoresByAssignment?.assignment_scores?.forEach((scoreData: AssignmentScoresDTO) => {
      map.set(scoreData.classroom_student_assignment_id, scoreData);
    });
    return map;
  }, [scoresByAssignment]);

  const academicConfigByOriginId = useMemo(() => {
    const map = new Map<string, AcademicConfigEntity>();
    academicConfigs?.forEach((config) => map.set(config.origin_id, config));
    return map;
  }, [academicConfigs]);

  const getDecimalPlaces = (levelId: string) => academicConfigByOriginId.get(levelId)?.scoring?.decimal_places ?? 2;

  const classroomsByLevel = useMemo(() => {
    const map = new Map<string, ClassroomEntity[]>();
    classrooms.forEach((classroom) => {
      const existing = map.get(classroom.level_id) || [];
      map.set(classroom.level_id, [...existing, classroom]);
    });
    return map;
  }, [classrooms]);

  const uniqueLevels = Array.from(classroomsByLevel.keys());
  const shouldShowLevelTitles = uniqueLevels.length > 1;

  if (classrooms.length === 0) return null;

  return (
    <div className="space-y-6">
      {uniqueLevels.map((levelId) => {
        const levelClassrooms = classroomsByLevel.get(levelId) || [];
        const periods = periodsByLevel.get(levelId) ?? [];
        const levelName = levelClassrooms[0]?.level?.name;

        if (periods.length === 0) return null;

        return (
          <div key={levelId}>
            {shouldShowLevelTitles && levelName && (
              <h4 className="text-base font-semibold text-gray-800 mb-3">{levelName}</h4>
            )}

            <div className="bg-white rounded-xl border">
              <div
                className="grid gap-4 items-center px-6 py-4 border-b font-semibold text-gray-700 bg-gray-50"
                style={{
                  gridTemplateColumns: `1fr repeat(${periods.length}, minmax(120px, auto)) minmax(80px, auto)`,
                }}
              >
                <div>Clase</div>
                {periods.map((period) => (
                  <div key={period.id} className="text-center">
                    {period.name}
                  </div>
                ))}
                <div className="text-center">Promedio</div>
              </div>

              {levelClassrooms.map((classroom) => {
                const assignment = findStudentAssignment(assignments, classroom.id, studentId);
                const assignmentScores = assignment ? assignmentScoresMap.get(assignment.id) : undefined;
                const decimalPlaces = getDecimalPlaces(levelId);

                return (
                  <CourseScoreRow
                    key={classroom.id}
                    classroom={classroom}
                    assignmentScores={assignmentScores}
                    periods={periods}
                    decimalPlaces={decimalPlaces}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StudentScores({ studentId }: StudentScoresProps) {
  const selectedSchool = useSelectedSchool();

  const { activeCycle, classrooms, assignments, scoresByAssignment, periodsByLevel, academicConfigs, isLoading } =
    useStudentScoresData({
      studentId,
      schoolId: selectedSchool?.id,
    });

  const { mutateAsync: generateScoreCard, isPending: isDownloading } = api.students.generateScoreCard.useMutation();

  const handleDownloadScoreCard = async () => {
    if (!studentId || !activeCycle?.id) return;

    try {
      const result = await generateScoreCard({
        student_id: studentId,
        school_cycle_id: activeCycle.id,
      });

      if (result?.download_url) {
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = `Boleta_${activeCycle.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!activeCycle) {
    return <EmptyState message="No hay un ciclo escolar activo en este momento." />;
  }

  if (classrooms.length === 0) {
    return <EmptyState message="Este estudiante no está asignado a ninguna clase." />;
  }

  if (assignments.length === 0) {
    return <EmptyState message="Este estudiante no tiene asignaciones de clase registradas." />;
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="bg-white rounded-xl border px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Vista previa de boleta</h3>
          <span className="text-sm text-gray-600 mt-1">{activeCycle.name}</span>
        </div>
        <Button onClick={handleDownloadScoreCard} disabled={isDownloading} variant="light">
          <DownloadIcon size={16} />
          {isDownloading ? 'Descargando...' : 'Descargar boleta'}
        </Button>
      </div>

      <ScoresTable
        classrooms={classrooms}
        assignments={assignments}
        scoresByAssignment={scoresByAssignment}
        periodsByLevel={periodsByLevel}
        academicConfigs={academicConfigs}
        studentId={studentId}
      />
    </div>
  );
}
