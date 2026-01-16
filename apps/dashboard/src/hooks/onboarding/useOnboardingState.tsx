import { api } from '../../utils/api';
import { useSelectedSchoolId, useSelectedSchool } from '../../guards/AuthGuard';
import type { OnboardingState, OnboardingTaskStatus, OnboardingTaskId } from '@cometa/trpc/src/bot/types';
import { Status2B3Enum } from '@cometa/trpc/src/types';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import * as Sentry from '@sentry/nextjs';
import { keepPreviousData } from '@tanstack/react-query';

const FLAG_KEY = 'enable_welcome_page';

export function useOnboardingState(): {
  onboardingState: OnboardingState | undefined;
  isLoading: boolean;
  updateOnboardingState: (state: {
    welcome_incomplete?: boolean;
    show_onboarding_in_nav?: boolean;
    setup_confirmed?: boolean;
    tasks?: Record<string, OnboardingTaskStatus>;
  }) => Promise<void>;
  updateTaskStatus: (taskId: OnboardingTaskId, status: OnboardingTaskStatus) => Promise<void>;
  isUpdating: boolean;
} {
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching(FLAG_KEY);
  const schoolId: string | null = useSelectedSchoolId();
  const selectedSchool = useSelectedSchool();
  const utils = api.useUtils();

  const isOnboardingStateEnabled = selectedSchool?.status === Status2B3Enum.Onboarding && welcomePageFlag;

  const {
    data: onboardingEntities,
    isPending: isLoading,
    refetch,
  } = api.bot.getOnboarding.useQuery(
    { schoolId: schoolId ?? '' },
    {
      enabled: !!schoolId && isOnboardingStateEnabled,
      placeholderData: keepPreviousData,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const patchOnboardingMutation = api.bot.patchOnboarding.useMutation();

  const updateOnboardingState = async (state: {
    welcome_incomplete?: boolean;
    show_onboarding_in_nav?: boolean;
    setup_confirmed?: boolean;
    tasks?: Record<string, OnboardingTaskStatus>;
  }) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    let currentEntities = onboardingEntities;
    if (!currentEntities || currentEntities.length === 0) {
      const refetchResult = await refetch();
      currentEntities = refetchResult.data;
    }

    const onboardingId = currentEntities?.[0]?.id;
    if (!onboardingId) {
      throw new Error('No onboarding entity found');
    }

    await patchOnboardingMutation.mutateAsync({
      onboardingId,
      data: { state },
    });

    await utils.bot.getOnboarding.invalidate();
  };

  const updateTaskStatus = async (taskId: OnboardingTaskId, status: OnboardingTaskStatus) => {
    let currentEntities = onboardingEntities;
    if (!currentEntities || currentEntities.length === 0) {
      const refetchResult = await refetch();
      currentEntities = refetchResult.data;
    }

    const onboardingId = currentEntities?.[0]?.id;
    if (!onboardingId || !currentEntities) {
      Sentry.captureException(Error('No onboarding id provided when updating task'));
      return;
    }

    const currentTasks = currentEntities[0]?.state?.tasks || {};
    const updatedTasks = { ...currentTasks, [taskId]: status };

    await patchOnboardingMutation.mutateAsync({
      onboardingId,
      data: { state: { tasks: updatedTasks } },
    });

    await utils.bot.getOnboarding.invalidate();
  };

  const onboardingServiceState: OnboardingState | undefined = onboardingEntities?.[0]?.state;

  const onboardingState: OnboardingState | undefined = isOnboardingStateEnabled ? onboardingServiceState : undefined;

  return {
    onboardingState,
    isLoading,
    updateOnboardingState,
    updateTaskStatus,
    isUpdating: patchOnboardingMutation.isPending,
  };
}
