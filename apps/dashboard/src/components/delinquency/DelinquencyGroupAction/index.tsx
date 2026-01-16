import { Popover, PopoverContent, PopoverTrigger } from '@getcometa/recreo/components/ui/Popover';
import { Button } from '@getcometa/recreo/components/ui/Button';
import { Check } from 'lucide-react';
import { cn } from '@cometa/utils';
import GroupIcon from '../../../assets/GroupIcon.svg';

export type DelinquencyGroupOption = 'student_id' | 'guardian_name' | 'delinquent_concept_name' | 'level' | 'section';

export const DelinquencyGroupAction = ({
  selectedGroup,
  setSelectedGroup,
}: {
  readonly selectedGroup: DelinquencyGroupOption;
  readonly setSelectedGroup: (value: DelinquencyGroupOption) => void;
}) => {
  const options: { value: DelinquencyGroupOption; label: string }[] = [
    { value: 'student_id', label: 'Estudiante' },
    { value: 'guardian_name', label: 'Tutor' },
    { value: 'delinquent_concept_name', label: 'Concepto' },
    { value: 'level', label: 'Nivel' },
    { value: 'section', label: 'Grupo' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="medium" variant="solid-light" color="black" leftIcon={<GroupIcon />}>
          Agrupar
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex flex-col gap-1 w-40 p-2 bg-white rounded-lg shadow-[4px_4px_20px_0px_rgba(113,121,147,0.19)]"
        align="end"
      >
        {options.map((option) => (
          <Button
            key={option.value}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-normal text-neutral-900 hover:bg-galaxy-100 hover:text-galaxy-500',
              {
                'bg-galaxy-50 text-galaxy-500 font-semibold': selectedGroup === option.value,
              }
            )}
            onClick={() => setSelectedGroup(option.value)}
          >
            {option.label}
            {selectedGroup === option.value && <Check className="h-4 w-4 ml-2" />}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
