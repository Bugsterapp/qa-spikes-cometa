import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import { DashboardSchool, Status2B3Enum } from '@cometa/trpc';
import { useOnboardingTaskCompletion } from './useOnboardingTask';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';

type UseOnboardingTaskPreLoadProps = {
  taskId: OnboardingTaskId;
  selectedSchool?: DashboardSchool;
};

const FLAG_KEY = 'enable_welcome_page';

export function useOnboardingTaskPreLoad({ taskId, selectedSchool }: UseOnboardingTaskPreLoadProps) {
  const { getTaskStatus } = useOnboardingTaskCompletion();
  const taskStatus = getTaskStatus(taskId);
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching(FLAG_KEY);

  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const isTaskPending = taskStatus === OnboardingTaskStatus.Pending;

  const isFirstTimeOnboarding = isOnboardingSchool && welcomePageFlag && isTaskPending;
  const shouldPreLoadSettings = !isFirstTimeOnboarding;

  return {
    shouldPreLoadSettings,
    isFirstTimeOnboarding,
    taskStatus,
  };
}
