import * as React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { cn } from '/src/utils/cn';
import ChargeToolTip from './ChargeTooltipOld';
interface DataItem {
  month: number;
  year: number;
  total_students: number;
  paid_students: number;
  delinquency_students: number;
  paid_percentage: string;
}

interface DelinquentsChartProps {
  data: DataItem[];
  selectedMonth: number | null;
  setSelectedMonth: (month: number) => void;
}

const DelinquentsChartOld = ({ data, selectedMonth, setSelectedMonth }: DelinquentsChartProps) => {
  const labels = {
    1: ['Ene', 'Enero'],
    2: ['Feb', 'Febrero'],
    3: ['Mar', 'Marzo'],
    4: ['Abr', 'Abril'],
    5: ['May', 'Mayo'],
    6: ['Jun', 'Junio'],
    7: ['Jul', 'Julio'],
    8: ['Ago', 'Agosto'],
    9: ['Sep', 'Septiembre'],
    10: ['Oct', 'Octubre'],
    11: ['Nov', 'Noviembre'],
    12: ['Dic', 'Diciembre'],
  };

  const percentage = (item: string) => Number(item?.split('.')[0]);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  }[data?.length >= 12 ? 12 : (data?.length as number)];

  return (
    <div>
      <div className="grid grid-cols-[10%,1fr] py-6">
        {/* reference to discuss with the team if this is the best way to approach this */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 h-1/5">100%</div>
          <div className="text-xs text-gray-500 h-1/5">80%</div>
          <div className="text-xs text-gray-500 h-1/5">60%</div>
          <div className="text-xs text-gray-500 h-1/5">40%</div>
          <div className="text-xs text-gray-500 h-1/5">20%</div>
          <div className="text-xs text-gray-500 h-1/5">0%</div>
        </div>
        <div className={cn('grid h-[300px] w-full relative', gridCols)}>
          {data && data.length > 0 ? (
            <div className="h-[264px] position absolute left-0 right-0 -top-12 -z-10">
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
              <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
            </div>
          ) : (
            <div className="top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No hay ningún concepto seleccionado.</span>
            </div>
          )}
          {data?.map((item: any, index: number) => (
            <div key={item.month} className="flex flex-col items-center justify-end h-full col-span-1">
              <ChargeToolTip
                percentage={percentage(item.paid_percentage)}
                delinquents={item.delinquency_students}
                pending={item.paid_students}
                barMonth={labels[item.month as keyof typeof labels]?.[1] || ''}
              >
                <Progress.Root
                  className={cn(
                    'h-full w-4 rounded-b-lg rounder-t-none bg-[#00AB5529] rotate-180 cursor-pointer',
                    selectedMonth === index && 'bg-[#3366FF29]'
                  )}
                  value={item.paid_assignments}
                  max={item.total_assignments}
                  onClick={() => setSelectedMonth(index)}
                >
                  <Progress.Indicator
                    style={{ '--progress-height': `${percentage(item.paid_percentage)}%` } as React.CSSProperties}
                    className={cn(
                      'rounded-b-lg rounder-t-none bg-[#00AB55] h-[var(--progress-height)]',
                      selectedMonth === index && 'bg-[#3366FF]'
                    )}
                  />
                </Progress.Root>
              </ChargeToolTip>
              <span
                className={cn(
                  'text-[#919EAB] text-xs font-normal mt-4 cursor-pointer',
                  selectedMonth === index && 'text-[#04297A] font-medium bg-[#3366FF29] rounded-md px-1'
                )}
                onClick={() => setSelectedMonth(index)}
              >
                {labels[item.month as keyof typeof labels]?.[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DelinquentsChartOld;
