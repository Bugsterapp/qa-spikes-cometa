import React, { InputHTMLAttributes, useState } from 'react';
import { cn } from '~/lib/cn';
import AlertSmall from '~/public/icons/alert-small.svg';

interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

const FormTextField = ({
  className,
  label,
  helperText,
  error,
  fullWidth,
  multiline,
  rows,
  ...props
}: FormTextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    props.onFocus?.(e as any);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    props.onBlur?.(e as any);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e as any);
  };

  const isLabelShrunken = isFocused || hasValue;
  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={cn('mb-0', { 'w-full': fullWidth }, className)}>
      <div className="relative rounded-2xl bg-white py-6 px-5 shadow-[0_0.125rem_1.875rem_0_#e3e0ff]">
        {InputComponent === 'textarea' ? (
          <textarea
            className={cn(
              'w-full p-0 border-0 outline-none bg-transparent translate-y-1 resize-none',
              error ? 'text-red-600' : 'text-gray-900'
            )}
            rows={rows}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...(props as any)}
          />
        ) : (
          <input
            className={cn(
              'w-full p-0 border-0 outline-none bg-transparent translate-y-1',
              error ? 'text-red-600' : 'text-gray-900'
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        )}
        {label && (
          <label
            className={cn(
              'absolute left-5 pointer-events-none transition-all duration-200 text-gray-500',
              isLabelShrunken ? 'top-[-0.25rem] text-xs' : 'top-6 text-base'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <div className="flex flex-nowrap gap-[0.37rem] items-center mt-1 ml-5 text-xs">
          {error && (
            <span>
              <AlertSmall />
            </span>
          )}
          <span className={error ? 'text-red-600' : 'text-gray-600'}>{helperText}</span>
        </div>
      )}
    </div>
  );
};

export default FormTextField;
