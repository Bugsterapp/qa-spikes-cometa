import React from 'react';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Loader2 } from 'lucide-react';

type FormActionsProps = {
  isLoading?: boolean;
  onCancel: () => void;
  cancelText?: string;
  submitText?: string;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  showCancel?: boolean;
};

export function FormActions({
  isLoading = false,
  onCancel,
  cancelText = 'Cancelar',
  submitText = 'Guardar',
  loadingText = 'Guardando',
  disabled = false,
  className = '',
  showCancel = true,
}: Readonly<FormActionsProps>) {
  return (
    <div className={`flex flex-col items-end gap-8 w-full max-w-[540px] ${className}`}>
      <div className="flex items-start gap-4">
        {showCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex items-center text-[#22222A] font-lota text-sm font-semibold leading-6 hover:bg-gray-100 hover:text-[#1a1a20] transition-colors duration-200"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant="default"
          className="flex items-center bg-[#22222A] hover:bg-[#404040] text-white font-lota text-sm font-semibold leading-6 transition-colors duration-200"
          disabled={isLoading || disabled}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? loadingText : submitText}
        </Button>
      </div>
    </div>
  );
}
