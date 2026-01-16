import { SchoolCycle } from '@cometa/trpc/src/types';
import * as RSelect from '@radix-ui/react-select';
import React, { Ref } from 'react';

import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import SelectChip from '/src/components/atoms/SelectChip';
import { cn } from '/src/utils/cn';

type Props = {
  onValueChange: (value: string) => void;
  value?: string;
  ref: Ref<HTMLButtonElement>;
  sortedSchoolCyclesByYearEnd: SchoolCycle[] | undefined;
  cycles: SchoolCycle[];
};

export const SchoolCycleSelect: React.FC<Props> = ({
  onValueChange,
  value,
  ref,
  sortedSchoolCyclesByYearEnd,
  cycles,
}) => (
  <RSelect.Root onValueChange={onValueChange} value={value}>
    <RSelect.Trigger
      ref={ref}
      className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full focus-within:border-green"
    >
      <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs group-focus-within:text-green">
        Ciclo escolar
      </label>
      <RSelect.Value placeholder="Selecciona un ciclo escolar" data-testid="Selecciona un ciclo escolar" />
      <Chevron className="text-[#637381] w-3 ml-16" />
    </RSelect.Trigger>
    <RSelect.Portal>
      <RSelect.Content
        className="z-[99] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
        position="popper"
      >
        <RSelect.Viewport className="max-h-[250px] space-y-2">
          {sortedSchoolCyclesByYearEnd?.map(({ id, name, is_active }) => {
            const isDisabled = cycles.some((cycle) => cycle.id === id);

            return (
              <RSelect.Item
                key={`${name}_${id}`}
                className={cn('rounded-lg p-4 cursor-pointer flex gap-3', {
                  'data-[state=checked]:bg-gray-100 hover:bg-gray-50': !isDisabled,
                  'cursor-not-allowed opacity-50': isDisabled,
                })}
                data-testid={name}
                value={id}
                disabled={isDisabled}
              >
                <RSelect.ItemText>{name}</RSelect.ItemText>
                {is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
              </RSelect.Item>
            );
          })}
        </RSelect.Viewport>
      </RSelect.Content>
    </RSelect.Portal>
  </RSelect.Root>
);
