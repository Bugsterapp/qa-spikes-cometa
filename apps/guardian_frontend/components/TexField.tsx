import CustomInput from './atoms/guardians/CustomInput';
import InfoOutlined from '~/public/icons/info-outlined-icon.svg';
import React from 'react';
import { cn } from '~/lib/cn';
import { type Modify, useMask } from '@react-input/mask';

type TextFieldProps = {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  name?: string;
  type?: string;
  label?: string;
  LeftIcon?: any;
  RightIcon?: any;
  maskConfig?: {
    mask: string;
    replacement?: RegExp;
    modify?: Modify;
  };
  disabled?: boolean;
};

const TextField = ({
  helperText,
  error,
  value,
  onChange,
  className,
  name,
  type,
  label,
  placeholder,
  LeftIcon,
  RightIcon,
  maskConfig,
  disabled,
}: TextFieldProps) => {
  const inputRef = useMask({
    mask: maskConfig?.mask,
    replacement: { _: maskConfig?.replacement ?? /\.*/ },
    modify: maskConfig?.modify,
  });

  return (
    <>
      <div
        className={cn(
          'flex gap-2 bg-white rounded-2xl px-5 py-3 shadow-inputShadow hover:shadow-inputHoverShadow text-base items-center relative mb-2 border border-transparent',
          className,
          {
            'bg-[#e4e5f4] cursor-not-allowed': disabled,
            'border border-solid border-red-500': error,
          }
        )}
      >
        {LeftIcon && <LeftIcon />}
        <div className="relative flex items-center flex-1 w-full gap-2 mt-1">
          <CustomInput
            className="disabled:cursor-not-allowed"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            type={type}
            name={name}
            id={name}
            ref={maskConfig ? inputRef : undefined}
            disabled={disabled}
          />

          <label
            htmlFor={name}
            className={cn(
              `block transform font-normal pointer-events-none text-[#7E83B0] origin-top-left
              absolute text-sm cursor-text
              peer-focus-within:-translate-y-3 peer-focus-within:transition-all
              peer-focus-within:ease-out peer-focus-within:scale-[0.75]
              peer-focus-within:ease-[cubic-bezier(4, 1, 8, 3)]`,
              {
                '-translate-y-3 scale-[0.75] ': value,
                'transition-all ease-out  text-blue-600 ease-[cubic-bezier(4, 1, 8, 3)]': value || (value && !error),
                'transition-all ease-out text-red-500 ease-[cubic-bezier(4, 1, 8, 3)]': value && error,
              }
            )}
          >
            {label}
          </label>
        </div>
        {RightIcon && <RightIcon className="h-10 mr-3" />}
        {error && (
          <div className="flex gap-1 items-start text-xs  text-red-500 absolute bottom-[-1.2rem] max-h-4">
            <InfoOutlined className="w-[10px] h-[10px] mt-[3px]" />
            <span className="flex-1 text-elipsis">{error}</span>
          </div>
        )}
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </>
  );
};

export default TextField;
