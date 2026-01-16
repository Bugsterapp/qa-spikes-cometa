import { cn } from '@cometa/utils';
import { forwardRef, type DetailedHTMLProps, type InputHTMLAttributes } from 'react';

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  error?: string;
  isLegacy?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, isLegacy = true, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-14 bg-white border border-[#919EAB52] rounded-lg px-4',
        {
          'text-[#1D2939] placeholder-transparent focus:placeholder-gray-500 outline-none focus:outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0 h-[25px] px-0 disabled:opacity-50 disabled:cursor-not-allowed':
            isLegacy,
          'border-red-400': error,
        },
        className
      )}
      {...props}
    />
  )
);
