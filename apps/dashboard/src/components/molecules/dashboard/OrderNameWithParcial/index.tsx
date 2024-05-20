import Chip from 'src/components/atoms/Chip';

export const OrderNameWithParcial = ({ name, isParcial = false }: { name: string; isParcial?: boolean }) => (
  <div className="flex flex-row">
    <span className="max-w-[280px] whitespace-break-spaces truncate" title={name}>
      {name}{' '}
    </span>
    {isParcial && (
      <span className="ml-2">
        <Chip intent="warning">Parcial</Chip>
      </span>
    )}
  </div>
);
