import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AdmissionFormData } from './admission-setup-provider';

export type StepConfig = {
  title: string;
  subtitle: string;
  nextButtonText?: string;
};

type AdmissionSetupContextType = {
  form: UseFormReturn<AdmissionFormData>;
  currentStep: number | null;
  stepConfig: StepConfig | null;
  totalSteps: number;
  showExitConfirmation: boolean;
  showLoading: boolean;
  showConfiguration: boolean;
  showPublishing: boolean;
  isCreatingSteps: boolean;
  stepCreationError: string | null;
  goToStep: (step: number) => void;
  goToConfiguration: () => void;
  showExitDialog: () => void;
  hideExitDialog: () => void;
  startLoading: () => void;
  finishSetup: () => void;
  startPublishing: () => void;
};

const AdmissionSetupContext = createContext<AdmissionSetupContextType | null>(null);

export { AdmissionSetupContext };

export function useAdmissionSetup() {
  const context = useContext(AdmissionSetupContext);
  if (!context) {
    throw new Error('useAdmissionSetup must be used within AdmissionSetupProvider');
  }
  return context;
}
