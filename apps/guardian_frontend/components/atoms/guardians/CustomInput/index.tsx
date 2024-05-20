import { DetailedHTMLProps, forwardRef } from 'react';
import { InputHTMLAttributes } from 'react';
import { cn } from '~/lib/cn';

type CustomInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full text-[#1D2939] placeholder-gray-500 text-base peer pb-1 pt-3 rounded-lg',
      'outline outline-transparent outline-1',
      'disabled:bg-[#E4E5F4] disabled:text-[#909095]',
      'group-data-[error=true]:outline-error',
      'whitespace-nowrap overflow-hidden text-ellipsis',
      'focus:outline-transparent',
      'autofill:bg-white autofill:shadow-[inset_0_0_0px_10000px_rgb(255,255,255)]',
      className
    )}
    data-testid={`${props.name}-input`}
    {...props}
  />
));

export default CustomInput;
