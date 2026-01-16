import * as Sentry from '@sentry/nextjs';
import { ReactNode, useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { debounce } from 'lodash';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { TabsWrapper } from '/src/components/ui/Tabs';
import { notFound } from 'next/navigation';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  EyeIcon,
  GraduationCapIcon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import {
  AcademicConfigOriginTypeEnum,
  AssignmentNotesDTO,
  AssignmentScoresDTO,
  ClassroomEntity,
  ClassroomStudentAssignmentEntity,
  ClassroomStudentAssignmentIncludeEnum,
  EvaluationNoteEntity,
  EvaluationNoteOriginTypeEnum,
  EvaluationNotesByAssignmentCriteriaEnum,
  EvaluationNoteSystem,
  EvaluationPeriodEntity,
  EvaluationPeriodStatusEnum,
  EvaluationScoreEntity,
  EvaluationScoreOriginTypeEnum,
  EvaluationScoresByAssignmentCriteriaEnum,
  EvaluationScoresStatsByOriginCriteriaEnum,
  EvaluationScoreSystem,
} from '@cometa/trpc/src/students/types';
import { EditClassroomDrawer } from './classroom-drawers';
import { StudentAssignmentModal } from './student-assignment';
import { cn } from '@cometa/utils';
import { Tooltip } from '../../atoms/Tooltip';
import { format, parse } from 'date-fns';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { getClassroomNames } from '../utils';
import { useGetTeacherProfiles } from '../hooks';

type PeriodProgressProps = {
  progress?: number;
  period: EvaluationPeriodEntity;
};

function PeriodProgress({ progress = 0, period }: PeriodProgressProps) {
  const statusColor = {
    [EvaluationPeriodStatusEnum.Completed]: 'bg-gray-600',
    [EvaluationPeriodStatusEnum.InProgress]: 'bg-primary',
    [EvaluationPeriodStatusEnum.NotStarted]: 'bg-gray-300',
    [EvaluationPeriodStatusEnum.Undefined]: 'bg-gray-300',
  };
  const statusText = {
    [EvaluationPeriodStatusEnum.Completed]: null,
    [EvaluationPeriodStatusEnum.InProgress]: null,
    [EvaluationPeriodStatusEnum.NotStarted]: 'No iniciado',
    [EvaluationPeriodStatusEnum.Undefined]: 'Sin definir',
  };
  const scaledProgressValue = parseFloat((progress * 100).toFixed(0));
  const progressText = `${scaledProgressValue}%`;
  const periodIsReady = [EvaluationPeriodStatusEnum.Completed, EvaluationPeriodStatusEnum.InProgress].includes(
    period.status
  );
  const displayText = statusText[period.status];
  const formattedStartDate = period.start_date
    ? format(parse(period.start_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    : null;

  return (
    <div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">{period.name}</span>
        <div className="flex items-center gap-2">
          {!periodIsReady ? (
            <Tooltip
              message={period.start_date ? `Inicia ${formattedStartDate}` : 'Fecha de inicio del periodo sin definir'}
            >
              <div className="flex items-center cursor-default">
                <span className="text-sm text-gray-400 mr-2">{displayText}</span>
                <AlertTriangleIcon className="w-4 h-4 text-gray-400" />
              </div>
            </Tooltip>
          ) : null}
          {periodIsReady || scaledProgressValue !== 0 ? (
            <span className="text-sm font-medium">{progressText}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center mt-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`${statusColor[period.status]} h-2 rounded-full transition-all duration-300`}
            style={{ width: progressText }}
          />
        </div>
      </div>
    </div>
  );
}

function ClassroomDetailNav() {
  const router = useRouter();
  const prevPath = router.query.prev as string;

  return (
    <Link href={prevPath || '/academic/classrooms'} className="flex items-center gap-1 px-8 py-4 bg-white">
      <ArrowLeftIcon size={14} />
      <span className="text-[#6E7480] font-semibold text-xs uppercase ">Volver</span>
    </Link>
  );
}

type ClassroomDetailHeaderProps = {
  classroom?: ClassroomEntity;
  onEditClick: () => void;
};

function ClassroomDetailHeader({ classroom, onEditClick }: ClassroomDetailHeaderProps) {
  const { data: courseGroup } = api.students.getCourseGroup.useQuery(
    {
      id: classroom?.course?.course_group_id as string,
    },
    { enabled: !!classroom?.course?.course_group_id }
  );
  const { data: teacherAssignments = [] } = api.students.listClassroomTeacherAssignments.useQuery(
    {
      classroom_id: classroom?.id as string,
    },
    {
      enabled: !!classroom?.id,
    }
  );
  const membershipIds = teacherAssignments.map((ta) => ta.membership_id);
  const { data: userTeacherProfiles } = useGetTeacherProfiles();
  const { classroomName, groupName } = getClassroomNames(classroom);
  const cycleText = classroom?.school_cycle?.name ?? '';
  const teachersNames = userTeacherProfiles
    .filter((utp) => membershipIds.includes(utp.teacherProfile.membership_id))
    .map((teacher) => `${teacher.user?.first_name} ${teacher.user?.last_name}`)
    .join(', ')
    .trim();
  const teacherText = teachersNames.length > 0 ? `· ${teachersNames}` : '';

  const subtitle = `${groupName} · ${cycleText} ${teacherText}`;

  return (
    <div className="flex justify-between items-start pb-4 px-8 bg-white">
      <div className="text-gray-600">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{classroomName}</h1>
        <p>{subtitle}</p>
        <p>{courseGroup?.name}</p>
      </div>

      <Button variant="outline" onClick={onEditClick}>
        <PencilIcon size={14} />
        Editar clase
      </Button>
    </div>
  );
}

type ClassroomDetailTabsProps = {
  tab: string;
  handleTabChange: (tab: string) => void;
  children: ReactNode | ReactNode[];
};

function ClassroomDetailTabs({ tab, handleTabChange, children }: ClassroomDetailTabsProps) {
  const tabs = [
    {
      value: 'summary',
      label: 'Resumen',
    },
    {
      value: 'evaluations',
      label: 'Calificaciones',
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TabsWrapper
        tab={tab}
        tabs={tabs}
        handleChangeTab={handleTabChange}
        defaultValue={tab}
        tabsListClassName="pl-0 px-8 border-b border-b-[#D5DEED]"
        tabsTriggerClassName="text-sm text-[#8B93A0] py-3 data-state-active:text-primary-neutral"
        tabUnderlineClassName="bg-primary-neutral"
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function useClassroomTab({ classroomId }: { classroomId: string }) {
  const router = useRouter();

  const tabQuery = router.query.tab as string;
  const tab = tabQuery || 'summary';

  function handleTabChange(tab: string) {
    if (tab === 'summary') {
      return router.push(`/academic/classrooms/${classroomId}`);
    }

    return router.push(`/academic/classrooms/${classroomId}?tab=${tab}`);
  }

  return { tab, handleTabChange };
}

type SummaryContentProps = {
  assignments: ClassroomStudentAssignmentEntity[];
  onAssignStudents: () => void;
  isLoading: boolean;
  onRefresh: () => void;
  classroom?: ClassroomEntity;
};

type StudentDropdownMenuProps = {
  assignment: ClassroomStudentAssignmentEntity;
  onUnassign: (assignmentId: string, studentName: string) => void;
};

function StudentDropdownMenu({ assignment, onUnassign }: StudentDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const studentName = `${assignment.student?.first_name} ${assignment.student?.last_name}`;
  const router = useRouter();
  const { data: evaluationScoreCount } = api.students.getEvaluationScoreCount.useQuery({
    classroom_student_assignment_id: assignment.id,
  });

  function DeleteContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quieres desasignar a este estudiante?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Se eliminará su vínculo con esta clase.</p>
            <p>Esta acción no se puede deshacer.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onUnassign(assignment.id, studentName);
              setShowDeleteAlert(false);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Sí, desasignar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  function DeletionNotAllowedContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>El estudiante no puede desasignarse</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Cuenta con {evaluationScoreCount?.count}{' '}
              {evaluationScoreCount?.count === 0 ? 'calificación' : 'calificaciones'} registradas
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  const canDelete = evaluationScoreCount?.count === 0;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVerticalIcon size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1" align="end">
          <div className="space-y-1">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
              onClick={() => {
                setOpen(false);
                router.push(`/students/${assignment.student_id}`);
              }}
            >
              <EyeIcon size={16} />
              Ver perfil
            </button>

            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              onClick={() => {
                setOpen(false);
                setShowDeleteAlert(true);
              }}
            >
              <TrashIcon size={16} />
              Desasignar estudiante
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        {canDelete ? <DeleteContent /> : <DeletionNotAllowedContent />}
      </AlertDialog>
    </>
  );
}

function SummaryContent({ assignments, onAssignStudents, isLoading, onRefresh, classroom }: SummaryContentProps) {
  const { setAlertState } = useAlert();
  const { data: evaluationPeriods } = api.students.listEvaluationPeriods.useQuery(
    {
      level_id: classroom?.level_id as string,
      school_cycle_id: classroom?.school_cycle_id as string,
    },
    {
      enabled: !!classroom?.level_id && !!classroom?.school_cycle_id,
    }
  );

  const { data: evaluationStats } = api.students.getEvaluationScoresStatsByOrigin.useQuery(
    {
      classroom_id: classroom?.id as string,
      criteria: EvaluationScoresStatsByOriginCriteriaEnum.Classroom,
    },
    {
      enabled: !!classroom?.id,
    }
  );

  const deleteAssignmentMutation = api.students.deleteClassroomStudentAssignment.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        message: 'Estudiante desasignado correctamente',
        open: true,
      });
      onRefresh();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        message: 'Error al desasignar estudiante',
        open: true,
      });
    },
  });

  function handleUnassignStudent(assignmentId: string) {
    deleteAssignmentMutation.mutate({ assignment_id: assignmentId });
  }

  const activePeriod = evaluationPeriods?.find((p) => p.status === EvaluationPeriodStatusEnum.InProgress);
  const formattedEndDate =
    activePeriod && activePeriod.end_date
      ? format(parse(activePeriod.end_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
      : null;

  const progressByPeriod = useMemo(() => {
    if (!evaluationStats) return new Map<string, number>();

    const progressMap = new Map<string, number>();
    evaluationStats.forEach((stat) => {
      progressMap.set(stat.origin_id, stat.progress);
    });

    return progressMap;
  }, [evaluationStats]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1">
      <div className="order-2 lg:order-1 bg-white rounded-xl border col-span-3 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Lista de estudiantes ({assignments.length})</h3>
          <Button variant="ghost" size="sm" onClick={onAssignStudents}>
            <PlusIcon size={14} />
            Asignar estudiante
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="flex items-center justify-center w-24 h-24 bg-accent rounded-full mb-4">
                <GraduationCapIcon className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay estudiantes asignados</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Asigna estudiantes desde el botón superior para empezar a registrar calificaciones.
              </p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-2 hover:bg-gray-50 border-b group"
              >
                <span className="text-gray-700">
                  {assignment.student?.first_name} {assignment.student?.last_name}
                </span>
                <StudentDropdownMenu assignment={assignment} onUnassign={handleUnassignStudent} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="order-1 lg:order-2 bg-white rounded-xl border p-6 col-span-2">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Registro de calificaciones</h3>
        <p className="text-gray-600 mb-4">Revisa el avance del registro de calificaciones en esta clase.</p>

        <div className="flex flex-col gap-6">
          {evaluationPeriods && evaluationPeriods.length > 0 ? (
            evaluationPeriods.map((period) => (
              <PeriodProgress key={period.id} period={period} progress={progressByPeriod.get(period.id) ?? 0} />
            ))
          ) : (
            <div className="text-gray-500 text-sm">No hay períodos evaluativos configurados</div>
          )}
        </div>

        {activePeriod ? (
          <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-600">
                Tienes hasta el {formattedEndDate} para registrar calificaciones.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type EvaluationScoreInputProps = {
  scoreValue?: number;
  locked?: boolean;
  lockedMessage?: string;
  onScoreChange: (value: string) => void;
};

function EvaluationScoreInput({
  scoreValue,
  locked = false,
  lockedMessage = '',
  onScoreChange,
}: EvaluationScoreInputProps) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onScoreChange(e.target.value);
  }

  return (
    <Tooltip message={locked ? lockedMessage : ''}>
      <Input
        defaultValue={scoreValue ?? ''}
        onChange={debounce(handleInputChange, 500)}
        onClick={(e) => e.currentTarget.select()}
        disabled={locked}
        className="w-14 text-center"
        placeholder="-"
      />
    </Tooltip>
  );
}

type EvaluationNoteProps = {
  noteValue?: string;
  locked?: boolean;
  lockedMessage?: string;
  onNoteChange: (value: string) => void;
  variant?: 'compact' | 'expanded';
  maxLength?: number;
};

function EvaluationNote({
  noteValue,
  locked = false,
  lockedMessage = '',
  onNoteChange,
  variant = 'compact',
  maxLength = 600,
}: EvaluationNoteProps) {
  const [open, setOpen] = useState(false);
  const [localNote, setLocalNote] = useState(noteValue || '');

  useEffect(() => {
    setLocalNote(noteValue || '');
  }, [noteValue]);

  function handleNoteChange(value: string) {
    setLocalNote(value.slice(0, maxLength));
  }

  const hasNote = noteValue && noteValue.trim().length > 0;
  const NoteIcon = hasNote ? MessageSquareIcon : MessageSquarePlusIcon;

  function handleSave() {
    onNoteChange(localNote);
    setOpen(false);
  }

  function handleCancel() {
    setLocalNote(noteValue || '');
    setOpen(false);
  }

  const triggerVariants = {
    compact: (
      <Button
        variant="ghost"
        size="icon"
        disabled={locked}
        className={cn('p-0', hasNote ? 'text-gray-700' : 'text-gray-500', {
          'hover:bg-accent hover:text-accent-foreground text-gray-600': open,
        })}
      >
        <NoteIcon size={20} />
      </Button>
    ),
    expanded: (
      <div
        className={cn(
          'border-2 border-gray-400 rounded-md px-3 py-2 w-40 h-14 cursor-pointer text-sm transition-colors',
          'hover:border-primary hover:bg-gray-50 hover:border-gray-600',
          'line-clamp-2 overflow-hidden',
          locked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
          hasNote ? 'text-gray-700' : 'text-gray-500',
          {
            'border-gray-600': open,
          }
        )}
      >
        {noteValue || 'Agregar calificación cualitativa...'}
      </div>
    ),
  };

  function getMessage() {
    if (open) return undefined;
    if (lockedMessage) return lockedMessage;
    if (hasNote) return 'Editar calificación cualitativa';
    return 'Agregar calificación cualitativa';
  }

  return (
    <Tooltip message={getMessage()} key={open ? 'tooltip-disabled' : 'tooltip-enabled'}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerVariants[variant]}</PopoverTrigger>
        <PopoverContent className="w-80" align="center">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Calificación cualitativa</Label>
            <Textarea
              placeholder="Escribe tu evaluación cualitativa..."
              value={localNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              disabled={locked}
              className="min-h-[120px] resize-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="flex justify-between items-center pt-2">
              <span
                className={cn('text-xs text-gray-500', {
                  'text-orange-400': localNote.length > maxLength * 0.95,
                  'text-red-500': localNote.length == maxLength,
                })}
              >
                {localNote.length}/{maxLength}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  );
}

type EvaluationScoresAssignmentRowProps = {
  assignment: ClassroomStudentAssignmentEntity;
  periods: EvaluationPeriodEntity[];
  assignmentScores?: AssignmentScoresDTO;
  assignmentNotes?: AssignmentNotesDTO;
  refetchScores: () => void;
  refetchNotes: () => void;
  decimalPlaces?: number | null;
  lockPeriod?: boolean;
  evaluationScoreSystem?: EvaluationScoreSystem | null;
  evaluationNoteSystem?: EvaluationNoteSystem | null;
};

function EvaluationScoresAssignmentRow({
  assignment,
  periods,
  assignmentScores,
  assignmentNotes,
  refetchScores,
  refetchNotes,
  decimalPlaces,
  lockPeriod = false,
  evaluationScoreSystem,
  evaluationNoteSystem,
}: EvaluationScoresAssignmentRowProps) {
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const lastSubmittedValueRef = useRef(new Map<string, number | null>());
  const lastSubmittedNoteRef = useRef(new Map<string, string>());

  const upsertMutation = api.students.upsertEvaluationScore.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      refetchScores();
    },
    onError: (error, variables) => {
      Sentry.captureException(error);
      lastSubmittedValueRef.current.delete(variables.origin_id);
      setIsLoading(false);
      setAlertState({
        severity: 'error',
        message: 'Error al guardar la calificación',
        open: true,
      });
    },
  });

  const deleteMutation = api.students.deleteEvaluationScore.useMutation({
    onSuccess: (_, variables) => {
      const periodId = assignmentScores?.scores.find((s) => s.id === variables.evaluation_score_id)?.origin_id;
      if (periodId) {
        lastSubmittedValueRef.current.delete(periodId);
      }
      setIsLoading(false);
      refetchScores();
    },
    onError: (error, variables) => {
      Sentry.captureException(error);
      const periodId = assignmentScores?.scores.find((s) => s.id === variables.evaluation_score_id)?.origin_id;
      if (periodId) {
        lastSubmittedValueRef.current.delete(periodId);
      }
      setIsLoading(false);
      setAlertState({
        severity: 'error',
        message: 'Error al eliminar la calificación',
        open: true,
      });
    },
  });

  const upsertNoteMutation = api.students.upsertEvaluationNote.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      refetchNotes();
      setAlertState({
        severity: 'success',
        message: 'Calificación cualitativa guardada',
        open: true,
      });
    },
    onError: (error) => {
      Sentry.captureException(error);
      setIsLoading(false);
      setAlertState({
        severity: 'error',
        message: 'Error al guardar la calificación cualitativa',
        open: true,
      });
    },
  });

  const deleteNoteMutation = api.students.deleteEvaluationNote.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      refetchNotes();
    },
    onError: (error) => {
      Sentry.captureException(error);
      setIsLoading(false);
      setAlertState({
        severity: 'error',
        message: 'Error al eliminar la calificación cualitativa',
        open: true,
      });
    },
  });

  function handleScoreChange(periodId: string, value: string, evaluationScore?: EvaluationScoreEntity) {
    if (value === '' && evaluationScore) {
      const deletionHasBeenSend = lastSubmittedValueRef.current.get(periodId) === null;
      if (deletionHasBeenSend) return;

      lastSubmittedValueRef.current.set(periodId, null);
      setIsLoading(true);
      deleteMutation.mutate({ evaluation_score_id: evaluationScore.id });
      return;
    }

    if (value === '') return;

    const numericValue = parseFloat(value);
    if (numericValue < 0 || numericValue > 10) {
      setAlertState({
        severity: 'error',
        message: 'La calificación debe estar entre 0 y 10',
        open: true,
      });
      return;
    }

    const isDuplicatedRequest = numericValue === lastSubmittedValueRef.current.get(periodId);
    if (isDuplicatedRequest) return;

    lastSubmittedValueRef.current.set(periodId, numericValue);
    setIsLoading(true);
    upsertMutation.mutate({
      score: numericValue,
      origin_type: EvaluationScoreOriginTypeEnum.Period,
      origin_id: periodId,
      classroom_student_assignment_id: assignment.id,
    });
  }

  function handleNoteChange(periodId: string, value: string, evaluationNote?: EvaluationNoteEntity) {
    if (value.trim() === '' && evaluationNote) {
      setIsLoading(true);
      deleteNoteMutation.mutate({ evaluation_note_id: evaluationNote.id });
      return;
    }

    if (value.trim() === '') return;

    const isDuplicatedRequest = value === lastSubmittedNoteRef.current.get(periodId);
    if (isDuplicatedRequest) return;

    lastSubmittedNoteRef.current.set(periodId, value);
    setIsLoading(true);
    upsertNoteMutation.mutate({
      note: value,
      origin_type: EvaluationNoteOriginTypeEnum.Period,
      origin_id: periodId,
      classroom_student_assignment_id: assignment.id,
    });
  }

  const studentName = `${assignment.student?.first_name} ${assignment.student?.last_name}`;
  const scoresByPeriod = useMemo(() => {
    const scoresByPeriod = new Map<string, EvaluationScoreEntity>();
    periods.forEach((period) => {
      const evaluationScore = assignmentScores?.scores.find((score) => score.origin_id === period.id);
      if (evaluationScore) {
        scoresByPeriod.set(period.id, evaluationScore);
      }
    });
    return scoresByPeriod;
  }, [assignmentScores, periods]);

  const notesByPeriod = useMemo(() => {
    const notesByPeriod = new Map<string, EvaluationNoteEntity>();
    periods.forEach((period) => {
      const evaluationNote = assignmentNotes?.notes.find((note) => note.origin_id === period.id);
      if (evaluationNote) {
        notesByPeriod.set(period.id, evaluationNote);
      }
    });
    return notesByPeriod;
  }, [assignmentNotes, periods]);

  const average = assignmentScores?.average;
  const formattedAverage = average && decimalPlaces ? average.toFixed(decimalPlaces) : average;

  function isPeriodLocked(
    startDate?: string | null,
    endDate?: string | null
  ): {
    locked: boolean;
    message: string;
  } {
    if (!lockPeriod || !startDate || !endDate) return { locked: false, message: '' };

    const now = new Date();
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    end.setHours(23, 59, 59, 999);

    if (now > end) {
      return { locked: true, message: 'Este periodo está cerrado y no puedes editar calificaciones.' };
    }

    if (now < start) {
      return { locked: true, message: 'Este periodo aún no inicia y no puedes cargar calificaciones.' };
    }

    return { locked: false, message: '' };
  }

  const isQualitativeOnly = !evaluationScoreSystem && evaluationNoteSystem;
  const periodColumnSize = isQualitativeOnly ? 'minmax(160px, 180px)' : 'minmax(auto, 120px)';

  return (
    <div
      key={assignment.id}
      className="grid gap-4 items-center px-6 py-3 hover:bg-gray-50 border-b last:border-b-0"
      style={{ gridTemplateColumns: `1fr repeat(${periods.length}, ${periodColumnSize}) minmax(80px, auto)` }}
    >
      <div className="text-gray-700">{studentName}</div>
      {periods.map((period) => {
        const evaluationScore = scoresByPeriod.get(period.id);
        const evaluationNote = notesByPeriod.get(period.id);
        const { locked, message } = isPeriodLocked(period.start_date, period.end_date);

        return (
          <div key={period.id} className="flex justify-center items-center gap-1">
            {evaluationScoreSystem === EvaluationScoreSystem.Numeric && (
              <EvaluationScoreInput
                scoreValue={evaluationScore?.score}
                onScoreChange={(value) => handleScoreChange(period.id, value, evaluationScore)}
                locked={locked}
                lockedMessage={message}
              />
            )}

            {evaluationNoteSystem && (
              <EvaluationNote
                noteValue={evaluationNote?.note}
                locked={locked}
                lockedMessage={message}
                onNoteChange={(value) => handleNoteChange(period.id, value, evaluationNote)}
                variant={evaluationScoreSystem ? 'compact' : 'expanded'}
                maxLength={evaluationNoteSystem === EvaluationNoteSystem.ShortText ? 300 : 600}
              />
            )}
          </div>
        );
      })}
      <div className="flex justify-center">
        {evaluationScoreSystem === EvaluationScoreSystem.Numeric ? (
          <Tooltip message="El promedio se actualiza con las calificaciones ingresadas.">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded text-sm font-medium text-gray-800 cursor-default',
                {
                  'opacity-50': isLoading,
                }
              )}
            >
              {formattedAverage ?? '-'}
            </span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </div>
  );
}

