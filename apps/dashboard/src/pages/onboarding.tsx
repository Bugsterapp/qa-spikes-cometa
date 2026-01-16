import { useState } from 'react';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import Layout from '../components/layouts';
import { TrackEvents } from '../constants/events';
import useSendPageViewedEvent from '../hooks/useSendPageViewedEvent';
import { useOnboardingState } from '../hooks/onboarding/useOnboardingState';
import { useOnboardingSegments } from '../hooks/onboarding/useOnboardingSegments';
import { useOnboardingTaskTracking } from '../hooks/onboarding/useOnboardingTaskTracking';
import { OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import { cn } from '../utils/cn';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import {
  StatusBadge,
  type StatusBadgeVariant,
  OnboardingCompletionFloater,
  OnboardingConfirmationDialog,
  OnboardingSuccessBanner,
  OnboardingErrorBanner,
} from '../components/onboarding';
import { Chip } from '@cometa/recreo';
import ChevronRightIcon from '../../public/assets/icons/ic_chevron_right.svg';
import { Tooltip } from '../components/atoms/Tooltip';
import { PATH_PORTAL } from '../routes/paths';
import { api } from '../utils/api';
import { useSelectedSchool } from '../guards/AuthGuard';

OnboardingPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Configuración inicial">
      <div className="max-h-none">{page}</div>
    </Layout>
  );
};

