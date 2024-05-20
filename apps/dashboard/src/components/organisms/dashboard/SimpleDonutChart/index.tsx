interface SimpleDonutChartProps {
  studentsHeader: studentHeaderType;
}

interface studentHeaderType {
  delinquents: {
    high: number;
    mid: number;
    low: number;
    zero: number;
  };
}
import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#FF4842', '#FFBD80', '#fcf6bd', '#D3D3D3'];

export default function SimpleDonutChart({ studentsHeader }: SimpleDonutChartProps) {
  const data = studentsHeader
    ? [
        {
          name: 'Alta',
          value: studentsHeader?.delinquents?.high,
        },
        {
          name: 'Media',
          value: studentsHeader?.delinquents?.mid,
        },
        {
          name: 'Baja',
          value: studentsHeader?.delinquents?.low,
        },
        {
          name: 'Sin Deuda',
          value: studentsHeader?.delinquents?.zero,
        },
      ]
    : [];
  return (
    <PieChart width={200} height={200}>
      <Pie data={data} cx={100} cy={100} innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            stroke={COLORS[index % COLORS.length]}
            className="focus:outline-none"
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
