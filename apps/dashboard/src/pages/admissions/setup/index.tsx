import { useState } from 'react';
import { AdmissionSetupProvider } from '/src/components/admissions/setup/context/admission-setup-provider';
import { useAdmissionSetup } from '/src/components/admissions/setup/context/admission-setup-context';
import { FirstStepContent } from '/src/components/admissions/setup/steps/first-step';
import { SecondStepContent } from '/src/components/admissions/setup/steps/second-step';
import { ThirdStepContent } from '/src/components/admissions/setup/steps/third-step';
import { FourthStepContent } from '/src/components/admissions/setup/steps/fourth-step';
import { PreparingStep } from '/src/components/admissions/setup/steps/preparing-step';
import { PublishingStep } from '/src/components/admissions/setup/steps/publishing-step';
import { ProcessConfigurationContainer } from '/src/components/admissions/setup/admission-steps/process-configuration';
import { ExitConfirmationDialog } from '/src/components/admissions/setup/dialogs/exit-confirmation-dialog';
import { DrawerIcon } from '/src/components/admissions/icons';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { ConfigurationHeader } from '/src/components/admissions/setup/shared/configuration';

function SetupContent() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const router = useRouter();

  const { data: schoolSteps, isPending: isLoading } = api.admissions.getSchoolSteps.useQuery(
    { schoolId },
    { enabled: !!schoolId }
  );

  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const {
    currentStep,
    totalSteps,
    showExitConfirmation,
    showConfiguration,
    goToStep,
    hideExitDialog,
    showExitDialog,
    goToConfiguration,
  } = useAdmissionSetup();

  useEffect(() => {
    if (!router.isReady) return;

    const { step, config } = router.query;

    if (!currentStep && !showConfiguration && !showIntroDialog) {
      if (config === 'true') {
        goToConfiguration();
      } else if (step && typeof step === 'string') {
        const stepNumber = parseInt(step, 10);
        if (stepNumber >= 1 && stepNumber <= totalSteps) {
          goToStep(stepNumber);
        }
      }
    }
  }, [
    router.isReady,
    router.query,
    currentStep,
    showConfiguration,
    showIntroDialog,
    goToStep,
    goToConfiguration,
    totalSteps,
  ]);

  useEffect(() => {
    if (schoolSteps && schoolSteps.length > 0 && !showConfiguration) {
      goToConfiguration();
      setShowIntroDialog(false);
    }
  }, [schoolSteps, goToConfiguration, showConfiguration]);

  useEffect(() => {
    if (
      !currentStep &&
      !showConfiguration &&
      router.isReady &&
      !router.query.step &&
      !router.query.config &&
      !showIntroDialog
    ) {
      goToStep(1);
    }
  }, [currentStep, goToStep, showConfiguration, router.isReady, router.query, showIntroDialog]);

  useEffect(() => {
    function handlePopState() {
      if (showIntroDialog) {
        setShowIntroDialog(false);
        router.push('/admissions');
        return;
      }

      if (showConfiguration) {
        showExitDialog();
        return;
      }

      if (currentStep === 1) {
        showExitDialog();
      } else if (currentStep && currentStep > 1) {
        goToStep(currentStep - 1);
      } else {
        showExitDialog();
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, showIntroDialog, showConfiguration, showExitDialog, goToStep, router]);

  useEffect(() => {
    if (!router.isReady || showIntroDialog) return;

    const currentQuery = router.query;
    let shouldUpdate = false;
    let newUrl = '/admissions/setup';

    if (currentStep) {
      newUrl = `/admissions/setup?step=${currentStep}`;
      shouldUpdate = currentQuery.step !== currentStep.toString() || !!currentQuery.config;
    } else if (showConfiguration) {
      newUrl = '/admissions/setup?config=true';
      shouldUpdate = currentQuery.config !== 'true' || !!currentQuery.step;
    }

    if (shouldUpdate) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [currentStep, showConfiguration, router, showIntroDialog]);

  // function handleIntroNext() {
  //   setShowIntroDialog(false);
  // }

  // function handleIntroClose() {
  //   setShowIntroDialog(false);
  //   router.push('/admissions');
  // }

  function handleCloseSetup() {
    router.push('/admissions');
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return <FirstStepContent />;
      case 2:
        return <SecondStepContent />;
      case 3:
        return <ThirdStepContent />;
      case 4:
        return <FourthStepContent />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return <PreparingStep />;
  }

  const progress = currentStep ? (currentStep / totalSteps) * 100 : 100;

  return (
    <div className="font-lota antialiased">
      {/* TODO: Enable in the future
      <IntroDialog
        isOpen={showIntroDialog && !showExitConfirmation}
        onClose={handleIntroClose}
        onNext={handleIntroNext}
      />
      */}

      <ConfigurationHeader
        title={
          <div className="flex items-center gap-2">
            <DrawerIcon />
            <span className="text-sm font-semibold text-neutral-900">Configuración del proceso de admisión</span>
          </div>
        }
        onClose={showExitDialog}
        progress={!showConfiguration && currentStep ? progress : undefined}
      />

      {currentStep && !showConfiguration && !showIntroDialog ? (
        <div className="flex-1 overflow-y-auto px-6">{renderStepContent()}</div>
      ) : null}

      {showConfiguration && !showIntroDialog ? <ProcessConfigurationContainer /> : null}

      <PreparingStep />
      <PublishingStep />

      <ExitConfirmationDialog
        isOpen={showExitConfirmation}
        onExitWithoutSaving={handleCloseSetup}
        onContinueEditing={hideExitDialog}
        context={showConfiguration ? 'configuration' : 'setup'}
      />
    </div>
  );
}

export default function SetupPage() {
  return (
    <AdmissionSetupProvider>
      <SetupContent />
    </AdmissionSetupProvider>
  );
}

SetupPage.auth = true;
