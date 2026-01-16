import { useMemo } from 'react';
import { ONBOARDING_SEGMENTS_CONFIG, type OnboardingTaskConfig } from '../../constants/onboardingSegments';
import { useGetPermissions, useGetMembership } from '../../guards/AuthGuard';
import { useOnboardingTaskCompletion } from './useOnboardingTask';
import type { Membership } from '@cometa/trpc/src/types';
import { OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';

export type OnboardingTask = {
  id: string;
  title: string;
  description?: string;
  status: OnboardingTaskStatus;
  path?: string;
  navItemKey?: string;
  isDisabled?: boolean;
  disabledReason?: string;
};

export type OnboardingSegment = {
  id: string;
  title: string;
  isActive: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  tasks: OnboardingTask[];
};

export function useOnboardingSegments() {
  const permissions = useGetPermissions();
  const membership = useGetMembership();
  const { getTaskStatus } = useOnboardingTaskCompletion();

  const isSegmentCompleted = (segmentId: string, segments: OnboardingSegment[]): boolean => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return false;

    return segment.tasks.every((task) => task.status === OnboardingTaskStatus.Completed);
  };

  const getTaskDisabledState = (taskConfig: OnboardingTaskConfig): { isDisabled: boolean; disabledReason?: string } => {
    if (taskConfig.requiredMemberships?.length) {
      const hasRequiredMembership = taskConfig.requiredMemberships.includes(membership);
      if (!hasRequiredMembership) {
        return {
          isDisabled: true,
          disabledReason: taskConfig.disabledReason || 'No tienes los permisos necesarios para esta tarea',
        };
      }
    }
    if (taskConfig.requiredPermissions?.length) {
      const hasRequiredPermission = taskConfig.requiredPermissions.some(
        (permission) => permissions[permission as keyof Membership]
      );
      if (!hasRequiredPermission) {
        return {
          isDisabled: true,
          disabledReason: taskConfig.disabledReason || 'No tienes los permisos necesarios para esta tarea',
        };
      }
    }

    return { isDisabled: false };
  };

  const getSegmentDisabledState = (
    segmentId: string,
    segments: OnboardingSegment[]
  ): { isDisabled: boolean; disabledReason?: string } => {
    const segmentDependencies: Record<string, string[]> = {
      documentation: [],
      'students-levels': [],
      concepts: ['students-levels'],
      scholarships: ['students-levels'],
    };

    const taskDependencies: Record<string, string[]> = {
      concepts: ['bank-accounts', 'fiscal-entities'],
      scholarships: ['bank-accounts', 'fiscal-entities'],
    };

    const segmentNames = {
      documentation: 'documentación',
      'students-levels': 'estudiantes y niveles',
      concepts: 'conceptos',
      scholarships: 'becas',
    };

    const taskNames: Record<string, string> = {
      'bank-accounts': 'cuentas bancarias',
      'fiscal-entities': 'entidades fiscales',
    };

    const dependencies = segmentDependencies[segmentId] || [];

    for (const dependencyId of dependencies) {
      if (!isSegmentCompleted(dependencyId, segments)) {
        return {
          isDisabled: true,
          disabledReason: `Debes completar ${
            segmentNames[dependencyId as keyof typeof segmentNames]
          } para acceder a esta sección`,
        };
      }
    }

    const requiredTasks = taskDependencies[segmentId] || [];
    for (const taskId of requiredTasks) {
      const task = segments.flatMap((segment) => segment.tasks).find((t) => t.id === taskId);

      if (task && task.status !== OnboardingTaskStatus.Completed) {
        const missingTasks = requiredTasks
          .map((id) => {
            const t = segments.flatMap((s) => s.tasks).find((task) => task.id === id);
            return t && t.status !== OnboardingTaskStatus.Completed ? taskNames[id] : null;
          })
          .filter(Boolean);

        if (missingTasks.length > 0) {
          const tasksList = missingTasks.join(' y ');
          return {
            isDisabled: true,
            disabledReason: `Debes completar ${tasksList} para acceder a esta sección`,
          };
        }
      }
    }

    return { isDisabled: false };
  };

  const initialSegments: OnboardingSegment[] = useMemo(
    () =>
      ONBOARDING_SEGMENTS_CONFIG.map((segmentConfig) => {
        const tasks = segmentConfig.tasks.map((taskConfig) => {
          const taskDisabledState = getTaskDisabledState(taskConfig);

          return {
            id: taskConfig.id,
            title: taskConfig.title,
            description: taskConfig.description,
            status: getTaskStatus(taskConfig.id),
            path: taskConfig.path,
            navItemKey: taskConfig.navItemKey,
            isDisabled: taskDisabledState.isDisabled,
            disabledReason: taskDisabledState.disabledReason,
          };
        });

        return {
          id: segmentConfig.id,
          title: segmentConfig.title,
          isActive: true,
          isDisabled: false,
          tasks,
        };
      }),
    [getTaskStatus, permissions, membership]
  );

  const segments: OnboardingSegment[] = initialSegments.map((segment) => {
    const disabledState = getSegmentDisabledState(segment.id, initialSegments);

    const taskLevelDependencies: Record<string, string> = {
      students: 'academic-levels',
    };

    const taskNames: Record<string, string> = {
      'academic-levels': 'estructura de niveles',
    };

    const tasksWithDependencies = segment.tasks.map((task) => {
      const dependencyTaskId = taskLevelDependencies[task.id];
      if (dependencyTaskId) {
        const dependencyTask = initialSegments.flatMap((s) => s.tasks).find((t) => t.id === dependencyTaskId);

        if (dependencyTask && dependencyTask.status !== OnboardingTaskStatus.Completed) {
          return {
            ...task,
            isDisabled: true,
            disabledReason: `Debes completar ${taskNames[dependencyTaskId]} para acceder a esta tarea`,
          };
        }
      }
      return task;
    });

    return {
      ...segment,
      isActive: !disabledState.isDisabled,
      isDisabled: disabledState.isDisabled,
      disabledReason: disabledState.disabledReason,
      tasks: tasksWithDependencies,
    };
  });

  const countTasksByStatus = (tasks: OnboardingTask[], status: OnboardingTaskStatus) =>
    tasks.filter((task) => task.status === status).length;

  const getTaskCompletionStats = (segmentId: string) => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return { completed: 0, total: 0 };

    const completed = countTasksByStatus(segment.tasks, OnboardingTaskStatus.Completed);
    const total = segment.tasks.length;

    return { completed, total };
  };

  const getTotalProgress = () => {
    if (!segments) return { completed: 0, total: 0, percentage: 0 };

    let totalCompleted = 0;
    let totalTasks = 0;

    segments.forEach((segment) => {
      totalTasks += segment.tasks.length;
      totalCompleted += countTasksByStatus(segment.tasks, OnboardingTaskStatus.Completed);
    });

    const percentage = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    return { completed: totalCompleted, total: totalTasks, percentage };
  };

  const getErrorCount = () => {
    if (!segments) return 0;

    let errorCount = 0;
    segments.forEach((segment) => {
      errorCount += countTasksByStatus(segment.tasks, OnboardingTaskStatus.Error);
    });

    return errorCount;
  };

  const isOnboardingCompleted = () => {
    if (!segments) return false;

    return segments.every((segment) => segment.tasks.every((task) => task.status === OnboardingTaskStatus.Completed));
  };

  return {
    segments,
    getTaskCompletionStats,
    getTotalProgress,
    getErrorCount,
    isOnboardingCompleted,
  };
}
