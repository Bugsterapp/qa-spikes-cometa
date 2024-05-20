import * as React from 'react';
import * as Progress from '@radix-ui/react-progress';
import ChartTooltip from '../../../atoms/ChartTooltip';
import { cn } from '/src/utils/cn';
import { CollectionsGraphic } from '@cometa/trpc/src/types';
import { capitalize } from 'lodash';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';

interface DelinquentsChartProps {
  data: CollectionsGraphic[];
  selectedMonth: { label: string; value: string };
  setSelectedMonth: React.Dispatch<React.SetStateAction<{ label: string; value: string }>>;
  isLoading?: boolean;
}

interface Labels {
  1: string[];
  2: string[];
  3: string[];
  4: string[];
  5: string[];
  6: string[];
  7: string[];
  8: string[];
  9: string[];
  10: string[];
  11: string[];
  12: string[];
}
const DelinquentsChart = ({ data, selectedMonth, setSelectedMonth, isLoading }: DelinquentsChartProps) => {
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

  const parseSelectedMonth = (selectedMonth: { label: string; value: string }) => {
    const month = selectedMonth.value.split('-')[0];
    return parseInt(month);
  };
  const parseSelectedYear = (selectedMonth: { label: string; value: string }) => {
    const year = selectedMonth.value.split('-')[1];
    return parseInt(year);
  };
  const maxStudents = Math.max(...(data?.map((item) => item.total_students) || []));
  const roundedMax = maxStudents > 100 ? Math.ceil(maxStudents / 100) * 100 : Math.ceil(maxStudents / 10) * 10;
  const step = roundedMax / 4;
  const values = Array.from({ length: 5 }, (_, i) => Math.round(i * step)).reverse();

  const gapSizeMap: { [key: number]: string } = {
    1: 'gap-12 xl:gap-14 2x:gap-20',
    5: 'gap-10 xl:gap-12 2x:gap-16',
    10: 'gap-5 xl:gap-6 2xl:gap-12',
    12: 'gap-4 xl:gap-5 2xl:gap-10',
    15: 'gap-2 xl:gap-3 2xl:gap-6',
    18: 'gap-1 xl:gap-3 2xl:gap-5',
    24: 'gap-0 2xl:gap-3',
    30: 'gap-0 2xl:gap-2',
  };
  const findGapSize = (length: number) => {
    const keys = Object.keys(gapSizeMap)
      .map(Number)
      .sort((a, b) => b - a);

    for (const key of keys) {
      if (length >= key) {
        return gapSizeMap[key];
      }
    }

    return ''; // Default gap size if no condition matches
  };

  const gapSize = cn(findGapSize(data.length));
  const calculateRootHeight = (totalStudents: number, roundedMax: number) => (totalStudents / roundedMax) * 100;

  const renderChart = (item: CollectionsGraphic, index: number, labels: Labels) => (
    <div key={`${item.period.month}_${index}`} className="flex flex-col items-center justify-end h-full col-span-1">
      <ChartTooltip
        percentage={item.on_time_students.percentage}
        onTime={item.on_time_students.value}
        delinquents={item.delinquent_students.value}
        delinquentsPercentage={item.delinquent_students.percentage}
        barMonth={labels[item.period.month as unknown as keyof typeof labels]?.[1] || ''}
        barYear={String(item.period.year)}
      >
        <Progress.Root
          style={
            {
              '--progress-root-height': `${calculateRootHeight(item.total_students, roundedMax)}%`,
            } as React.CSSProperties
          }
          className={cn('w-4 rounded-b-lg rounded-t-none bg-[#00AB5529] rotate-180 h-[var(--progress-root-height)]', {
            'bg-[#3366FF29]':
              parseSelectedMonth(selectedMonth) === Number(item.period.month) &&
              parseSelectedYear(selectedMonth) === Number(item.period.year),
          })}
          data-testid={`${item.period.month}-${item.period.year}-column`}
          value={item.on_time_students.value}
          max={maxStudents}
          onClick={() =>
            setSelectedMonth({
              label: `${capitalize?.(item.period.month_name)} ${item.period.year}`,
              value: `${item.period.month}-${item.period.year}`,
            })
          }
        >
          <Progress.Indicator
            style={
              {
                '--progress-height': `${item.on_time_students.percentage}%`,
              } as React.CSSProperties
            }
            className={cn('rounded-b-lg rounder-t-none bg-[#00AB55] h-[var(--progress-height)] cursor-pointer', {
              'bg-[#3366FF]':
                parseSelectedMonth(selectedMonth) === Number(item.period.month) &&
                parseSelectedYear(selectedMonth) === Number(item.period.year),
            })}
          />
        </Progress.Root>
      </ChartTooltip>
      <div className="mt-2 text-xs text-gray-500">
        {labels[item.period.month as unknown as keyof typeof labels]?.[0] || ''}
      </div>
    </div>
  );

  const renderSkeleton = (index: number, labels: Labels) => (
    <div key={index} className="flex flex-col items-center justify-end h-full col-span-1 w-full">
      <Skeleton className="w-[16px] h-[240px] rounded-b-none rounded-t-lg" />
      <div className="mt-2 text-xs text-gray-500">{labels[(index + 1) as keyof typeof labels]?.[0] || ''}</div>
    </div>
  );

  const renderCharts = (data: CollectionsGraphic[], labels: Labels) =>
    data?.map((item, index) => renderChart(item, index, labels));

  const renderSkeletons = (count: number, labels: Labels) =>
    Array.from({ length: count }, (_, i) => renderSkeleton(i, labels));

  const renderContent = (isLoading: boolean, data: CollectionsGraphic[], labels: Labels) => {
    if (!isLoading && data?.length > 0) {
      return renderCharts(data, labels);
    } else if (isLoading) {
      return renderSkeletons(12, labels);
    } else if ((!isLoading && data?.length === 0) || data?.length === undefined) {
      return (
        <div className="flex items-center justify-center text-gray-500 h-full w-full pb-4">
          No hay datos para mostrar
        </div>
      );
    } else {
      return renderSkeletons(12, labels);
    }
  };

  return (
    <div className="flex w-full overflow-x-scroll pt-8 justify-between">
      <div className="flex flex-col gap-12 items-center">
        {data && data.length > 0
          ? values.map((value, index) => (
              <span key={index} className="text-xs text-gray-500">
                {value}
              </span>
            ))
          : Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="text-xs text-gray-500">
                {(i + 1) * 100}
              </span>
            )).reverse()}
      </div>
      <div className={cn(`flex ${gapSize} h-[292px] ml-3 w-fit relative flex-1`)}>
        <div className="h-[264px] position absolute left-0 right-0 -top-12 -z-10">
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
          <div className="h-1/5 border-dashed border-b-[1px] border-[#919EAB3D]" />
        </div>

        {renderContent(isLoading as boolean, data, labels)}
      </div>
    </div>
  );
};
export default DelinquentsChart;
