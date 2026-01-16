import { ArrowRight } from 'lucide-react';
import { Button } from '@cometa/recreo/v2';
import { useAdmissionSetup } from './context/admission-setup-context';
import { AdmissionFormData } from './context/admission-setup-provider';

export function BackButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="light" onClick={onClick} disabled={disabled}>
      Atrás
    </Button>
  );
}

export function NextButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      Siguiente
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}

export function SkipButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      Omitir
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}

export function FinishButton({ onClick, shouldOmit = false }: { onClick: () => void; shouldOmit?: boolean }) {
  return (
    <Button onClick={onClick}>
      {shouldOmit ? 'Omitir' : 'Siguiente'}
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}

type StepContainerProps = {
  children: React.ReactNode;
  selectedCount?: number;
  showSkipWhenEmpty?: boolean;
  onFinish?: () => void;
};

export function StepContainer({ children, selectedCount = 0, showSkipWhenEmpty = true, onFinish }: StepContainerProps) {
  const { stepConfig, currentStep, totalSteps, goToStep } = useAdmissionSetup();

  if (!stepConfig || !currentStep) return null;

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  function handleBack() {
    if (currentStep && currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  function handleNext() {
    if (currentStep) {
      goToStep(currentStep + 1);
    }
  }

  function handleSkip() {
    if (currentStep) {
      goToStep(currentStep + 1);
    }
  }

  return (
    <section className="max-w-2xl mx-auto pt-16 pb-10 space-y-10">
      <StepHeader title={stepConfig.title} subtitle={stepConfig.subtitle} />

      <div className="space-y-2">{children}</div>

      <StepNavigation
        onBack={isFirstStep ? undefined : handleBack}
        onNext={isLastStep ? undefined : handleNext}
        onSkip={handleSkip}
        onFinish={onFinish}
        selectedCount={selectedCount}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        showSkipWhenEmpty={showSkipWhenEmpty}
      />
    </section>
  );
}

type StepHeaderProps = {
  title: string;
  subtitle: string;
};

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
      <p className="text-lg text-neutral-700">{subtitle}</p>
    </div>
  );
}

type StepNavigationProps = {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  onFinish?: () => void;
  selectedCount?: number;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  showSkipWhenEmpty?: boolean;
};

export function StepNavigation({
  onBack,
  onNext,
  onSkip,
  onFinish,
  selectedCount = 0,
  isFirstStep = false,
  isLastStep = false,
  showSkipWhenEmpty = true,
}: StepNavigationProps) {
  function renderLeftButton() {
    if (isFirstStep) {
      return null;
    }

    return onBack ? <BackButton onClick={onBack} /> : null;
  }

  function renderRightButton() {
    if (isLastStep) {
      const shouldOmit = selectedCount === 0 && showSkipWhenEmpty;
      return onFinish ? <FinishButton onClick={onFinish} shouldOmit={shouldOmit} /> : null;
    }

    if (selectedCount === 0 && showSkipWhenEmpty && onSkip) {
      return <SkipButton onClick={onSkip} />;
    }

    if (selectedCount > 0 || !showSkipWhenEmpty) {
      return onNext ? <NextButton onClick={onNext} /> : null;
    }

    return null;
  }

  return (
    <div className="flex gap-2">
      {renderLeftButton()}
      {renderRightButton()}
    </div>
  );
}

export function useStepLogic() {
  const { form } = useAdmissionSetup();
  const formData = form.watch();

  function handleFieldChange(field: keyof AdmissionFormData, value: boolean) {
    form.setValue(field, value);
  }

  function getSelectedCount(fields: (keyof AdmissionFormData)[]) {
    return fields.filter((field) => formData[field]).length;
  }

  return {
    formData,
    handleFieldChange,
    getSelectedCount,
  };
}