type EvaluationContentProps = {
  classroom?: ClassroomEntity;
  assignments: ClassroomStudentAssignmentEntity[];
  isLoadingStudents: boolean;
  handleTabChange: (tab: string) => void;
};

function EvaluationContent({ classroom, assignments, isLoadingStudents, handleTabChange }: EvaluationContentProps) {
  const utils = api.useUtils();
  const selectedSchool = useSelectedSchool();
  const { data: evaluationPeriods, isLoading: isLoadingPeriods } = api.students.listEvaluationPeriods.useQuery(
    {
      level_id: classroom?.level_id as string,
      school_cycle_id: classroom?.school_cycle_id as string,
    },
    {
      enabled: !!classroom?.level_id && !!classroom?.school_cycle_id,
    }
  );
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );
  const { data: schoolConfigs } = api.students.listAcademicConfigs.useQuery(
    {
      origin_id: classroom?.level_id as string,
      school_cycle_id: classroom?.school_cycle_id as string,
      origin_type: AcademicConfigOriginTypeEnum.Level,
    },
    { enabled: !!classroom }
  );
  const academicConfig = schoolConfigs?.[0];
  const { data: scoresByAssignment } = api.students.listEvaluationScoresByAssignment.useQuery(
    {
      classroom_id: classroom?.id as string,
      criteria: EvaluationScoresByAssignmentCriteriaEnum.Classroom,
    },
    { enabled: !!classroom?.id }
  );

  const { data: notesByAssignment } = api.students.listEvaluationNotesByAssignment.useQuery(
    {
      classroom_id: classroom?.id as string,
      criteria: EvaluationNotesByAssignmentCriteriaEnum.Classroom,
    },
    { enabled: !!classroom?.id }
  );

  function invalidateQueries() {
    utils.students.listEvaluationScoresByAssignment.invalidate();
    utils.students.listEvaluationNotesByAssignment.invalidate();
    utils.students.getEvaluationScoresStatsByOrigin.invalidate();
  }

  const assignmentScoresMap = new Map<string, AssignmentScoresDTO>();
  scoresByAssignment?.assignment_scores?.forEach((scoreData) => {
    assignmentScoresMap.set(scoreData.classroom_student_assignment_id, scoreData);
  });

  const assignmentNotesMap = new Map<string, AssignmentNotesDTO>();
  notesByAssignment?.assignment_notes?.forEach((noteData) => {
    assignmentNotesMap.set(noteData.classroom_student_assignment_id, noteData);
  });

  if (isLoadingStudents || isLoadingPeriods) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-center items-center h-32">
          <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
        </div>
      </div>
    );
  }

  if (!evaluationPeriods || evaluationPeriods.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Calificaciones por periodo</h3>
        <p className="text-gray-600">No hay períodos evaluativos configurados para este nivel.</p>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay estudiantes asignados</h3>
          <p className="text-sm text-gray-600 text-left mb-6 max-w-md">
            Asigna estudiantes primero para poder registrar <br /> calificaciones en esta clase.
          </p>
          <Button onClick={() => handleTabChange('summary')} variant="secondary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Asignar estudiantes
          </Button>
        </div>
      </div>
    );
  }

  const evaluationScoreSystem = academicConfig?.scoring?.evaluation_score_system;
  const evaluationNoteSystem = academicConfig?.scoring?.evaluation_note_system;

  const isQualitativeOnly = !evaluationScoreSystem && evaluationNoteSystem;
  const periodColumnSize = isQualitativeOnly ? 'minmax(160px, 180px)' : 'minmax(auto, 120px)';

  return (
    <div className="bg-white rounded-xl border">
      <div
        className="grid gap-4 items-center py-6 px-6 border-b font-semibold text-gray-700"
        style={{
          gridTemplateColumns: `1fr repeat(${evaluationPeriods.length}, ${periodColumnSize}) minmax(80px, auto)`,
        }}
      >
        <div className="text-left">Nombre</div>
        {evaluationPeriods.map((period) => (
          <div key={period.id} className="text-center">
            {period.name}
          </div>
        ))}
        <div className="text-center">Promedio</div>
      </div>

      <div className="divide-y">
        {assignments.map((assignment) => (
          <EvaluationScoresAssignmentRow
            key={assignment.id}
            assignment={assignment}
            periods={evaluationPeriods}
            assignmentScores={assignmentScoresMap.get(assignment.id)}
            assignmentNotes={assignmentNotesMap.get(assignment.id)}
            refetchScores={invalidateQueries}
            refetchNotes={invalidateQueries}
            decimalPlaces={academicConfig?.scoring?.decimal_places}
            lockPeriod={schoolConfig?.academic?.lock_evaluation_score_editing_after_period_close}
            evaluationScoreSystem={academicConfig?.scoring?.evaluation_score_system}
            evaluationNoteSystem={academicConfig?.scoring?.evaluation_note_system}
          />
        ))}
      </div>
    </div>
  );
}

