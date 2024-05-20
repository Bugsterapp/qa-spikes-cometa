import React, { useMemo } from 'react';
import { RadioGroup } from '@headlessui/react';

interface NRadioGroupProps {
  options?: string[];
  value?: string;
  label?: string;
  className?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const NRadioGroup = ({ options, value, label, className, onChange, disabled }: NRadioGroupProps) => {
  const radioIcon = useMemo(
    () => (checked: boolean, disabled: boolean) =>
      checked && !disabled ? (
        <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full border-green">
          <span className="w-2.5 h-2.5 rounded-full bg-green" />
        </div>
      ) : checked && disabled ? (
        <div className="w-5 h-5 rounded-full border-2 border-[#637381] p-[2px] flex justify-center items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#637381]" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-[#637381] p-[2px]" />
      ),
    []
  );

  const RadioGroupOptions = options || ['Masculino', 'Femenino', 'No especificado'];

  return (
    <RadioGroup value={value} onChange={onChange} className={className} disabled={disabled}>
      {label && <RadioGroup.Label className="text-xs font-bold text-[#637381]">{label.toUpperCase()}</RadioGroup.Label>}
      <div className="flex flex-row items-center gap-8">
        {RadioGroupOptions.map((option) => (
          <RadioGroup.Option key={option} value={option}>
            {({ checked }) => (
              <label className={`flex items-center gap-2.5 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
                {radioIcon(checked, Boolean(disabled))}
                <span className="text-sm font-normal text-secondary" data-testid={`${option}-radio`}>
                  {option}
                </span>
              </label>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default NRadioGroup;
