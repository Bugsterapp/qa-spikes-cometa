import { MoneyInput, type MoneyInputProps, Select } from '@cometa/recreo';
import { cn } from '@cometa/utils';
import type { Ref } from 'react';
import type { InputAttributes, NumericFormatProps } from 'react-number-format';

interface Option {
  value: string;
  extraContent?: string;
  prefixContent?: string;
}

interface SelectTextInputProps extends MoneyInputProps {
  classNameSelect?: string;
  classNameInput?: string;
  selectValue: string;
  onChangeSelect: (value: string) => void;
  options?: Option[];
  ref?: Ref<NumericFormatProps<InputAttributes>>;
}

export const SelectTextInput = ({
  className,
  classNameSelect,
  classNameInput,
  selectValue,
  onChangeSelect,
  options,
  error,
  ref,
  ...props
}: SelectTextInputProps) => (
  <div
    className={cn(
      'flex gap-2 p-2 rounded-lg border-[#c6ccde] border has-[:focus]:border-green group',
      { 'border-red-400': error },
      className
    )}
  >
    <Select
      className={cn('w-fit border-none p-0 gap-1 rounded-none bg-transparent', classNameSelect)}
      onValueChange={(value) => {
        onChangeSelect(value);
      }}
      value={selectValue}
      isLegacy={false}
      placeholder=""
    >
      <Select.Content className="w-fit max-w-none">
        {options?.map((item) => (
          <Select.Item
            key={item.value}
            extraContent={item.extraContent}
            prefixContent={item.prefixContent}
            value={item.value}
            className="hover:bg-[#F5FAFF] outline-none"
          >
            {item.value}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
    <div
      className={cn('w-px border border-y-0 border-r-0 border-l border-[#c6ccde] group-has-[:focus]:border-green', {
        'border-red-400': error,
      })}
    />
    <MoneyInput
      isLegacy={false}
      ref={ref}
      {...props}
      className={cn('w-full p-0 h-auto border-none outline-none focus:ring-0 rounded-none', classNameInput)}
    />
  </div>
);
