import React from 'react';
import Add from '/public/assets/icons/add.svg';
import Substract from '/public/assets/icons/substract.svg';
import { cn } from '@cometa/utils';

interface CounterProps {
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

const Counter = React.forwardRef<HTMLInputElement, CounterProps>(
  ({ initialValue, minValue = 0, maxValue = 999, disabled, onChange }, ref) => {
    const [counter, setCounter] = React.useState(initialValue || 0);

    React.useEffect(() => {
      if (initialValue !== undefined) {
        setCounter(initialValue);
      }
    }, [initialValue]);

    const handleCounterChange = (newCounter: number) => {
      setCounter(newCounter);
      if (onChange) {
        onChange(newCounter);
      }
    };

    return (
      <div
        className={cn(
          'flex items-center font-bold bg-white border border-solid rounded-xl justify-evenly border-[#919EAB]',
          {
            'border-[#00AB55]': !disabled,
          }
        )}
      >
        <button
          disabled={disabled || counter === minValue}
          className="py-3 pl-4 pr-2 group"
          type="button"
          onClick={() => {
            handleCounterChange(counter - 1 < minValue ? minValue : counter - 1);
          }}
        >
          <Substract className="text-[#212B36] w-3 group-disabled:text-[#919EAB]" />
        </button>
        <input
          value={counter}
          type="number"
          disabled={disabled}
          ref={ref}
          className="p-0 border-none max-w-[40px] text-center focus-within:ring-2 rounded-md disabled:text-[#919EAB]"
          min={minValue}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < minValue) {
              handleCounterChange(minValue);
            } else if (maxValue && val > maxValue) {
              handleCounterChange(maxValue);
            } else {
              handleCounterChange(val);
            }
          }}
        />
        <button
          disabled={disabled || counter === maxValue}
          className="py-3 pl-2 pr-4 group"
          type="button"
          onClick={() => {
            handleCounterChange(counter + 1 > maxValue ? maxValue : counter + 1);
          }}
        >
          <Add className="text-[#212B36] w-3 group-disabled:text-[#919EAB]" />
        </button>
      </div>
    );
  }
);

export default Counter;
