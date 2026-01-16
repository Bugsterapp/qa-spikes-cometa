import cx from 'classnames';
import { forwardRef, InputHTMLAttributes, useState } from 'react';

import { cn } from '/src/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  rounded?: 'left' | 'right' | 'both' | 'none';
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      label,
      name,
      placeholder,
      type,
      onChange,
      disabled,
      onBlur,
      error,
      maxLength,
      rounded = 'both',
      className,
      containerClassName,
      ...rest
    }: InputProps,
    ref
  ) => {
    const [newValue, setNewValue] = useState(value);

    const labelDinamicStyles = cx({
      '-top-2.5 bottom-auto transition-all ease-out text-xs ease-[cubic-bezier(4, 1, 8, 3)] absolute bg-white px-1 left-2':
        newValue,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewValue(e.target.value);
      onChange && onChange(e);
    };

    return (
      <div className="flex flex-col">
        <div
          className={cn(
            'flex flex-col relative mb-4 border border-solid px-[14px] border-primary hover:border-secondary  focus-within:ring-green focus-within:hover:ring-green focus-within:ring-2 group bg-white',
            {
              'border-red-500 focus-within:hover:border-red-500 focus-within:border-red-500': error,
              'hover:border-primary': disabled,
              'rounded-none rounded-r-lg': rounded == 'right',
              'rounded-none rounded-l-lg': rounded == 'left',
              'rounded-lg': rounded == 'both',
              'rounded-none': rounded == 'none',
            },
            containerClassName
          )}
        >
          {label && (
            <label
              htmlFor={name}
              className={cn(
                'absolute top-4 left-2 text-[#919EAB] peer-focus:text-foreground group-focus-within:text-green peer-focus-within:bottom-auto group-focus-within:bg-white px-1 group-focus-within:-top-2.5 group-focus-within:left-2 transition-[top,color] group-focus-within:ease-out group-focus-within:text-xs group-focus-within:ease-[cubic-bezier(4, 1, 8, 3)] z-[1]',
                labelDinamicStyles,
                {
                  'text-red-500 group-focus-within:text-red-500': error,
                }
              )}
            >
              {label}
            </label>
          )}
          <input
            id={name}
            role="dashboard-input"
            name={name || label || placeholder}
            ref={ref}
            className={cn(
              'outline-none border-none py-4 peer text-foreground',
              { 'text-[#637381]': disabled },
              className
            )}
            type={type || 'text'}
            value={newValue}
            onChange={handleChange}
            placeholder={placeholder}
            onBlur={onBlur}
            disabled={disabled}
            maxLength={maxLength}
            {...rest}
          />
        </div>
        {error && typeof error === 'string' && (
          <span className="px-3 mb-4 text-xs font-semibold text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

export default Input;
