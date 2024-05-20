import React, { forwardRef, DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type CustomInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  endAdornment?: React.ReactNode;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ className, endAdornment, ...props }, ref) => (
  <>
    <input
      ref={ref}
      className={twMerge(
        'w-full text-[#1D2939] placeholder-transparent focus:placeholder-gray-500 outline-none focus:outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0 h-[25px] px-0',
        className
      )}
      {...props}
    />
    {endAdornment}
  </>
));

export default CustomInput;
