import { Button } from '@cometa/recreo';
import { cn } from '@cometa/utils';

export type InscriptionType = null | 'reinscriptions' | 'new_inscriptions';

interface Option {
  value: InscriptionType;
  label: string;
}

interface InscriptionTypeFilterProps {
  selected: InscriptionType;
  onChange: (type: InscriptionType) => void;
  options?: Option[];
  className?: string;
}

const defaultOptions: Option[] = [
  { value: null, label: 'Todos' },
  { value: 'reinscriptions', label: 'Reinscripciones' },
  { value: 'new_inscriptions', label: 'Nuevos ingresos' },
];

export function InscriptionTypeFilter({
  selected,
  onChange,
  options = defaultOptions,
  className,
}: InscriptionTypeFilterProps) {
  return (
    <div className={cn('flex gap-1 bg-neutral-25 p-1 rounded-full', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant="solid-light"
          size="small"
          color="black"
          className={cn('[&.solid-light]:bg-neutral-25', {
            'text-neutral-500 font-normal': selected !== option.value,
            'bg-white [&.solid-light]:bg-white [&.solid-light]:active:bg-white': selected === option.value,
          })}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
