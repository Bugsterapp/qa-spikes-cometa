import { CollectionsGraphicResponse } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { capitalize } from 'lodash';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../../components/ui/chart';
import Skeleton from '../molecules/dashboard/Skeleton';

type DelinquentsChartProps = {
  data: CollectionsGraphicResponse[];
  selectedMonth: { label: string; value: string };
  setSelectedMonth: React.Dispatch<React.SetStateAction<{ label: string; value: string }>>;
  isLoading?: boolean;
  selectedSchoolCycle?: SchoolCycleEntity | null;
};

type Labels = {
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
};

const chartConfig = {
  onTime: {
    label: 'A tiempo',
    color: '#20B137',
  },
  delinquent: {
    label: 'Morosos',
    color: '#ECEFF6',
  },
} satisfies ChartConfig;

export default function DelinquentsChart({
  data,
  selectedMonth,
  setSelectedMonth,
  isLoading,
  selectedSchoolCycle,
}: DelinquentsChartProps) {
  const labels: Labels = {
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

  if (isLoading) {
    return (
      <div className="w-full pt-8">
        <Skeleton className="w-full h-[320px] rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-[340px] text-gray-500">No hay datos para mostrar</div>
    );
  }

  const processedChartData = processDelinquentsChartData(data, selectedSchoolCycle, selectedMonth, labels);

  function handleBarClick(data: ProcessedChartDataItem) {
    if (data && data.periodMonth && data.periodYear) {
      setSelectedMonth({
        label: data.fullMonth,
        value: `${data.periodMonth}-${data.periodYear}`,
      });
    }
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-[340px] pt-8">
      <BarChart data={processedChartData} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_value, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0]?.payload?.fullMonth || _value;
                }
                return _value;
              }}
            />
          }
        />
        <Bar
          dataKey="onTime"
          stackId="a"
          fill="var(--color-onTime)"
          radius={[0, 0, 4, 4]}
          onClick={handleBarClick}
          style={{ cursor: 'pointer' }}
        >
          {processedChartData.map((entry, index) => (
            <Cell key={`cell-ontime-${index}`} fill={entry.isSelected ? '#1683E8' : 'var(--color-onTime)'} />
          ))}
        </Bar>
        <Bar
          dataKey="delinquent"
          stackId="a"
          fill="var(--color-delinquent)"
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
          style={{ cursor: 'pointer' }}
        >
          {processedChartData.map((entry, index) => (
            <Cell key={`cell-delinquent-${index}`} fill={entry.isSelected ? '#E8F4FF' : 'var(--color-delinquent)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

type ProcessedChartDataItem = {
  month: string;
  fullMonth: string;
  onTime: number;
  delinquent: number;
  periodMonth: string;
  periodYear: string;
  isSelected: boolean;
};

function processDelinquentsChartData(
  data: CollectionsGraphicResponse[],
  selectedSchoolCycle: SchoolCycleEntity | null | undefined,
  selectedMonth: { label: string; value: string },
  labels: Labels
): ProcessedChartDataItem[] {
  const dataByMonth = new Map(data.map((item) => [`${item.period.month}-${item.period.year}`, item]));

  const sortedData = [...data].sort((a, b) => {
    const aDate = Number(a.period.year) * 12 + Number(a.period.month);
    const bDate = Number(b.period.year) * 12 + Number(b.period.month);
    return aDate - bDate;
  });

  const firstMonth = sortedData[0];
  const lastMonth = sortedData[sortedData.length - 1];

  const startYear = Number(firstMonth.period.year);
  const startMonth = Number(firstMonth.period.month);

  const cycleEndYear = selectedSchoolCycle?.year_end || startYear + 1;
  const cycleEndMonth = selectedSchoolCycle?.month_end || 7; // Default to July if not specified

  const lastDataYear = Number(lastMonth.period.year);
  const lastDataMonth = Number(lastMonth.period.month);
  const lastDataDate = lastDataYear * 12 + lastDataMonth;
  const cycleEndDate = cycleEndYear * 12 + cycleEndMonth;

  const finalEndYear = lastDataDate > cycleEndDate ? lastDataYear : cycleEndYear;
  const finalEndMonth = lastDataDate > cycleEndDate ? lastDataMonth : cycleEndMonth;

  const monthsInCycle: Array<{ month: number; year: string }> = [];
  let currentMonth = startMonth;
  let currentYear = startYear;

  while (currentYear < finalEndYear || (currentYear === finalEndYear && currentMonth <= finalEndMonth)) {
    monthsInCycle.push({ month: currentMonth, year: currentYear.toString() });
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return monthsInCycle.map(({ month, year }) => {
    const key = `${month}-${year}`;
    const item = dataByMonth.get(key);

    if (item) {
      return {
        month: labels[item.period.month as unknown as keyof typeof labels]?.[0] || '',
        fullMonth: `${capitalize(item.period.month_name)} ${item.period.year}`,
        onTime: item.on_time_students.value,
        delinquent: item.delinquent_students.value,
        periodMonth: item.period.month,
        periodYear: item.period.year,
        isSelected:
          parseSelectedMonth(selectedMonth) === Number(item.period.month) &&
          parseSelectedYear(selectedMonth) === Number(item.period.year),
      };
    } else {
      return {
        month: labels[month as keyof typeof labels]?.[0] || '',
        fullMonth: `${labels[month as keyof typeof labels]?.[1]} ${year}`,
        onTime: 0,
        delinquent: 0,
        periodMonth: month.toString(),
        periodYear: year,
        isSelected: false,
      };
    }
  });
}

function parseSelectedMonth(selectedMonth: { label: string; value: string }) {
  const month = selectedMonth.value.split('-')[0];
  return parseInt(month);
}

function parseSelectedYear(selectedMonth: { label: string; value: string }) {
  const year = selectedMonth.value.split('-')[1];
  return parseInt(year);
}
