import React from 'react';
import { cn } from '@cometa/utils';
import * as Slider from '~/components/ui/Slider';

type ChipProps = { selected: boolean; value: string; displayValue?: string; onChange: (value: string) => void };

const Chip = React.forwardRef<HTMLLabelElement, ChipProps>(({ selected, value, displayValue, onChange }, ref) => (
  <label
    className={cn(
      'rounded-md bg-transparent border-solid border-[#2B2D30] border text-[#2B2D30] p-2.5 font-semibold cursor-pointer block select-none text-sm',
      {
        'bg-[#4D5FFE] text-white border-[#4D5FFE]': selected,
      }
    )}
    htmlFor={value}
    ref={ref}
    role="radio"
    aria-checked={selected}
  >
    <input
      type="radio"
      id={value}
      hidden
      value={value}
      checked={selected}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
    {displayValue ?? value}
  </label>
));

type ChipFilterProps = {
  options: Omit<ChipProps, 'selected' | 'onChange'>[];
  onChange: (value: string) => void;
  className?: string;
  value?: ChipFilterProps['options'][number]['value'];
};

function ChipFilter({ options, onChange, className, value }: ChipFilterProps) {
  const [selected, setSelected] = React.useState<string | null>(value ?? null);

  return (
    <Slider.Root
      className={className}
      options={{
        dragFree: true,
        align: 'start',
        duration: 20,
      }}
    >
      {(sliderApi) =>
        options.map((option, index) => (
          <Slider.SliderChild key={option.value} className="[--slide-size:auto]">
            <Chip
              value={option.value}
              displayValue={option.displayValue}
              selected={Boolean(selected === option.value)}
              onChange={(value) => {
                sliderApi?.scrollTo(index);
                setSelected(value);
                onChange(value);
              }}
            />
          </Slider.SliderChild>
        ))
      }
    </Slider.Root>
  );
}

export default ChipFilter;
