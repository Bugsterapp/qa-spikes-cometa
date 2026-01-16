import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

export type OnboardingState = {
  step: number;
  formData: Record<string, any>;
  backWithConfirmation: boolean;
  confirmationBackCallback: () => void;
};

export type OnboardingActions = {
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setFormData: (data: Record<string, any>) => void;
  setBackWithConfirmation: (backWithConfirmation: boolean) => void;
  setConfirmationBackCallback: (callback: () => void) => void;
};

export type OnboardingStore = OnboardingState & OnboardingActions;

export const defaultOnboardingState: OnboardingState = {
  step: 0,
  formData: {},
  backWithConfirmation: false,
  confirmationBackCallback: () => void 0,
};

export const createOnboardingStore = (initState = defaultOnboardingState) =>
  createStore<OnboardingStore>()(
    devtools(
      (set) => ({
        ...initState,
        setStep: (step) => set((state) => ({ ...state, step })),
        setFormData: (formData) => set((state) => ({ ...state, formData: { ...state.formData, ...formData } })),
        nextStep: () => set((state) => ({ ...state, step: state.step + 1 })),
        previousStep: () => set((state) => ({ ...state, step: state.step - 1 < 0 ? 0 : state.step - 1 })),
        setBackWithConfirmation: (backWithConfirmation) => set((state) => ({ ...state, backWithConfirmation })),
        setConfirmationBackCallback: (confirmationBackCallback) =>
          set((state) => ({ ...state, confirmationBackCallback })),
      }),
      { name: 'OnboardingStore' }
    )
  );