function OnboardingPage() {
  const router = useRouter();
  const { updateOnboardingState, onboardingState, isLoading } = useOnboardingState();

  const { segments, getTaskCompletionStats, getTotalProgress, getErrorCount, isOnboardingCompleted } =
    useOnboardingSegments();

  const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState(false);

  const showOnboardingInNav = onboardingState?.show_onboarding_in_nav ?? false;

  useSendPageViewedEvent(TrackEvents.onboarding.pageViewed);

  const selectedSchool = useSelectedSchool();

  useOnboardingTaskTracking(selectedSchool);

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const activeSchoolCycle = schoolCycles?.find((cycle) => cycle.is_active);

  const { data: studentsResume } = api.schools.schoolsResume.useQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle: activeSchoolCycle?.id,
    },
    { enabled: !!selectedSchool?.id && !!activeSchoolCycle && isConfirmationDialogVisible }
  );

  const { data: conceptsResponse } = api.schools.schoolsConceptsList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      page_size: 1,
      school_cycles: activeSchoolCycle?.id ? [activeSchoolCycle.id] : undefined,
    },
    {
      enabled: !!selectedSchool?.id && !!activeSchoolCycle && isConfirmationDialogVisible,
      getNextPageParam: () => undefined,
    }
  );

  const { data: scholarshipsResponse } = api.schools.schoolsScholarshipsList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle: activeSchoolCycle?.id || null,
    },
    {
      enabled: !!selectedSchool?.id && !!activeSchoolCycle && isConfirmationDialogVisible,
      getNextPageParam: () => undefined,
    }
  );

  const studentsCount = studentsResume?.active ?? 0;
  const conceptsCount = (conceptsResponse?.pages[0] as any)?.count ?? 0;
  const scholarshipsCount = scholarshipsResponse?.pages[0]?.count ?? 0;

  const handleTaskClick = (task: { path?: string; isDisabled?: boolean }, segment: { isDisabled: boolean }) => {
    if (task.isDisabled || segment.isDisabled || !task.path) return;
    router.push(task.path);
  };

  const getTaskChipProps = (status: OnboardingTaskStatus) => {
    switch (status) {
      case OnboardingTaskStatus.InReview:
        return { variant: 'warning' as const, text: 'En revisión' };
      case OnboardingTaskStatus.Error:
        return { variant: 'error' as const, text: 'Error' };
      default:
        return null;
    }
  };

  const getSegmentHeaderStatus = (segment: {
    id: string;
    tasks: { status: OnboardingTaskStatus; isDisabled?: boolean }[];
  }): StatusBadgeVariant | null => {
    const { completed, total } = getTaskCompletionStats(segment.id);

    if (completed === total && total > 0) {
      return 'completed';
    }

    const hasError = segment.tasks.some((task) => task.status === OnboardingTaskStatus.Error);
    const hasInReview = segment.tasks.some((task) => task.status === OnboardingTaskStatus.InReview);

    if (hasError) {
      return 'error';
    }

    if (hasInReview) {
      return 'in-review';
    }

    return null;
  };

  const { percentage: progressPercentage } = getTotalProgress();
  const isCompleted = isOnboardingCompleted();
  const isFinalized = onboardingState?.setup_confirmed ?? false;
  const errorCount = getErrorCount();

  const handleFinalize = () => {
    setIsConfirmationDialogVisible(true);
  };

  const handleConfirmInformation = async () => {
    try {
      setIsConfirmationDialogVisible(false);
      await updateOnboardingState({ setup_confirmed: true });
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const handleCancelConfirmation = () => {
    setIsConfirmationDialogVisible(false);
  };

  const handleCloseDialog = () => {
    setIsConfirmationDialogVisible(false);
  };

  if (!segments || isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 font-lota">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showOnboardingInNav) {
    if (globalThis.window !== undefined) {
      router.replace(PATH_PORTAL.charge.root);
    }
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-lota">Acceso No Disponible</h2>
          <p className="text-gray-600 font-lota">No se puede acceder a esta página en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fb] min-h-screen flex items-start justify-center px-[45px] py-10">
      <div className="w-full max-w-[618px] flex flex-col gap-[30px] items-center">
        <div className="w-full max-w-[518px] flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-semibold text-[24px] leading-[32px] text-[#22283a]">
              {isFinalized ? '¡Te damos la bienvenida!' : '¡Te damos la bienvenida, configura tu colegio!'}
            </h1>
            {!isFinalized && (
              <p className="text-[18px] leading-[28px] text-[#697086]">
                Completa la información solicitada para finalizar el proceso y comenzar a operar con Cometa.
              </p>
            )}
          </div>
        </div>

        {isFinalized && (
          <div className="w-full max-w-[618px]">
            <OnboardingSuccessBanner />
          </div>
        )}

        {!isFinalized && (
          <div className="w-full max-w-[518px]">
            <div className="bg-[#d0d8e9] h-2.5 rounded-full relative overflow-hidden">
              <div
                className="absolute bg-[#af7bff] h-[26px] left-0 rounded-full top-[-8px] transition-all
                duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {!isFinalized && errorCount > 0 && (
          <div className="w-full max-w-[618px]">
            <OnboardingErrorBanner errorCount={errorCount} />
          </div>
        )}

        <div className="w-full flex flex-col gap-5">
          <Accordion type="multiple" className="w-full space-y-5">
            {segments.map((segment) => {
              const segmentToShow = isFinalized
                ? {
                    ...segment,
                    isDisabled: false,
                    tasks: segment.tasks.map((task) => ({ ...task, status: OnboardingTaskStatus.Completed })),
                  }
                : segment;

              const { completed, total } = isFinalized
                ? { completed: segmentToShow.tasks.length, total: segmentToShow.tasks.length }
                : getTaskCompletionStats(segment.id);
              const headerStatus = isFinalized ? 'completed' : getSegmentHeaderStatus(segment);

              const accordionItem = (
                <AccordionItem
                  key={segment.id}
                  value={segmentToShow.isDisabled ? '' : segment.id}
                  variant="onboarding"
                  className={cn(segmentToShow.isDisabled && 'opacity-40')}
                >
                  <AccordionTrigger
                    variant="onboarding"
                    className={cn(
                      '!flex-none !w-full',
                      segmentToShow.isDisabled && 'cursor-not-allowed pointer-events-none'
                    )}
                  >
                    <div className="flex justify-between items-center flex-1">
                      <div className="flex items-center gap-4">
                        {headerStatus && <StatusBadge variant={headerStatus} />}
                        <h3
                          className={cn(
                            'font-semibold leading-[28px] text-[#22283a]',
                            segment.title === 'Becas' ? 'text-[18px]' : 'text-[20px]'
                          )}
                        >
                          {segment.title}
                        </h3>
                      </div>
                      <div className="text-[14px] leading-[20px] text-[#22283a]">
                        {completed}/{total} completado
                      </div>
                    </div>
                  </AccordionTrigger>
                  {!segmentToShow.isDisabled && (
                    <AccordionContent variant="onboarding">
                      {segmentToShow.tasks.map((task) => {
                        const chipProps = getTaskChipProps(task.status);
                        const isTaskDisabled = (task.isDisabled ?? false) || segmentToShow.isDisabled;

                        const taskItem = (
                          <button
                            key={task.id}
                            type="button"
                            disabled={isTaskDisabled}
                            className={cn(
                              'px-6 py-4 flex items-center justify-between bg-white transition-colors w-full text-left',
                              'duration-200 mb-1.5 last:mb-0',
                              isTaskDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#f8f9fb] cursor-pointer'
                            )}
                            onClick={() => handleTaskClick(task, segment)}
                          >
                            <div className="flex flex-col gap-2.5 flex-1">
                              <div className="flex items-center gap-5">
                                <StatusBadge
                                  variant={task.status === OnboardingTaskStatus.Pending ? 'pending' : task.status}
                                />
                                <div className="flex items-center gap-2.5">
                                  <span className="font-semibold text-[16px] leading-none text-[#22283a]">
                                    {task.title}
                                  </span>
                                  {chipProps && <Chip variant={chipProps.variant}>{chipProps.text}</Chip>}
                                </div>
                              </div>
                              {task.description && (
                                <div className="pl-10">
                                  <span className="text-[14px] leading-none text-[#697086]">{task.description}</span>
                                </div>
                              )}
                            </div>
                            <div className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center flex-shrink-0">
                              <ChevronRightIcon className="w-4 h-4 text-[#22283a]" />
                            </div>
                          </button>
                        );

                        return isTaskDisabled ? (
                          <Tooltip key={task.id} message={task.disabledReason} disableHover={false} fullWidth>
                            {taskItem}
                          </Tooltip>
                        ) : (
                          taskItem
                        );
                      })}
                    </AccordionContent>
                  )}
                </AccordionItem>
              );

              return segmentToShow.isDisabled ? (
                <Tooltip key={segment.id} message={segment.disabledReason} disableHover={false} fullWidth>
                  {accordionItem}
                </Tooltip>
              ) : (
                accordionItem
              );
            })}
          </Accordion>
        </div>

        {isCompleted && <div className="w-full h-[90px] flex justify-center" />}
      </div>

      <OnboardingCompletionFloater isVisible={isCompleted && !isFinalized} onFinalize={handleFinalize} />

      <OnboardingConfirmationDialog
        isVisible={isConfirmationDialogVisible}
        onConfirm={handleConfirmInformation}
        onCancel={handleCancelConfirmation}
        onClose={handleCloseDialog}
        studentsCount={studentsCount}
        conceptsCount={conceptsCount}
        scholarshipsCount={scholarshipsCount}
      />
    </div>
  );
}

OnboardingPage.auth = true;

export default OnboardingPage;
