import { cn } from '@cometa/utils';
import { forwardRef } from 'react';

type TextAareaProps = {
  onChange: (a: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  hasErrors?: boolean;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  isLegacy?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAareaProps>(
  ({ onChange, className, hasErrors, id, disabled, isLegacy = true, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full h-28 resize-none bg-white border border-[#919EAB52] rounded-lg p-4',
        {
          'py-3.5 placeholder-transparent focus:placeholder-gray-500 overflow-hidden focus:border-green outline-none text-base peer rounded-lg z-[2] bg-transparent ring-0 focus:ring-0':
            isLegacy,
        },
        {
          'border-red-500 focus:border-red-500': hasErrors,
        },
        className
      )}
      data-testid="specialOverchargeMotive-input"
      onChange={onChange}
      id={id}
      disabled={!!disabled}
      {...props}
    />
  )
);
