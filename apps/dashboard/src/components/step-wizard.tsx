import { useState, type FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './StepWizardTabs/tabs';
import { Button } from '@cometa/recreo';
import IcClose from 'public/assets/icons/ic_close.svg';
import { Eye, MoveLeft, MoveRight, Check } from 'lucide-react';
import { cn } from '@cometa/utils';

interface StepWizardProps {
  title?: string;
  steps: {
    title: string;
    content: React.ReactNode;
    value: string;
  }[];
  action: () => void;
  formTrigger: () => Promise<boolean>;
  onOpenPrev: (open: boolean) => void;
  onStepChange?: (step: number) => void;
  isStepValid?: boolean;
  isSending?: boolean;
  initialCompletedSteps?: string[];
  allowSubmitFromAnyStep?: boolean;
  onNextStep?: (nextStep: number) => void;
  onPrevStep?: (prevStep: number) => void;
  hasErrors?: boolean;
}

const StepWizardComponent: FC<StepWizardProps> = ({
  title,
  steps,
  action,
  formTrigger,
  onOpenPrev,
  onStepChange,
  isStepValid = true,
  isSending = false,
  initialCompletedSteps = [],
  allowSubmitFromAnyStep = false,
  onNextStep,
  onPrevStep,
  hasErrors = false,
}) => {
  const [stepValue, setStepValue] = useState(steps[0].value);
  const [completedSteps, setCompletedSteps] = useState<string[]>(initialCompletedSteps);

  const handleNextStep = async () => {
    const isValidForm = await formTrigger();
    if (!isValidForm) return;

    setStepValue((prevValue) => {
      const currentIndex = steps.findIndex((step) => step.value === prevValue);
      const nextIndex = currentIndex + 1;

      if (nextIndex < steps.length) {
        const nextValue = steps[nextIndex].value;
        setCompletedSteps((prev) => [...new Set([...prev, prevValue])]);
        onStepChange?.(nextIndex);
        onNextStep?.(nextIndex);
        return nextValue;
      }
      return prevValue;
    });
  };

  const handlePrevStep = () => {
    setStepValue((prevValue) => {
      const currentIndex = steps.findIndex((step) => step.value === prevValue);
      const prevIndex = currentIndex - 1;

      if (prevIndex >= 0) {
        const prevValue = steps[prevIndex].value;

        setCompletedSteps((prev) => prev.filter((val) => val !== prevValue && val !== steps[currentIndex].value));
        onStepChange?.(prevIndex);
        onPrevStep?.(prevIndex);
        return prevValue;
      }
      return prevValue;
    });
  };

  const handleSetStepCompleted = (stepValue: string) => {
    if (completedSteps.includes(stepValue)) {
      const stepIndex = steps.findIndex((step) => step.value === stepValue);
      setStepValue(stepValue);
      onStepChange?.(stepIndex);
    }
  };

  const showBackButton = stepValue !== steps[0].value;
  const showNextButton = stepValue !== steps[steps.length - 1].value;

  return (
    <Tabs defaultValue={stepValue} value={stepValue} orientation="vertical" className="w-full flex-row">
      <div className="w-full h-full grid grid-cols-[312px_1fr] gap-0 ">
        <div className="bg-white min-h-screen p-4">
          <div className="flex items-center mb-10">
            <Button variant="text" onClick={action} className="h-auto px-0 py-0 mr-5">
              <IcClose className="text-black" />
            </Button>
            <h1 className="text-lg font-bold ml-[1rem]">{title}</h1>
          </div>
          <div>
            <TabsList className="flex-col rounded-none  bg-transparent p-0">
              {steps.map((step) => (
                <TabsTrigger
                  onClick={() => handleSetStepCompleted(step.value)}
                  disabled={!completedSteps.includes(step.value) && stepValue !== step.value}
                  key={step.title}
                  value={step.value}
                  className="ml-[20px] mb-[20px] text-neutral-900 font-[600] bg-white hover:bg-neutral-50 hover:rounded-[4px] data-[state=active]:bg-neutral-25 data-[state=active]:rounded-[4px] data-[state=active]:text-neutral-900 data-[state=active]:after:bg-galaxy-500 relative w-full py-[17px] px-[10px] min-w-[220px] justify-start rounded-none after:absolute after:inset-y-0 after:left-[-10px] after:w-[4px] after:rounded-[5px] data-[state=active]:shadow-none dark:data-[state=active]:after:bg-[#873AFF] flex items-center justify-between"
                >
                  <span>{step.title}</span>
                  {completedSteps.includes(step.value) && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        <div className="bg-[#8B93A00A] h-screen p-4 overflow-auto">
          <div className="flex justify-end">
            <Button
              variant="text"
              className="text-galaxy-600 flex items-center gap-x-2"
              onClick={() => onOpenPrev(true)}
            >
              <Eye size={14} />
              <span>Previsualizar</span>
            </Button>
            <Button
              variant="solid"
              color="black"
              type="submit"
              disabled={
                !(allowSubmitFromAnyStep || stepValue === steps[steps.length - 1].value) || isSending || hasErrors
              }
              isLoading={isSending}
            >
              Enviar
            </Button>
          </div>
          <div className="p-8 grow text-start dark:border-gray-800">
            {steps.map((step) => (
              <TabsContent value={step.value} key={step.title}>
                {step.content}
              </TabsContent>
            ))}
            <div
              className={cn('xl:px-[8.625rem] flex mt-7 w-full', showBackButton ? 'justify-between' : 'justify-end')}
            >
              {showBackButton && (
                <Button
                  variant="text"
                  color="black"
                  className="flex items-center gap-x-2"
                  onClick={handlePrevStep}
                  disabled={stepValue === steps[0].value}
                >
                  <MoveLeft size={16} /> <span>Atras</span>
                </Button>
              )}
              {showNextButton && (
                <Button
                  disabled={!isStepValid}
                  variant="solid"
                  color="black"
                  onClick={handleNextStep}
                  className="flex items-center gap-x-2"
                >
                  <span>Siguiente</span> <MoveRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
};

export default StepWizardComponent;
