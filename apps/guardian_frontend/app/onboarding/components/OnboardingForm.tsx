'use client';
import React from 'react';
import type { Session } from 'next-auth';
import OnboardingWelcome from './OnboardingWelcome';
import GuardianInformation from './GuardianInformation';
import { useOnboardingStore } from '../store/OnboardingStoreProvider';
import Stepper from './Stepper';
import Student from './Students';
import Invoicing from './Invoicing';
import OnboardingSuccess from './OnboardingSuccess';
import { OnboardingStageEnum } from '@cometa/trpc';
import { useSendEvent } from '~/hooks/useSendEvent';
import { useUTMAppRouter } from '~/app/hooks/useUTMAppRouter';

function calculateProgress(currentIndex: number, length: number) {
  if (length <= 1) {
    return 0;
  }
  return (currentIndex / (length - 1)) * 100;
}

const OnboardingForm = ({ session }: { session: Session }) => {
  const { nextStep, setFormData, step, setStep } = useOnboardingStore((state) => state);
  const sendEvent = useSendEvent();
  const router = useUTMAppRouter();
  const OnboardingSteps = [
    {
      step: 'welcome',
      onSubmit: (formData: any) => {
        sendEvent('Onboarding — onboarding started');
        setFormData(formData);
        nextStep();
      },
      props: {},
      Step: OnboardingWelcome,
      hideNavigation: true,
      stage: OnboardingStageEnum.PROFILE,
    },
    {
      step: 'profile',
      onSubmit: (formData: any) => {
        sendEvent('Onboarding — onboarding step 1 complete');
        setFormData(formData);
        if (session.user.dependents.length > 0) {
          nextStep();
        } else {
          setStep(step + 2);
        }
      },
      props: {
        session,
      },
      Step: GuardianInformation,
      stage: OnboardingStageEnum.PROFILE,
    },
    {
      step: 'students',
      onSubmit: () => {
        sendEvent('Onboarding — onboarding step 2.1 (personal data) complete');
        nextStep();
      },
      props: {},
      Step: Student,
      stage: OnboardingStageEnum.STUDENTS,
    },
    {
      step: 'invoicing',
      onSubmit: () => {
        nextStep();
      },
      props: {
        session,
      },
      Step: Invoicing,
      stage: OnboardingStageEnum.BILLING,
    },
    {
      step: 'completed',
      onSubmit: () => {
        sendEvent('Onboarding — onboarding complete');
        router.push(`/guardians/${session.user.hash}`);
      },
      props: {},
      Step: OnboardingSuccess,
      hideNavigation: true,
      stage: OnboardingStageEnum.COMPLETED,
    },
  ];

  React.useEffect(() => {
    const initialStep = OnboardingSteps.findIndex((step) => step.stage === session.user.onboarding_stage);

    setStep(initialStep);
  }, []);

  const FilteredStep = React.useMemo(
    () =>
      OnboardingSteps.filter((onboardingStep) => {
        if (session.user.dependents.length > 0) return true;
        return onboardingStep.stage !== OnboardingStageEnum.STUDENTS;
      }),
    [session.user.dependents]
  );

  const CurrentStep = FilteredStep[step];

  const currentIndex = calculateProgress(step, OnboardingSteps.length);

  return (
    <Stepper
      navigationVisible={'hideNavigation' in CurrentStep && CurrentStep.hideNavigation ? false : true}
      currentIndex={currentIndex}
      onClickBack={() => sendEvent('Onboarding — back button', { step_name: CurrentStep.stage, step_number: step })}
    >
      {/* @ts-ignore */}
      <CurrentStep.Step onSubmit={CurrentStep.onSubmit} {...CurrentStep.props} />
    </Stepper>
  );
};

export default OnboardingForm;
