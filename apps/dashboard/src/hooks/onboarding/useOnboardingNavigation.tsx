import { useMemo } from 'react';
import { useOnboardingState } from './useOnboardingState';
import { useOnboardingSegments, type OnboardingSegment } from './useOnboardingSegments';
import type { NavItemKey, MainNavConfig, ConfigurationNavConfig } from '../../components/nav-section/vertical/types';
import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';

export function useOnboardingNavigation() {
  const { segments } = useOnboardingSegments();
  const { onboardingState } = useOnboardingState();

  const isOnboardingActive = Boolean(onboardingState?.show_onboarding_in_nav);
  const isSetupConfirmed = Boolean(onboardingState?.setup_confirmed);

  const getEnabledNavKeys = useMemo(() => {
    if (!segments) return new Set<NavItemKey>();

    const enabledKeys = new Set<NavItemKey>();

    enabledKeys.add('onboarding');
    enabledKeys.add('users');
    enabledKeys.add('institutionData');

    segments.forEach((segment) => {
      segment.tasks.forEach((task) => {
        if (task.navItemKey && !task.isDisabled && !segment.isDisabled) {
          enabledKeys.add(task.navItemKey as NavItemKey);
        }
      });
    });

    if (areFinancialRequirementsMet(segments)) {
      enabledKeys.add('collections');
      enabledKeys.add('delinquency');
      enabledKeys.add('payments');
      enabledKeys.add('income');
    }

    return enabledKeys;
  }, [segments]);

  function createNavFilter<T extends MainNavConfig | ConfigurationNavConfig>(navItems: T): T {
    if (!isOnboardingActive || isSetupConfirmed) return navItems;

    const filteredConfig = {} as T;

    Object.keys(navItems).forEach((sectionKey) => {
      const section = sectionKey as keyof T;
      const items = navItems[section] as Array<{ key: NavItemKey; disabled?: boolean }>;

      const filteredItems = items.map((item) => {
        if (getEnabledNavKeys.has(item.key)) {
          return item;
        }
        return { ...item, disabled: true };
      });

      filteredConfig[section] = filteredItems as T[keyof T];
    });

    return filteredConfig;
  }

  function filterMainNavItems(mainNavItems: MainNavConfig): MainNavConfig {
    return createNavFilter(mainNavItems);
  }

  function filterConfigNavItems(configNavItems: ConfigurationNavConfig): ConfigurationNavConfig {
    return createNavFilter(configNavItems);
  }

  const shouldHideManualPaymentButton = useMemo(() => {
    if (!isOnboardingActive || isSetupConfirmed) {
      return false;
    }

    return !areFinancialRequirementsMet(segments);
  }, [isOnboardingActive, isSetupConfirmed, segments]);

  const isNavItemBlocked = (navItemKey: NavItemKey): boolean => {
    if (!isOnboardingActive || isSetupConfirmed) {
      return false;
    }

    return !getEnabledNavKeys.has(navItemKey);
  };

  return {
    filterMainNavItems,
    filterConfigNavItems,
    shouldHideManualPaymentButton,
    isNavItemBlocked,
  };
}

function areFinancialRequirementsMet(segments: OnboardingSegment[] | undefined): boolean {
  if (!segments) return false;

  const requiredTaskIds = [
    OnboardingTaskId.BankAccounts,
    OnboardingTaskId.FiscalEntities,
    OnboardingTaskId.Students,
    OnboardingTaskId.CreateConcepts,
    OnboardingTaskId.AssignConcepts,
  ];

  const allTasks = segments.flatMap((segment) => segment.tasks);

  return requiredTaskIds.every((taskId) => {
    const task = allTasks.find((t) => t.id === taskId);
    return task?.status === OnboardingTaskStatus.Completed;
  });
}
