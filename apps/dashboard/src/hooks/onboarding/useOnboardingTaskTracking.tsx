import { DashboardSchool, Status2B3Enum } from '@cometa/trpc';
import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useMemo, useRef } from 'react';
import { api } from '../../utils/api';
import {
  getAcademicLevelsStatus,
  getAssignConceptsStatus,
  getAssignScholarshipsStatus,
  getBankAccountsStatus,
  getConceptsStatus,
  getFiscalEntitiesStatus,
  getLegalStatus,
  getScholarshipsStatus,
  getStudentsStatus,
} from '../../utils/onboarding/taskStatusCalculators';
import { useOnboardingState } from './useOnboardingState';
import { useOnboardingTaskCompletion } from './useOnboardingTask';

const queryOptions = {
  retry: false,
};

export function useOnboardingTaskTracking(selectedSchool?: DashboardSchool) {
  const { updateTaskStatus } = useOnboardingState();
  const { getTaskStatus } = useOnboardingTaskCompletion();

  const updateTaskStatusRef = useRef(updateTaskStatus);
  const getTaskStatusRef = useRef(getTaskStatus);

  updateTaskStatusRef.current = updateTaskStatus;
  getTaskStatusRef.current = getTaskStatus;

  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const schoolId = selectedSchool?.id ?? '';
  const enabled = !!schoolId && isOnboardingSchool;

  const isTaskCompleted = (taskId: OnboardingTaskId) => getTaskStatus(taskId) === OnboardingTaskStatus.Completed;

  const { data: legalDocuments, isPending: isLoadingLegal } = api.bot.getLegalDocuments.useQuery(
    { schoolId },
    { ...queryOptions, enabled: enabled && !isTaskCompleted(OnboardingTaskId.Legal) }
  );

  const { data: bankAccountsData, isPending: isLoadingBankAccounts } = api.bot.getBankAccounts.useInfiniteQuery(
    { schoolId },
    {
      ...queryOptions,
      enabled: enabled && !isTaskCompleted(OnboardingTaskId.BankAccounts),
      getNextPageParam: (lastPage) => (lastPage?.next ? (lastPage.page_number + 1).toString() : undefined),
    }
  );

  const { data: fiscalEntities, isPending: isLoadingFiscalEntities } = api.bot.getFiscalEntities.useQuery(
    { schoolId },
    { ...queryOptions, enabled: enabled && !isTaskCompleted(OnboardingTaskId.FiscalEntities) }
  );

  const { data: studentsResume, isPending: isLoadingStudents } = api.schools.schoolsResume.useQuery(
    {
      school_id: schoolId,
      school_cycle: undefined,
    },
    { ...queryOptions, enabled: enabled && !isTaskCompleted(OnboardingTaskId.Students) }
  );

  const { data: levels, isPending: isLoadingLevels } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId },
    { ...queryOptions, enabled: enabled && !isTaskCompleted(OnboardingTaskId.AcademicLevels) }
  );

  const conceptsEnabled =
    enabled && (!isTaskCompleted(OnboardingTaskId.CreateConcepts) || !isTaskCompleted(OnboardingTaskId.AssignConcepts));

  const { data: conceptsResponse, isPending: isLoadingConcepts } = api.schools.schoolsConceptsList.useInfiniteQuery(
    {
      school_id: schoolId,
      page_size: 100,
    },
    {
      ...queryOptions,
      enabled: conceptsEnabled,
      getNextPageParam: () => undefined,
    }
  );

  const { data: scholarshipsResponse, isPending: isLoadingScholarships } =
    api.scholarships.listScholarships.useInfiniteQuery(
      {
        school_id: schoolId,
        page_size: 100,
      },
      {
        ...queryOptions,
        enabled: enabled && !isTaskCompleted(OnboardingTaskId.CreateScholarships),
        getNextPageParam: () => undefined,
      }
    );

  const { data: scholarshipAssignmentsResponse, isPending: isLoadingScholarshipAssignments } =
    api.schools.schoolsScholarshipsList.useInfiniteQuery(
      {
        school_id: schoolId,
      },
      {
        ...queryOptions,
        enabled: enabled && !isTaskCompleted(OnboardingTaskId.AssignScholarships),
        getNextPageParam: () => undefined,
      }
    );

  const bankAccounts = useMemo(
    () => bankAccountsData?.pages.flatMap((page) => page?.results ?? []) ?? [],
    [bankAccountsData]
  );

  const legalStatus = useMemo(() => getLegalStatus(legalDocuments, isLoadingLegal), [legalDocuments, isLoadingLegal]);

  const bankAccountsStatus = useMemo(
    () => getBankAccountsStatus(bankAccounts, isLoadingBankAccounts),
    [bankAccounts, isLoadingBankAccounts]
  );

  const fiscalEntitiesStatus = useMemo(
    () => getFiscalEntitiesStatus(fiscalEntities, isLoadingFiscalEntities),
    [fiscalEntities, isLoadingFiscalEntities]
  );

  const studentsStatus = useMemo(
    () => getStudentsStatus(studentsResume, isLoadingStudents),
    [studentsResume, isLoadingStudents]
  );

  const academicLevelsStatus = useMemo(
    () => getAcademicLevelsStatus(levels, isLoadingLevels),
    [levels, isLoadingLevels]
  );

  const conceptsStatus = useMemo(
    () => getConceptsStatus(conceptsResponse as { pages: unknown[] } | undefined, isLoadingConcepts),
    [conceptsResponse, isLoadingConcepts]
  );

  const assignConceptsStatus = useMemo(
    () => getAssignConceptsStatus(conceptsResponse as { pages: unknown[] } | undefined, isLoadingConcepts),
    [conceptsResponse, isLoadingConcepts]
  );

  const scholarshipsStatus = useMemo(
    () => getScholarshipsStatus(scholarshipsResponse as { pages: unknown[] } | undefined, isLoadingScholarships),
    [scholarshipsResponse, isLoadingScholarships]
  );

  const assignScholarshipsStatus = useMemo(
    () =>
      getAssignScholarshipsStatus(
        scholarshipAssignmentsResponse as { pages: unknown[] } | undefined,
        isLoadingScholarshipAssignments
      ),
    [scholarshipAssignmentsResponse, isLoadingScholarshipAssignments]
  );

  useEffect(() => {
    if (!isOnboardingSchool || !selectedSchool) return;

    let isCancelled = false;

    const getStatusUpdate = (
      taskId: OnboardingTaskId,
      newStatus: OnboardingTaskStatus | null
    ): { taskId: OnboardingTaskId; status: OnboardingTaskStatus } | null => {
      if (newStatus === null) return null;
      const currentStatus = getTaskStatusRef.current(taskId);
      return currentStatus === newStatus ? null : { taskId, status: newStatus };
    };

    const updateTaskStatuses = async () => {
      try {
        const updates = [
          getStatusUpdate(OnboardingTaskId.Legal, legalStatus),
          getStatusUpdate(OnboardingTaskId.BankAccounts, bankAccountsStatus),
          getStatusUpdate(OnboardingTaskId.FiscalEntities, fiscalEntitiesStatus),
          getStatusUpdate(OnboardingTaskId.Students, studentsStatus),
          getStatusUpdate(OnboardingTaskId.AcademicLevels, academicLevelsStatus),
          getStatusUpdate(OnboardingTaskId.CreateConcepts, conceptsStatus),
          getStatusUpdate(OnboardingTaskId.AssignConcepts, assignConceptsStatus),
          getStatusUpdate(OnboardingTaskId.CreateScholarships, scholarshipsStatus),
          getStatusUpdate(OnboardingTaskId.AssignScholarships, assignScholarshipsStatus),
        ].filter((update): update is { taskId: OnboardingTaskId; status: OnboardingTaskStatus } => update !== null);

        for (const update of updates) {
          if (isCancelled) return;
          await updateTaskStatusRef.current(update.taskId, update.status);
        }
      } catch (error) {
        if (isCancelled) return;
        Sentry.captureException(error, {
          tags: { feature: 'onboarding_task_tracking' },
          extra: { schoolId: selectedSchool.id },
        });
      }
    };

    updateTaskStatuses();

    return () => {
      isCancelled = true;
    };
  }, [
    isOnboardingSchool,
    selectedSchool,
    legalStatus,
    bankAccountsStatus,
    fiscalEntitiesStatus,
    studentsStatus,
    academicLevelsStatus,
    conceptsStatus,
    assignConceptsStatus,
    scholarshipsStatus,
    assignScholarshipsStatus,
  ]);

  return {
    isLoading:
      isLoadingLegal ||
      isLoadingBankAccounts ||
      isLoadingFiscalEntities ||
      isLoadingStudents ||
      isLoadingLevels ||
      isLoadingConcepts ||
      isLoadingScholarships ||
      isLoadingScholarshipAssignments,
  };
}