export function ClassroomDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { tab, handleTabChange } = useClassroomTab({ classroomId: id as string });
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);

  const {
    data: classroom,
    isLoading,
    isError,
    isFetched,
  } = api.students.getClassroomById.useQuery(
    {
      classroom_id: id as string,
      query: {
        include: ['level', 'grade', 'group', 'course', 'school_cycle'],
      },
    },
    { enabled: !!id }
  );

  const {
    data: assignments,
    isLoading: isLoadingStudents,
    refetch: refetchAssignments,
  } = api.students.listClassroomStudentAssignments.useQuery(
    {
      classroom_id: id as string,
      include: [ClassroomStudentAssignmentIncludeEnum.Student],
    },
    { enabled: !!id }
  );
  const studentIdsAlreadyAssigned = assignments?.map((assignment) => assignment?.student?.id) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (isError || (!classroom && isFetched)) {
    return notFound();
  }

  const tabComponents: Record<string, ReactNode> = {
    summary: (
      <SummaryContent
        assignments={assignments ?? []}
        onAssignStudents={() => setShowAssignStudentsModal(true)}
        isLoading={isLoadingStudents}
        onRefresh={refetchAssignments}
        classroom={classroom}
      />
    ),
    evaluations: (
      <EvaluationContent
        classroom={classroom}
        assignments={assignments ?? []}
        isLoadingStudents={isLoadingStudents}
        handleTabChange={handleTabChange}
      />
    ),
  };

  return (
    <div className="h-screen antialiased font-lota flex flex-col bg-[#8B93A00A]">
      <ClassroomDetailNav />
      <ClassroomDetailHeader classroom={classroom} onEditClick={() => setShowEditDrawer(true)} />

      <div className="flex-1 flex flex-col">
        <ClassroomDetailTabs tab={tab} handleTabChange={handleTabChange}>
          <section className="flex-1 p-8 overflow-y-auto">{tabComponents[tab]}</section>
        </ClassroomDetailTabs>
      </div>

      <EditClassroomDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        classroom={classroom}
        assignmentCount={assignments?.length ?? 0}
      />
      <StudentAssignmentModal
        open={showAssignStudentsModal}
        onOpenChange={setShowAssignStudentsModal}
        classroom={classroom}
        onAssign={refetchAssignments}
        studentIdsAlreadyAssigned={studentIdsAlreadyAssigned as string[]}
      />
    </div>
  );
}
