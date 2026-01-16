import { DashboardStudentResumeSerializerV2 } from '@cometa/trpc/src/types';

import Grid from '/src/components/atoms/Grid';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { cn } from '/src/utils/cn';

import Box from './organisms/dashboard/Box';

interface StudentDueResumeProps {
  studentsHeader?: DashboardStudentResumeSerializerV2;
  loading: boolean;
}

const StudentSummaryCard = ({ studentsHeader, loading }: StudentDueResumeProps) => {
  const cardsData = [
    {
      title: 'Total Estudiantes',
      value: studentsHeader?.total || 0,
      unit: 'estudiantes',
    },
    {
      title: 'Activos',
      value: studentsHeader?.active || 0,
      unit: 'estudiantes',
      status: 'success',
    },
    {
      title: 'Inactivos',
      value: studentsHeader?.inactive || 0,
      unit: 'estudiantes',
      status: 'muted',
    },
    {
      title: 'Nuevos ingresos',
      value: studentsHeader?.new || 0,
      unit: 'estudiantes',
      status: 'info',
    },
    {
      title: 'Bajas',
      value: studentsHeader?.drop_outs || 0,
      unit: 'estudiantes',
      status: 'error',
    },
  ];

  return (
    <Box className="mt-2 p-5">
      <Grid as="section" columns={['grid-cols-5']}>
        {cardsData.map((card, index) => (
          <div
            className={`flex justify-center items-center ${
              index !== cardsData.length - 1 ? 'border-r border-[#C5C5C5]' : ''
            }`}
            key={index}
          >
            <div className="flex flex-col">
              <span
                className={cn('font-semibold text-foreground py-1', {
                  'text-[#229A16] border bg-[#229A16] bg-opacity-16 rounded-lg  px-2 w-fit': card.status === 'success',
                  'text-[#919EAB] bg-[#919EAB]/16 rounded-lg px-2 w-fit': card.status === 'muted',
                  'text-[#B78103] bg-[#ffc1073d]/16 rounded-lg px-2 w-fit': card.status === 'info',
                  'text-[#FF4842] bg-[#ff48421e]/16 rounded-lg px-2 w-fit': card.status === 'error',
                })}
              >
                {card.title}
              </span>
              <div className="flex flex-row gap-2 items-center text-gray-600">
                {loading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <span className="text-[32px] font-bold">{card.value}</span>
                )}
                {loading ? <Skeleton className="h-8" /> : <span className="text-sm font-semibold">{card.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </Box>
  );
};
export default StudentSummaryCard;
