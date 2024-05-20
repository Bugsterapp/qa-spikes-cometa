import ReactInputMask from 'react-input-mask';
import { twMerge } from 'tailwind-merge';
import cx from 'classnames';
import React from 'react';

interface DateInputsGroupProps {
  date: string[];
  setFieldValue: (field: string, value: string, shouldValidate?: boolean) => void;
  label?: string;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  helperTextError?: string;
  errors?: string;
}

const DateInputsGroup = ({
  date,
  label,
  disabled,
  setFieldValue,
  errors,
  onBlur,
  helperTextError,
}: DateInputsGroupProps) => {
  const renderLabelStyles = (value: string) =>
    cx({
      '-top-2.5 bottom-auto transition-all ease-out text-xs ease-[cubic-bezier(4, 1, 8, 3)] absolute bg-white px-1 left-2':
        value,
    });

  return (
    <>
      {label && <span className="text-xs font-bold text-[#637381] mb-4">{label.toUpperCase()}</span>}

      <div className="grid grid-cols-3 gap-4">
        <div
          className={twMerge(
            'flex flex-col relative mb-4 border border-solid px-[14px] rounded-lg border-primary hover:border-secondary  focus-within:ring-green focus-within:hover:ring-green focus-within:ring-2 group',
            cx({
              'border-red-500 focus-within:hover:ring-red-500 focus-within:ring-red-500': errors || helperTextError,
              'hover:border-primary': disabled,
            })
          )}
        >
          <label
            htmlFor="day"
            className={twMerge(
              'absolute top-4 left-4 text-[#919EAB] peer-focus:text-secondary peer-placeholder-shown:text-[#637381] peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:left-4  group-focus-within:text-green peer-placeholder-shown:transition-all peer-placeholder-shown:ease-out peer-placeholder-shown:ease-[cubic-bezier(4, 1, 8, 3)] peer-focus:top-2.5 peer-focus:bottom-auto peer-focus:transition-all peer-focus:ease-out peer-focus:text-xs peer-focus:ease-[cubic-bezier(4, 1, 8, 3)]',
              renderLabelStyles(date[2]),
              cx({
                'text-red-500 group-focus-within:text-red-500': errors || helperTextError,
              })
            )}
          >
            Día
          </label>
          <ReactInputMask
            mask="99"
            value={date[2]}
            onChange={(e) => setFieldValue('birthdate', `${date[0]}-${date[1]}-${e.target.value}`, true)}
            disabled={disabled}
            maskChar=" "
            name="day"
            id="day"
            onBlur={onBlur}
          >
            <input
              className={`py-4 peer outline-none border-none text-base peer focus-within:ring-0 ${
                disabled ? 'text-[#637381]' : 'text-secondary'
              } w-full`}
            />
          </ReactInputMask>
        </div>

        <div
          className={twMerge(
            'flex flex-col relative mb-4 border border-solid px-[14px] rounded-lg border-primary hover:border-secondary  focus-within:ring-green focus-within:hover:ring-green focus-within:ring-2 group',
            cx({
              'border-red-500 focus-within:hover:ring-red-500 focus-within:ring-red-500': errors || helperTextError,
              'hover:border-primary': disabled,
            })
          )}
        >
          <label
            htmlFor="month"
            className={twMerge(
              'absolute top-4 left-4 text-[#919EAB] peer-focus:text-secondary peer-placeholder-shown:text-[#637381] peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:left-4  group-focus-within:text-green peer-placeholder-shown:transition-all peer-placeholder-shown:ease-out peer-placeholder-shown:ease-[cubic-bezier(4, 1, 8, 3)] peer-focus:top-2.5 peer-focus:bottom-auto peer-focus:transition-all peer-focus:ease-out peer-focus:text-xs peer-focus:ease-[cubic-bezier(4, 1, 8, 3)]',
              renderLabelStyles(date[1]),
              cx({
                'text-red-500 group-focus-within:text-red-500': errors || helperTextError,
              })
            )}
          >
            Mes
          </label>
          <ReactInputMask
            mask="99"
            value={date[1]}
            onChange={(e) => setFieldValue('birthdate', `${date[0]}-${e.target.value}-${date[2]}`, true)}
            disabled={disabled}
            name="month"
            maskChar=" "
            id="month"
            onBlur={onBlur}
          >
            <input
              className={`py-4 peer outline-none border-none text-base group focus-within:ring-0 ${
                disabled ? 'text-[#637381] group-focus-within:text-red-500' : 'text-secondary'
              } w-full`}
            />
          </ReactInputMask>
        </div>

        <div
          className={twMerge(
            'flex flex-col relative mb-4 border border-solid px-[14px] rounded-lg border-primary hover:border-secondary  focus-within:ring-green focus-within:hover:ring-green focus-within:ring-2 group',
            cx({
              'border-red-500 focus-within:hover:ring-red-500 focus-within:ring-red-500': errors || helperTextError,
              'hover:border-primary': disabled,
            })
          )}
        >
          <label
            htmlFor="year"
            className={twMerge(
              'absolute top-4 left-4 text-[#919EAB] peer-focus:text-secondary peer-placeholder-shown:text-[#637381] peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:left-4  group-focus-within:text-green peer-placeholder-shown:transition-all peer-placeholder-shown:ease-out peer-placeholder-shown:ease-[cubic-bezier(4, 1, 8, 3)] peer-focus:top-2.5 peer-focus:bottom-auto peer-focus:transition-all peer-focus:ease-out peer-focus:text-xs peer-focus:ease-[cubic-bezier(4, 1, 8, 3)]',
              renderLabelStyles(date[0]),
              cx({
                'text-red-500 group-focus-within:text-red-500': errors || helperTextError,
              })
            )}
          >
            Año
          </label>
          <ReactInputMask
            mask="9999"
            value={date[0]}
            onChange={(e) => setFieldValue('birthdate', `${e.target.value}-${date[1]}-${date[2]}`, true)}
            disabled={disabled}
            name="year"
            maskChar=" "
            id="year"
            readOnly={disabled}
            onBlur={onBlur}
          >
            <input
              className={`py-4 peer outline-none border-none text-base peer focus-within:ring-0 ${
                disabled ? 'text-[#637381] group-focus-within:text-red-500' : 'text-secondary'
              } w-full`}
            />
          </ReactInputMask>
        </div>
      </div>
      {errors && <span className="px-3 py-1 mb-4 text-xs font-semibold text-red-500">{errors}</span>}
    </>
  );
};

export default DateInputsGroup;
