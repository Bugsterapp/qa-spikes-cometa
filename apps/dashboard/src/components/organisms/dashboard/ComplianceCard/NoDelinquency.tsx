import { Typography } from '@mui/material';
import Done from 'public/assets/images/done.svg';

interface NoDelinquencyProps {
  conceptName: string;
  selectedMonth: { value: string; label: string };
}

export default function NoDelinquency(props: NoDelinquencyProps) {
  const { conceptName, selectedMonth } = props;
  return (
    <>
      <div className="flex items-center flex-col gap-2  ">
        <div>
          <Done />
        </div>
        <Typography variant="body1" align="center">
          La cobranza de <b>{conceptName}</b> para
          <b>{selectedMonth.value === 'Todos' ? ' todos los meses ' : ' el mes de ' + selectedMonth.label}</b> está
          completa, no hay deuda de ningún estudiante.
        </Typography>
      </div>
    </>
  );
}
