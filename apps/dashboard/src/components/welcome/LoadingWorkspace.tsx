import { useEffect, useState } from 'react';
import { useWelcomeFlowStore, WelcomeStep } from '../../stores/welcomeFlowStore';

type LoadingWorkspaceProps = {
  onComplete: () => void;
  operationsComplete: boolean;
  failedStep?: WelcomeStep;
};

const INITIAL_WAIT_TIME = 3000;

export function LoadingWorkspace({ onComplete, operationsComplete, failedStep }: Readonly<LoadingWorkspaceProps>) {
  const [hasWaited3Seconds, setHasWaited3Seconds] = useState(false);
  const store = useWelcomeFlowStore();
  const institutionData = store((state) => state.institution);
  const setCurrentStep = store((state) => state.setCurrentStep);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaited3Seconds(true);
    }, INITIAL_WAIT_TIME);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasWaited3Seconds && operationsComplete) {
      onComplete();
    }
  }, [hasWaited3Seconds, operationsComplete, onComplete]);

  useEffect(() => {
    if (!institutionData) {
      setCurrentStep(WelcomeStep.INSTITUTION_SETUP);
      return;
    }

    if (failedStep) {
      setCurrentStep(failedStep);
    }
  }, [institutionData, failedStep, setCurrentStep]);

  return (
    <div className="bg-white w-full h-screen relative">
      <div
        className="absolute flex flex-col gap-12 items-center justify-start p-0 top-1/2 translate-x-[-50%] translate-y-[-50%]"
        style={{ left: 'calc(50% + 0.5px)' }}
      >
        <div className="flex items-center justify-center">
          <div
            className="w-[43px] h-[46px] bg-center bg-no-repeat shrink-0"
            style={{
              backgroundImage: "url('/assets/gifs/cometa-black.gif')",
              backgroundSize: '162.41% 152.96%',
              backgroundPosition: '52.26% 41.83%',
            }}
          />
        </div>

        <div className="flex flex-col gap-4 h-[102px] items-start justify-start text-center">
          <h1 className="font-lota font-semibold text-[24px] leading-[30px] text-[#22283a] min-w-full">
            Configurando tu espacio de trabajo...
          </h1>

          <p className="font-lota font-normal text-[18px] leading-[28px] text-[#444c60] w-[481px]">
            En unos segundos podrás navegar tu dashboard administrativo y continuar con el proceso de configuración
          </p>
        </div>
      </div>
    </div>
  );
}
