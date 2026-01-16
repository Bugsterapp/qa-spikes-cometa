import React, { forwardRef } from 'react';

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(({ label, ...props }, ref) => (
  <label className="flex flex-row gap-1 items-center justify-start pl-0 pr-3 py-0 relative cursor-pointer">
    <div className="overflow-clip relative w-10 h-10">
      <div className="absolute left-1/2 w-6 h-6 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <input type="radio" ref={ref} {...props} className="peer sr-only" />
        <div className="w-6 h-6 rounded-full border-2 border-[#bac1d8] peer-checked:border-[#873AFF] peer-checked:bg-[#873AFF] relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col  justify-center leading-[0] not-italic relative text-[#1c1c1d] text-[16px] text-left whitespace-nowrap">
      <p className="block leading-6">{label}</p>
    </div>
  </label>
));

RadioButton.displayName = 'RadioButton';

export default RadioButton;
