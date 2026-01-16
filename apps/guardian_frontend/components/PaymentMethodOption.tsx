import * as React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { cn } from '~/lib/cn';
import Check from '~/public/icons/check.svg';

const Group = ({ className, ...props }: RadioGroup.RadioGroupProps) => (
  <RadioGroup.Root className={cn('space-y-4', className)} {...props} />
);

interface OptionProps extends RadioGroup.RadioGroupItemProps {
  className?: string;
}

const Option = ({ className, children, ...props }: OptionProps) => (
  <RadioGroup.Item
    className={cn(
      "group items-center min-h-[83px] grid grid-cols-[30px_1fr_auto] gap-x-4 w-full bg-transparent group p-4 rounded-2xl border-2 border-solid data-[state='checked']:border-[#4A5CFF] data-[state='checked']:bg-white data-[state='unchecked']:border-[#344054] data-[state='unchecked']:disabled:border-[#C4C4C4] disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    {children}

    <RadioGroup.Indicator
      className="w-6 flex items-center justify-center h-6 border-2 border-solid border-[#344054] group-disabled:border-[#C4C4C4] data-[state='checked']:border-[#4A5CFF] bg-white data-[state='checked']:bg-[#4A5CFF] rounded-full"
      forceMount
    >
      <Check className="text-white" />
    </RadioGroup.Indicator>
  </RadioGroup.Item>
);

export { Group, Option };
