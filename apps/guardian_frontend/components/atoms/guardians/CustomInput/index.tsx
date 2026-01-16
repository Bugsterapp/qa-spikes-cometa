import { DetailedHTMLProps, forwardRef } from 'react';
import { InputHTMLAttributes } from 'react';
import { cn } from '~/lib/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const baseClassName = cn(
  'w-full text-[#1D2939] placeholder-gray-500 text-base peer pb-1 pt-3 rounded-lg border-none',
  'outline outline-transparent outline-1',
  'disabled:bg-[#E4E5F4] disabled:text-[#909095]',
  'group-data-[error=true]:outline-error',
  'whitespace-nowrap overflow-hidden text-ellipsis',
  'focus:outline-transparent',
  'autofill:bg-white autofill:shadow-[inset_0_0_0px_10000px_rgb(255,255,255)]'
);

const inputVariants = cva(baseClassName, {
  variants: {
    theme: { recreo: 'shadow-[0px_2px_50px_0px_#6C6CCD26]' },
  },
});

type CustomInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
  VariantProps<typeof inputVariants>;

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ className, theme, ...props }, ref) => {
  const classNames = cn(inputVariants({ theme, className }));
  return <input ref={ref} className={classNames} data-testid={`${props.name}-input`} {...props} />;
});

export default CustomInput;
