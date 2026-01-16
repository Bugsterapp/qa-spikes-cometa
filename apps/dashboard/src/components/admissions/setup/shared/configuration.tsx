import { Button } from '@cometa/recreo/v2';
import { ArrowLeft, Info, InfoIcon, X } from 'lucide-react';
import { PhoneMockup } from './phone';
import { Tooltip } from '../../../atoms/Tooltip';

type ConfigurationHeaderProps = {
  title: string | React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
  progress?: number;
  leftContent?: React.ReactNode;
  variant?: 'fixed-height' | 'default';
};

export function ConfigurationHeader({
  title,
  onBack,
  onClose,
  progress,
  leftContent,
  variant = 'default',
}: Readonly<ConfigurationHeaderProps>) {
  const heightClass = variant === 'fixed-height' ? 'h-16' : 'py-4';

  return (
    <>
      <div className={`flex items-center justify-between px-7 ${heightClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {leftContent ||
              (onBack ? (
                <>
                  <Button onClick={onBack} variant="ghost" className="p-0 h-auto text-neutral-600 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" /> Atrás
                  </Button>
                  <div className="w-[1px] h-6 bg-neutral-300" />
                </>
              ) : null)}
            <span className="text-sm font-semibold text-neutral-900">{title}</span>
          </div>
        </div>

        {onClose ? (
          <Button onClick={onClose} variant="ghost" className="p-0 h-auto">
            <X className="w-4 h-4" />
          </Button>
        ) : null}
      </div>

      {progress ? (
        <div className="h-1 bg-neutral-50">
          <div className="bg-galaxy-600 h-1 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className="h-1 bg-neutral-50" />
      )}
    </>
  );
}

type ConfigurationLayoutProps = {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
};

export function ConfigurationLayout({ leftContent, rightContent }: ConfigurationLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="min-w-[544px] max-w-[40%] w-full px-14 py-16 space-y-10 max-h-[calc(100vh-64px)] overflow-y-auto">
        {leftContent}
      </div>

      <div className="w-full bg-neutral-25 pt-6 px-7 h-[calc(100vh-60px)] flex flex-col gap-5">
        <div className="flex items-center justify-end gap-1">
          <p className="text-lg font-semibold text-neutral-300">Vista previa</p>
          <Tooltip side="bottom" message="Así verán las familias esta pantalla en su app.">
            <InfoIcon className="w-4 h-4 text-neutral-300" />
          </Tooltip>
        </div>

        <div className="flex-1 flex items-start justify-center">
          <PhoneMockup>{rightContent}</PhoneMockup>
        </div>
      </div>
    </div>
  );
}

type StepBadgeProps = {
  stepNumber: number;
  totalSteps: number;
};
export function StepBadge({ stepNumber, totalSteps }: StepBadgeProps) {
  return (
    <div className="bg-galaxy-50 px-2 py-1 rounded text-galaxy-500 mb-4 mt-2 inline-flex">
      Paso {stepNumber}/{totalSteps} de tu proceso de admisión
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  tooltip?: string;
};
export function SectionHeader({ title, tooltip }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {tooltip ? (
        <Tooltip side="right" message={tooltip}>
          <Info className="w-4 h-4 text-neutral-500" />
        </Tooltip>
      ) : null}
    </div>
  );
}

type ConfigurationContentProps = {
  title: string;
  description: string | React.ReactNode;
  stepNumber: number;
  totalSteps: number;
  children?: React.ReactNode;
  onSave: () => void;
  isDisabled?: boolean;
  disabledTooltip?: string;
};

export function ConfigurationContent({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
  onSave,
  isDisabled = false,
  disabledTooltip = 'Debes seleccionar al menos un campo para continuar.',
}: ConfigurationContentProps) {
  const saveButton = (
    <Button onClick={onSave} disabled={isDisabled}>
      Guardar
    </Button>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        <StepBadge stepNumber={stepNumber} totalSteps={totalSteps} />
        <p className="text-neutral-700">{description}</p>
      </div>

      {children}

      {isDisabled ? (
        <Tooltip side="right" message={disabledTooltip}>
          {saveButton}
        </Tooltip>
      ) : (
        saveButton
      )}
    </div>
  );
}
