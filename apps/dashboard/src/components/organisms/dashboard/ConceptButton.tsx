import React from 'react';
import { Button as BackButton } from '../../ui/Button';
import Button from './Button';
import { cn } from '/src/utils/cn';

export type ConceptButtonProps = {
  onBack: () => void;
  onSubmit?: () => void;
  textBack?: string;
  textNext?: string;
  disabledBack?: boolean;
  disabledNext?: boolean;
  className?: string;
  children?: React.ReactNode;
  justifyEnd?: boolean;
  loading?: boolean;
  loadingText?: string;
};

const ConceptButton: React.FC<ConceptButtonProps> = ({
  onBack,
  onSubmit,
  textBack = 'Volver',
  textNext = 'Siguiente',
  disabledBack = false,
  disabledNext = false,
  className = 'sticky bottom-0',
  children,
  justifyEnd = false,
  loading = false,
  loadingText = 'Cargando...',
}) => (
  <div
    className={cn('flex justify-between border-t-2 border-gray-100 bg-white py-6 px-8 gap-2 z-50 w-full', className, {
      'justify-end': justifyEnd,
    })}
  >
    {children && <div className="flex justify-center items-center w-fit gap-2">{children}</div>}
    <div
      className={cn('flex gap-2', {
        'w-full': !children,
        'w-[55%] border-l border-[rgba(145_158_171_0.24)] pl-8': children,
      })}
    >
      <BackButton
        type="button"
        variant="ghost"
        className={cn(
          'bg-white px-6 py-3 text-[#00AB55] hover:text-green-500 hover:bg-white font-bold disabled:text-[#919EABCC] rounded-lg',
          {
            'w-full': !children,
            'w-1/2': children,
          }
        )}
        data-testid="back-button"
        onClick={onBack}
        disabled={disabledBack || loading}
      >
        {textBack}
      </BackButton>
      <Button
        className={cn(
          'text-white rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:border-none disabled:text-[#919EABCC] whitespace-nowrap',
          {
            'w-full': !children,
            'w-1/2': children,
          }
        )}
        type="submit"
        data-testid="next-button"
        disabled={disabledNext || loading}
        onClick={onSubmit}
        variant={disabledNext || loading ? 'outline' : 'primary'}
      >
        {loading ? loadingText : textNext}
      </Button>
    </div>
  </div>
);

export default ConceptButton;
