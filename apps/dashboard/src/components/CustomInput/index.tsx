import { cn } from '@cometa/utils';
import React, { forwardRef, DetailedHTMLProps, InputHTMLAttributes } from 'react';

export type CustomInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  endAdornment?: React.ReactNode;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ className, endAdornment, ...props }, ref) => (
  <>
    <input
      ref={ref}
      className={cn(
        'w-full text-[#1D2939] placeholder-transparent focus:placeholder-gray-500 outline-none focus:outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0 h-[25px] px-0',
        className,
        {
          'disabled:opacity-50 disabled:cursor-not-allowed': props.disabled,
        }
      )}
      {...props}
    />
    {endAdornment}
  </>
));

export default CustomInput;
