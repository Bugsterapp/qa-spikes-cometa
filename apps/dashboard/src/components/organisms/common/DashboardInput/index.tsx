import { forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import cx from 'classnames';

interface DashboardInputProps {
  value: string | number;
  placeholder?: string;
  label?: string;
  type?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string | number | null) => void;
  disabled?: boolean;
  error?: string | boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

const DashboardInput = forwardRef<HTMLInputElement, DashboardInputProps>(
  (
    { value, label, name, placeholder, type, onChange, disabled, onBlur, error, maxLength }: DashboardInputProps,
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
          className={twMerge(
            'flex flex-col relative mb-4 border border-solid px-[14px] rounded-lg border-primary hover:border-secondary  focus-within:ring-green focus-within:hover:ring-green focus-within:ring-2 group',
            cx({
              'border-red-500 focus-within:hover:border-red-500 focus-within:border-red-500': error,
              'hover:border-primary': disabled,
            })
          )}
        >
          {label && (
            <label
              htmlFor={name}
              className={twMerge(
                'absolute top-4 left-2 text-[#919EAB] peer-focus:text-secondary group-focus-within:text-green peer-focus-within:bottom-auto group-focus-within:bg-white px-1 group-focus-within:-top-2.5 group-focus-within:left-2 transition-[top,color] group-focus-within:ease-out group-focus-within:text-xs group-focus-within:ease-[cubic-bezier(4, 1, 8, 3)] z-[1]',
                labelDinamicStyles,
                cx({
                  'text-red-500 group-focus-within:text-red-500': error,
                })
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
            className={`outline-none border-none py-4 peer ${disabled ? 'text-[#637381]' : 'text-secondary'}`}
            type={type || 'text'}
            value={newValue}
            onChange={handleChange}
            placeholder={placeholder}
            onBlur={onBlur}
            disabled={disabled}
            maxLength={maxLength}
          />
        </div>
        {error && typeof error === 'string' && (
          <span className="text-xs font-semibold text-red-500 mb-4 px-3">{error}</span>
        )}
      </div>
    );
  }
);

export default DashboardInput;
