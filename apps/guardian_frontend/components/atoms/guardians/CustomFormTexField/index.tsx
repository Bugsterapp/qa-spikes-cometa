import CustomInput from '../CustomInput';
import { twMerge } from 'tailwind-merge';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import React from 'react';
import InputMask from 'react-input-mask';
import { cn } from '~/lib/cn';

type NFormTextFieldProps = {
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
  mask?: string;
};

const NFormTextField = ({
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
  mask,
}: NFormTextFieldProps) => (
  <>
    <div
      className={twMerge(
        'flex gap-2 bg-white rounded-2xl px-5 py-3 shadow-inputShadow hover:shadow-inputHoverShadow text-base relative mb-2',
        className
      )}
    >
      <div className="flex items-center w-full gap-2 mt-1">
        <>
          {LeftIcon && <LeftIcon sx={{ color: '#7E83B0', fontSize: '1.825rem' }} />}
          {mask ? (
            <InputMask
              mask={mask}
              value={value}
              onChange={onChange}
              name={name}
              id={name}
              type={type}
              placeholder={placeholder}
            >
              <CustomInput />
            </InputMask>
          ) : (
            <CustomInput
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              type={type}
              name={name}
              id={name}
            />
          )}
          <label
            htmlFor={name}
            className={cn(
              'block font-medium text-[#7E83B0] absolute text-base cursor-text left-11 peer-focus-within:top-[0.7rem] peer-focus-within:left-12 peer-focus-within:transition-all peer-focus-within:ease-out peer-focus-within:text-[10px] peer-focus-within:ease-[cubic-bezier(4, 1, 8, 3)]',
              {
                'top-[0.7rem] left-12 transition-all ease-out text-[10px] text-red-500 ease-[cubic-bezier(4, 1, 8, 3)]':
                  value && error,
                'top-[0.7rem] left-12 transition-all ease-out text-[10px] text-blue-600 ease-[cubic-bezier(4, 1, 8, 3)]':
                  value || (value && !error),
              }
            )}
          >
            {label}
          </label>
          {RightIcon && <RightIcon className="h-10 mr-3" />}
        </>
      </div>
      {error && (
        <div className="flex gap-1 items-center text-xs font-thin text-red-500 absolute bottom-[-1.625rem] max-h-4">
          <ErrorOutlineIcon sx={{ fontSize: '12px' }} />
          <span className="text-elipsis">{error}</span>
        </div>
      )}
    </div>
    {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
  </>
);

export default NFormTextField;
