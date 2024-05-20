import React from 'react';
import { Button as BackButton } from '../../ui/Button';
import Button from './Button';
import { cn } from '/src/utils/cn';
export type ConceptButtonProps = {
  onBack: () => void;
  textBack?: string;
  textNext?: string;
  onSubmit?: () => void;
  disabledBack?: boolean;
  disabledNext?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const ConceptButton: React.FC<ConceptButtonProps> = ({
  onBack,
  textBack = 'Volver',
  textNext = 'Siguiente',
  onSubmit,
  className = 'sticky bottom-0',
  disabledBack = false,
  disabledNext = false,
  children,
}) => (
  <div className={cn('flex justify-between border-t-2 border-gray-100 bg-white py-6 px-8 gap-2 z-50', className)}>
    {children && <div className="flex justify-center items-center w-fit gap-2">{children}</div>}
    <div
      className={cn('flex gap-2', {
        'w-[55%] border-l-2 border-[#919EAB3D] px-0': children,
      })}
    >
      <BackButton
        type="button"
        className={cn(
          'bg-white px-6 py-3  text-[#00AB55] hover:text-green-500 font-bold disabled:text-[#919EABCC] rounded-lg',
          {
            'w-[221px]': !children,
            'mx-5': children,
          }
        )}
        data-testid="back-button"
        onClick={() => {
          onBack();
        }}
        disabled={disabledBack}
      >
        {textBack}
      </BackButton>
      <Button
        className="text-white w-[231px] rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:border-none disabled:text-[#919EABCC] whitespace-nowrap"
        type="submit"
        data-testid="next-button"
        disabled={disabledNext}
        onClick={() => {
          if (onSubmit) onSubmit();
        }}
        variant={disabledNext ? 'outline' : 'primary'}
      >
        {textNext}
      </Button>
    </div>
  </div>
);
export default ConceptButton;
