import { Listbox } from '@headlessui/react';
import SelectChip from '/src/components/atoms/SelectChip';
import ArrowDown from 'public/assets/images/arrow_down.svg';
import { useState } from 'react';
import { cn } from '/src/utils/cn';

interface StudentFilterProps {
  selectedSchoolCycle: any;
  setSelectedSchoolCycle: (value: string) => void;
  schoolCycles: any;
}

export const StudentFilter = ({ selectedSchoolCycle, setSelectedSchoolCycle, schoolCycles }: StudentFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Listbox value={selectedSchoolCycle} onChange={setSelectedSchoolCycle}>
      <div className="relative margin-0 padding-0 cursor-pointer">
        <Listbox.Button
          className="w-[274px] h-10 pt-[9px] pb-[7px] disabled:text-[#637381] rounded-lg border border-[#919EAB52] px-[14px] outline-none flex items-center justify-between"
          data-testid="schoolCycle-combobox"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 justify-between whitespace-nowrap">
            {selectedSchoolCycle === 'Todos' ? 'Todos' : selectedSchoolCycle?.name}
            {schoolCycles.find((cycle: any) => cycle.is_active)?.id === selectedSchoolCycle?.id ? (
              <SelectChip theme="blue">Ciclo actual</SelectChip>
            ) : null}
          </div>
          <div className="pb-1">
            <ArrowDown className={cn('transform transition-transform text-[#637381]', { 'rotate-180': isExpanded })} />
          </div>
        </Listbox.Button>
        <Listbox.Options className="absolute z-30 w-[274px] py-3 bg-white border rounded-lg shadow-cardLight cursor-pointer outline-none">
          <Listbox.Option value="Todos" className="py-[10px] px-6 hover:bg-gray-100">
            Todos
          </Listbox.Option>
          {schoolCycles
            ?.sort(
              (a: any, b: any) => Number(b.year_start) - Number(a.year_start) || Number(b.year_end) - Number(a.year_end)
            )
            .map((cycle: any) => (
              <Listbox.Option value={cycle} key={cycle.id} className="py-[10px] px-6 hover:bg-gray-100">
                <span className="flex items-center gap-2 justify-between whitespace-nowrap">
                  {cycle.name}
                  {schoolCycles.find((cycle: any) => cycle.is_active)?.id === cycle.id ? (
                    <SelectChip theme="blue">Ciclo actual</SelectChip>
                  ) : null}
                </span>
              </Listbox.Option>
            ))}
        </Listbox.Options>
        <span className="absolute text-xs font-normal bottom-8 left-4 bg-white px-1 text-[#919EAB]">
          {' '}
          Ciclo escolar
        </span>
      </div>
    </Listbox>
  );
};
