import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import { useOnboardingState } from './useOnboardingState';

export function useOnboardingTaskCompletion() {
  const { onboardingState } = useOnboardingState();

  const taskStatuses = onboardingState?.tasks || {};

  const getTaskStatus = (taskId: OnboardingTaskId): OnboardingTaskStatus =>
    taskStatuses[taskId] ?? OnboardingTaskStatus.Pending;

  return {
    getTaskStatus,
    taskStatuses,
  };
}
