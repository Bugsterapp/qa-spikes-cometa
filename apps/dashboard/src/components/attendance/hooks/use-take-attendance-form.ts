import { useState, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '/src/utils/api';
import useAlert from '/src/hooks/useAlert';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import {
  EvaluationPeriodStatusEnum,
  AttendanceContextTypeEnum,
  AttendanceStatusEnum,
  AttendanceSessionIncludeEnum,
  AttendanceRecordIncludeEnum,
  ClassroomIncludeEnum,
  AcademicConfigOriginTypeEnum,
} from '@cometa/trpc/src/students/types';
import { useAttendanceTracking } from './use-attendance-tracking';

const formSchema = z.object({
  date: z.string(),
  levelId: z.string().min(1, 'El nivel es requerido'),
  contextId: z.string().min(1, 'El contexto es requerido'),
});

export type FormData = z.infer<typeof formSchema>;

type UseTakeAttendanceFormProps = {
  onOpenChange: (open: boolean) => void;
  attendanceSessionId?: string;
};

export function useTakeAttendanceForm({ onOpenChange, attendanceSessionId }: UseTakeAttendanceFormProps) {
  const utils = api.useUtils();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'contextDetail'>('form');
  const [searchText, setSearchText] = useState('');
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [absentStudentIds, setAbsentStudentIds] = useState<Set<string>>(new Set());
  const hasTrackedFlowStartRef = useRef(false);

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();
  const { activeCycle } = useSchoolCycleSelector();

  const isEditMode = !!attendanceSessionId;

  const tracking = useAttendanceTracking();

  const processAttendance = api.students.processAttendance.useMutation();
  const bulkCreateAttendance = api.students.bulkCreateAttendanceSession.useMutation({
    onSuccess: () => {
      utils.students.listAttendanceSessions.invalidate();
    },
  });
  const bulkUpdateAttendanceRecords = api.students.bulkUpdateAttendanceRecords.useMutation({
    onSuccess: () => {
      utils.students.listAttendanceSessions.invalidate();
      utils.students.getAttendanceSession.invalidate();
      utils.students.listAttendanceRecords.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Registros de asistencia actualizados.',
      });
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al actualizar registros de asistencia.',
      });
    },
  });

  const { data: existingSession, isLoading: isLoadingSession } = api.students.getAttendanceSession.useQuery(
    {
      session_id: attendanceSessionId as string,
      include: [
        AttendanceSessionIncludeEnum.Group,
        AttendanceSessionIncludeEnum.Classroom,
        AttendanceSessionIncludeEnum.EvaluationPeriod,
      ],
    },
    {
      enabled: isEditMode && !!attendanceSessionId,
    }
  );

  const { data: fullClassroomData, isLoading: isLoadingFullClassroom } = api.students.getClassroomById.useQuery(
    {
      classroom_id: existingSession?.context_id as string,
      query: {
        include: [
          ClassroomIncludeEnum.Course,
          ClassroomIncludeEnum.Level,
          ClassroomIncludeEnum.Grade,
          ClassroomIncludeEnum.Group,
        ],
      },
    },
    {
      enabled:
        isEditMode &&
        !!existingSession?.context_id &&
        existingSession?.context_type === AttendanceContextTypeEnum.Classroom,
    }
  );

  const { data: existingRecords, isLoading: isLoadingRecords } = api.students.listAttendanceRecords.useQuery(
    {
      session_id: attendanceSessionId as string,
      include: [AttendanceRecordIncludeEnum.Student],
    },
    {
      enabled: isEditMode && !!attendanceSessionId,
    }
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      levelId: '',
      contextId: '',
    },
  });

  const selectedLevelId = form.watch('levelId');

  const { data: levelConfigs, isLoading: isLoadingLevelConfig } = api.students.listAcademicConfigs.useQuery(
    {
      origin_type: AcademicConfigOriginTypeEnum.Level,
      origin_id: selectedLevelId,
      school_cycle_id: activeCycle?.id as string,
    },
    {
      enabled: !!selectedLevelId && !!activeCycle?.id,
    }
  );

  const attendanceContextType = useMemo(() => {
    if (isEditMode && existingSession) {
      return existingSession.context_type;
    }

    const levelConfig = levelConfigs?.[0];
    if (levelConfig?.attendance?.context) {
      return levelConfig.attendance.context;
    }

    return null;
  }, [isEditMode, existingSession, levelConfigs]);

  const hasAttendanceConfig = !!attendanceContextType;

  const { data: levels, isLoading: isLoadingLevels } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const { data: classroomsData, isLoading: isLoadingClassrooms } = api.students.listClassrooms.useInfiniteQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        level_id: selectedLevelId,
        school_cycle_id: activeCycle?.id,
        search: searchText,
        limit: 50,
        include: ['course', 'level', 'grade', 'group'],
      },
    },
    {
      enabled:
        attendanceContextType === AttendanceContextTypeEnum.Classroom &&
        !!selectedLevelId &&
        !!activeCycle?.id &&
        !!selectedSchool?.id,
      getNextPageParam: (lastPage) => {
        if (!lastPage?.has_more) return undefined;
        return String(lastPage.page + 1);
      },
    }
  );

  const classrooms = useMemo(
    () => classroomsData?.pages.flatMap((page) => page?.results ?? []) || [],
    [classroomsData]
  );

  const groups = useMemo(() => {
    if (attendanceContextType !== AttendanceContextTypeEnum.Group || !levels || !selectedLevelId) {
      return [];
    }

    const selectedLevel = levels.find((l) => l.id === selectedLevelId);
    if (!selectedLevel?.grades) return [];

    const allGroups: any[] = [];
    selectedLevel.grades.forEach((grade) => {
      if (grade.groups) {
        grade.groups.forEach((group) => {
          const displayName = `${selectedLevel.name} · ${grade.name} ${group.name}`;
          if (searchText && !displayName.toLowerCase().includes(searchText.toLowerCase())) {
            return;
          }

          allGroups.push({
            id: group.id,
            name: group.name,
            grade: grade,
            level: selectedLevel,
            displayName,
          });
        });
      }
    });

    return allGroups;
  }, [levels, selectedLevelId, searchText, attendanceContextType]);

  const contexts = useMemo(
    () => (attendanceContextType === AttendanceContextTypeEnum.Classroom ? classrooms : groups),
    [classrooms, groups, attendanceContextType]
  );

  const isLoadingContexts = useMemo(() => {
    if (!attendanceContextType) return false;
    return attendanceContextType === AttendanceContextTypeEnum.Classroom ? isLoadingClassrooms : false;
  }, [attendanceContextType, isLoadingClassrooms]);

  const { data: evaluationPeriods } = api.students.listEvaluationPeriods.useQuery(
    {
      level_id: selectedLevelId,
      school_cycle_id: activeCycle?.id as string,
    },
    { enabled: !!selectedLevelId && !!activeCycle?.id }
  );

  const { data: availableStudents, isLoading: isLoadingStudents } = api.students.getAvailableStudents.useQuery(
    {
      context_id: selectedContextId as string,
      context_type: attendanceContextType as AttendanceContextTypeEnum,
    },
    {
      enabled: !!selectedContextId && !!attendanceContextType && currentStep === 'contextDetail',
    }
  );

  const selectedContext = useMemo(() => {
    if (isEditMode && existingSession) {
      if (existingSession.context_type === AttendanceContextTypeEnum.Classroom) {
        return fullClassroomData || existingSession.classroom;
      } else {
        const group = existingSession.group;
        if (!group || !levels) return group;

        const allGroups = levels.flatMap((level) =>
          (level.grades || []).flatMap((grade) =>
            (grade.groups || []).map((g) => ({
              ...g,
              level,
              grade,
              displayName: `${level.name} · ${grade.name} ${g.name}`,
            }))
          )
        );

        const enrichedGroup = allGroups.find((g) => g.id === group.id);
        return enrichedGroup || group;
      }
    }

    if (attendanceContextType === AttendanceContextTypeEnum.Classroom) {
      return classrooms.find((c) => c.id === selectedContextId);
    } else if (attendanceContextType === AttendanceContextTypeEnum.Group) {
      return groups.find((g) => g.id === selectedContextId);
    }

    return undefined;
  }, [
    classrooms,
    groups,
    selectedContextId,
    isEditMode,
    existingSession,
    levels,
    fullClassroomData,
    attendanceContextType,
  ]);

  const selectedLevel = levels?.find((l) => l.id === selectedLevelId);

  useEffect(() => {
    if (!existingSession || !isEditMode) return;

    let levelId: string | undefined;

    if (existingSession.context_type === AttendanceContextTypeEnum.Classroom) {
      levelId = fullClassroomData?.level_id || existingSession.classroom?.level_id;
    } else {
      if (levels) {
        const allGroups = levels.flatMap((level) =>
          (level.grades || []).flatMap((grade) =>
            (grade.groups || []).map((g) => ({ groupId: g.id, levelId: level.id }))
          )
        );
        const found = allGroups.find((g) => g.groupId === existingSession.group?.id);
        levelId = found?.levelId ?? undefined;
      }
    }

    form.setValue('date', existingSession.date);
    if (levelId) {
      form.setValue('levelId', levelId);
    }
    form.setValue('contextId', existingSession.context_id);

    setSelectedContextId(existingSession.context_id);

    setCurrentStep('contextDetail');
  }, [existingSession, isEditMode, form, fullClassroomData, levels]);

  useEffect(() => {
    if (!existingRecords || !isEditMode) return;

    const absentIds = new Set(
      existingRecords
        .filter((record) => record.status === AttendanceStatusEnum.Absent)
        .map((record) => record.student_id)
    );

    setAbsentStudentIds(absentIds);
  }, [existingRecords, isEditMode]);

  function handleContextSelect(contextId: string) {
    form.setValue('contextId', contextId);
    setSelectedContextId(contextId);
    setCurrentStep('contextDetail');

    if (!hasTrackedFlowStartRef.current && attendanceContextType) {
      const levelId = form.getValues('levelId');
      tracking.trackFlowStarted({
        scope: attendanceContextType === AttendanceContextTypeEnum.Classroom ? 'classroom' : 'group',
        levelId,
      });
      hasTrackedFlowStartRef.current = true;
    }
  }

  async function handleRecordingComplete(audioBlob: Blob) {
    if (!attendanceContextType) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se ha configurado el tipo de asistencia para este nivel.',
        alertTime: 5000,
      });
      return;
    }

    const reader = new FileReader();

    tracking.trackModeSelected('ai');

    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];

      const formData = form.getValues();
      const activePeriod = evaluationPeriods?.find((p) => p.status === EvaluationPeriodStatusEnum.InProgress);

      if (!session?.user?.id || !selectedSchool?.id) {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'No se pudo obtener la información de sesión. Por favor, recarga la página.',
          alertTime: 5000,
        });
        tracking.trackAiRecordingFailed('session_error');
        return;
      }

      if (!activePeriod?.id) {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'No se encontró un período de evaluación activo para este nivel.',
          alertTime: 5000,
        });
        tracking.trackAiRecordingFailed('no_active_period');
        return;
      }

      setIsProcessing(true);

      try {
        const response = await processAttendance.mutateAsync({
          input: base64Data,
          school_id: selectedSchool.id,
          evaluation_period_id: activePeriod.id,
          context_type: attendanceContextType,
          context_id: formData.contextId,
          date: formData.date,
          taken_by_id: session.user.id,
          confirm: false,
        });

        if (response?.output?.records) {
          const newAbsentIds = new Set<string>();
          response.output.records.forEach((record: any) => {
            if (record.status === AttendanceStatusEnum.Absent && record.student_id) {
              newAbsentIds.add(record.student_id);
            }
          });
          setAbsentStudentIds(newAbsentIds);

          tracking.trackAiResultShown(response.output.records.length, response.output.needs_clarification ?? false);
        }
      } catch (error) {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Error al procesar el audio. Por favor intenta nuevamente.',
          alertTime: 5000,
        });
        tracking.trackAiRecordingFailed('processing_error');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(audioBlob);
  }

  function toggleStudentAbsence(studentId: string) {
    if (isProcessing) return;

    tracking.trackModeSelected('manual');

    setAbsentStudentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }

  async function handleRegisterAttendance() {
    if (!attendanceContextType) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se ha configurado el tipo de asistencia para este nivel.',
        alertTime: 5000,
      });
      return;
    }

    const formData = form.getValues();
    const activePeriod = evaluationPeriods?.find((p) => p.status === EvaluationPeriodStatusEnum.InProgress);
    const attendanceHeaders = tracking.getSubmitHeaders();

    if (!session?.user?.id || !selectedSchool?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo obtener la información de sesión. Por favor, recarga la página.',
        alertTime: 5000,
      });
      return;
    }

    if (!activePeriod?.id && !isEditMode) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se encontró un período de evaluación activo para este nivel.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isEditMode) {
        const studentRecordMap = new Map(existingRecords?.map((record) => [record.student_id, record.id]) || []);

        const records =
          availableStudents
            ?.filter((student) => studentRecordMap.has(student.student_id))
            .map((student) => ({
              record_id: studentRecordMap.get(student.student_id) as string,
              status: absentStudentIds.has(student.student_id)
                ? AttendanceStatusEnum.Absent
                : AttendanceStatusEnum.Present,
              notes: null,
            })) || [];

        await bulkUpdateAttendanceRecords.mutateAsync({
          session_id: attendanceSessionId,
          records,
          attendanceHeaders,
        });

        tracking.trackSubmitClicked(attendanceSessionId);
        handleClose();
      } else {
        if (!activePeriod?.id) {
          setAlertState({
            open: true,
            severity: 'error',
            message: 'Error al registrar la asistencia. No hay periodo activo.',
          });
          return;
        }

        const records =
          availableStudents?.map((student) => ({
            student_id: student.student_id,
            status: absentStudentIds.has(student.student_id)
              ? AttendanceStatusEnum.Absent
              : AttendanceStatusEnum.Present,
          })) || [];

        const response = await bulkCreateAttendance.mutateAsync({
          school_id: selectedSchool.id,
          evaluation_period_id: activePeriod.id,
          date: formData.date,
          context_id: formData.contextId,
          context_type: attendanceContextType,
          taken_by_id: session.user.id,
          recorded_by_id: session.user.id,
          notes: null,
          records,
          attendanceHeaders,
        });

        tracking.trackSubmitClicked(response?.id);

        setAlertState({
          open: true,
          severity: 'success',
          message: 'Asistencia registrada correctamente.',
          alertTime: 3000,
        });

        handleClose();
      }
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: isEditMode
          ? 'Error al actualizar la asistencia. Por favor intenta nuevamente.'
          : 'Error al registrar la asistencia. Por favor intenta nuevamente.',
        alertTime: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleClose() {
    if (hasTrackedFlowStartRef.current && !tracking.hasSubmitted) {
      tracking.trackFlowExited('back');
    }

    form.reset({
      date: new Date().toISOString().split('T')[0],
      levelId: '',
      contextId: '',
    });
    setCurrentStep('form');
    setSearchText('');
    setSelectedContextId(null);
    setAbsentStudentIds(new Set());
    hasTrackedFlowStartRef.current = false;
    tracking.resetTracking();
    onOpenChange(false);
  }

  function handleBack() {
    if (isEditMode) return;

    if (currentStep === 'contextDetail') {
      if (hasTrackedFlowStartRef.current && !tracking.hasSubmitted) {
        tracking.trackFlowExited('back');
      }
      setCurrentStep('form');
      setSelectedContextId(null);
      hasTrackedFlowStartRef.current = false;
      tracking.resetTracking();
    }
  }

  return {
    currentStep,
    setCurrentStep,
    searchText,
    setSearchText,
    selectedContextId,
    absentStudentIds,
    isProcessing,
    isEditMode,
    isLoadingSession: isLoadingSession || isLoadingFullClassroom,
    isLoadingRecords,
    isLoadingLevelConfig,
    existingSession,
    levels,
    contexts,
    availableStudents,
    evaluationPeriods,
    selectedContext,
    selectedLevel,
    contextType: attendanceContextType,
    hasAttendanceConfig,
    isLoadingLevels,
    isLoadingContexts,
    isLoadingStudents,
    form,
    handleContextSelect,
    handleRecordingComplete,
    toggleStudentAbsence,
    handleRegisterAttendance,
    handleClose,
    handleBack,
    trackAiRecordingStarted: tracking.trackAiRecordingStarted,
  };
}
