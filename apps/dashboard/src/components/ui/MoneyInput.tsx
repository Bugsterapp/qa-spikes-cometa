import { useState, forwardRef } from 'react';
import { InputAttributes, NumericFormat, NumericFormatProps } from 'react-number-format';
import { cn } from '/src/utils/cn';
type MoneyInputProps = NumericFormatProps & {
  value?: number;
  onChange?: (value: number) => void;
  decimalScale?: number;
  label?: string;
  error?: string;
  errorClassNames?: string;
  labelClassNames?: string;
};
const MoneyInput = forwardRef<NumericFormatProps<InputAttributes>, MoneyInputProps>((props, _ref) => {
  const { value, onChange, decimalScale = 2, prefix, label = 'Precio', ...rest } = props;
  const [currency, setCurrency] = useState<number>(value as number);

  return (
    <div className="relative">
      <NumericFormat
        {...rest}
        value={currency}
        allowNegative={false}
        thousandSeparator=","
        decimalSeparator="."
        decimalScale={decimalScale}
        onValueChange={(target: any) => {
          const newCurrency = target.floatValue || null;
          setCurrency(newCurrency);
          onChange?.(newCurrency);
        }}
        valueIsNumericString
        prefix={value && prefix ? `${prefix} ` : ''}
        className={cn(
          'block w-full rounded-lg py-4 px-4 border-gray-300 shadow-sm focus:ring-opacity-50 disabled:bg-whit disabled:text-gray-600 disabled:border-none disabled:shadow-none focus:border-green border focus:ring-gray-300 peer h-[56px]',
          {
            'border-red-500 border-2 focus:border-red-500': props.error,
          },
          props.className
        )}
        data-testid="price-input"
        autoComplete="off"
      />
      <span
        className={cn(
          'absolute bottom-[47px] text-xs left-[19px] bg-white text-gray-500 peer-focus:text-green',
          {
            'text-red-500 peer-focus:text-red-500': props.error,
          },
          props.labelClassNames
        )}
      >
        {label}
      </span>
      {props.error && (
        <div
          className={cn(
            'absolute flex items-center gap-1 text-xs font-thin text-red-500 -bottom-6 max-h-4',
            props.errorClassNames
          )}
        >
          <span className="text-elipsis">{props.error}</span>
        </div>
      )}
    </div>
  );
});

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
