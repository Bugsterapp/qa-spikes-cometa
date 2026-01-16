import React, { ReactElement } from 'react';
import type { CustomInputProps } from '../CustomInput';
import { cn } from '@cometa/utils';

type NFormTextFieldProps = {
  className?: string;
  error?: string;
  helperText?: string;
  label?: string;
  LeftIcon?: ReactElement<CustomInputProps> | string;
  RightIcon?: any;
  mask?: string;
  children: ReactElement<CustomInputProps>;
  value?: unknown;
  prefix?: string;
  textareaGrow?: boolean;
  errorClassNames?: string;
  unitType?: string;
};

const NFormTextField = ({
  helperText,
  error,
  className,
  label,
  LeftIcon,
  RightIcon,
  children,
  value,
  prefix,
  textareaGrow,
  errorClassNames,
  unitType,
}: NFormTextFieldProps) => {
  const name = children.props.name;
  const labelDynamicStyles = cn({
    '-top-2.5 bottom-auto transition-all ease-out text-xs ease-[cubic-bezier(4, 1, 8, 3)]':
      value || prefix || value === 0,
  });
  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 bg-white rounded-xl p-4 border border-[#919EAB52] text-base relative',
          { 'border-red-500 mb-3': error },
          { 'focus-within:border-green': !error },
          className
        )}
      >
        <div
          className={cn('flex items-center w-full mt-1 h-full gap-2', {
            'gap-0 mt-0': textareaGrow,
          })}
        >
          <span className="font-semibold">{LeftIcon}</span>
          {prefix && <span>{prefix}</span>}
          {children}
          <label
            htmlFor={name}
            className={cn(
              'block font-medium px-[1px] top-0 bottom-0 m-auto h-fit absolute text-base cursor-text left-3.5 transition-[top,color] z-[1] select-none',
              {
                'text-[#919EAB] peer-focus-within:text-green': !error,
                'peer-focus-within:text-red-500 text-red-500': error,
                'peer-focus-within:bottom-auto peer-focus-within:-top-2.5 bg-white peer-focus-within:left-3.5 peer-focus-within:ease-out peer-focus-within:text-xs peer-focus-within:ease-[cubic-bezier(4, 1, 8, 3)]':
                  true,
                'z-[2] peer-focus-within:-top-2 mt-3': textareaGrow,
              },
              labelDynamicStyles
            )}
          >
            {label}
          </label>

          {unitType && <span className="text-sm text-[#919EAB]">{unitType}</span>}
          {RightIcon && <RightIcon className="h-10 mr-3" />}
        </div>
        {error && (
          <div
            className={cn(
              'absolute flex items-center gap-1 text-xs font-thin text-red-500 -bottom-6 max-h-4 mb-1',
              errorClassNames
            )}
          >
            <span className="text-elipsis">{error}</span>
          </div>
        )}
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </>
  );
};

export default NFormTextField;
