import React from 'react';
import { Button } from '~/components/ui/Button';
import LinearProgress from '~/components/atoms/LinearProgress';
import Arrow from '~/public/icons/ic_arrow_right.svg';
import { useOnboardingStore } from '../store/OnboardingStoreProvider';

interface StepperProps {
  children: React.ReactNode;
  navigationVisible: boolean;
  currentIndex: number;
  onClickBack?: () => void;
}

const Stepper = ({ children, navigationVisible = true, onClickBack, currentIndex }: StepperProps) => {
  const [previousStep, backWithConfirmation, confirmationBackCallback] = useOnboardingStore((state) => [
    state.previousStep,
    state.backWithConfirmation,
    state.confirmationBackCallback,
  ]);

  return (
    <div className="flex flex-col h-screen pb-9">
      {navigationVisible ? (
        <header className="flex items-center gap-6 p-4">
          <Button
            className="flex items-center justify-center flex-shrink-0 p-2 bg-white rounded-full w-9 h-9 border border-[#E0E5FB] border-solid shadow-none hover:opacity-75 active:bg-white hover:bg-white"
            onClick={() => {
              if (onClickBack) {
                onClickBack();
              }
              !backWithConfirmation ? previousStep() : confirmationBackCallback();
            }}
          >
            <Arrow className="text-[#2B2D30] w-3 rotate-180" />
          </Button>

          <LinearProgress className="h-1 bg-[#E0E5FB] [--progress-color:#A064FF]" value={currentIndex} />
        </header>
      ) : null}

      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Stepper;
