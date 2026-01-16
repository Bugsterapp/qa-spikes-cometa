import React from 'react';
import { Button as BackButton } from '../../ui/Button';
import Button from './Button';
import { cn } from '/src/utils/cn';

export type ScholarshipAssignmentButtonProps = {
  onBack: () => void;
  onNext?: () => void;
  textBack?: string;
  textNext?: React.ReactNode | string;
  hasCounter?: number | null;
  counterText?: React.ReactNode;
  disabledBack?: boolean;
  disabledNext?: boolean;
  className?: string;
  loading?: boolean;
  loadingText?: React.ReactNode | string;
};

const ScholarshipAssignmentButton: React.FC<ScholarshipAssignmentButtonProps> = ({
  onBack,
  onNext,
  textBack = 'Volver',
  textNext = 'Siguiente',
  disabledBack = false,
  disabledNext = false,
  counterText,
  className = '',
  loading = false,
  loadingText = 'Cargando...',
}) => (
  <div className={cn('sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8', className)}>
    <div
      className={cn('flex justify-between gap-4 max-w-[1200px] mx-auto', {
        'justify-end': !counterText,
        'gap-2': counterText,
      })}
    >
      {counterText && <div className="text-sm text-black min-w-[234px] w-[234px] flex items-center">{counterText}</div>}
      <BackButton
        type="button"
        className={cn(
          'bg-white px-6 py-3 text-[#00AB55] hover:text-green-500 font-bold disabled:text-[#919EABCC] rounded-lg w-1/2',
          {
            'px-2': counterText,
          }
        )}
        data-testid="scholarship-back-button"
        onClick={onBack}
        disabled={disabledBack || loading}
      >
        {textBack}
      </BackButton>
      <Button
        className={cn(
          'text-white rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:border-none disabled:text-[#919EABCC] whitespace-nowrap w-1/2 transition-all duration-300',
          {
            'w-full': counterText,
          }
        )}
        type="button"
        data-testid="scholarship-next-button"
        disabled={disabledNext || loading}
        onClick={onNext}
        variant={disabledNext || loading ? 'outline' : 'primary'}
      >
        {loading ? loadingText : textNext}
      </Button>
    </div>
  </div>
);

export default ScholarshipAssignmentButton;
