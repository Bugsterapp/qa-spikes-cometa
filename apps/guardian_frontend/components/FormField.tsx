import React from 'react';
import type { PropsWithChildren } from 'react';
import { cn } from '~/lib/cn';
import AlertSmall from '~/public/icons/alert-small.svg';

type FormFieldProps = PropsWithChildren<{
  label: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}>;

function FormField({
  children,
  label,
  htmlFor,
  error,
  className,
  helperText,
  labelClassName,
  disabled,
}: FormFieldProps) {
  const id = `input-${Math.random().toString(36).substring(7)}`;
  return (
    <div key={id} className={cn('w-full', className)}>
      <div className="relative group" data-error={!!error}>
        <label
          htmlFor={htmlFor}
          className={cn(
            'absolute inset-y-0 translate-x-5 my-auto text-base transition-transform h-fit group-focus-within:-translate-y-5 group-focus-within:scale-[0.625] group-focus-within:translate-x-2 group-[[data-error="true"]]:text-[#FF4842] text-gray-200',
            'group-[:not(:has(input:placeholder-shown))]:-translate-y-5 group-[:not(:has(input:placeholder-shown))]:scale-[0.625] group-[:not(:has(input:placeholder-shown))]:translate-x-2',
            labelClassName,
            { 'text-[#909095]': disabled }
          )}
        >
          {label}
        </label>
        {children}
      </div>
      {error ? (
        <span className="ml-5 text-[#FF4842] text-xs flex items-center gap-2 mt-3">
          <AlertSmall />
          {'  '} {error}
        </span>
      ) : null}
      {helperText ? <span className="ml-5 text-xs text-gray-200">{helperText}</span> : null}
    </div>
  );
}

export default FormField;

const Fieldset = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <fieldset className={cn('space-y-3.5 mb-3.5 w-full', className)}>{children}</fieldset>
);

const Legend = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <legend className={cn('text-[#57537A] font-semibold', className)}>{children}</legend>
);

Fieldset.Legend = Legend;

export { Fieldset };
