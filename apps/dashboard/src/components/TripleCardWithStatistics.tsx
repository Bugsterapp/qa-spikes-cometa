import { DashboardSchoolDueOrdersResume } from '@cometa/trpc/src/types';
import { cva, VariantProps } from 'class-variance-authority';
import { PropsWithChildren } from 'react';

import { Tooltip } from '/src/components/atoms/Tooltip';
import { cn } from '/src/utils/cn';

import Box from './organisms/dashboard/Box';
import SimpleDonutChart from './organisms/dashboard/SimpleDonutChart';

const TripleCardWithStatistics = ({
  studentsHeader,
  loading,
}: {
  studentsHeader?: DashboardSchoolDueOrdersResume;
  loading: boolean;
}) => (
  <Box className="mt-3 p-2">
    <div className="flex items-center max-w-7xl w-full justify-between pl-20">
      {loading || !studentsHeader ? (
        <span className="before:content-['\00a0'] text-3xl bg-slate-200 rounded-full mt-1 animate-pulse ml-5 min-w-[143px] min-h-[143px]" />
      ) : (
        <SimpleDonutChart studentsHeader={studentsHeader} />
      )}

      <div className="flex items-center divide-x-2 justify-evenly w-full max-w-[calc(260px*3)]">
        <div className="flex flex-col">
          <Tooltip message="3 o más colegiaturas vencidas sin pagar">
            <Label variant="high"> Morosidad Alta </Label>
          </Tooltip>
          {loading ? (
            <span className="before:content-['\00a0'] text-3xl bg-slate-200 rounded-md mt-1 animate-pulse" />
          ) : (
            <p
              className="flex items-center mt-1 font-bold text-[#637381]"
              data-testid="highDelinquencyStudensCounter-text"
            >
              <span className="text-3xl">{studentsHeader?.delinquents?.high || 0}</span>
              <span className="text-sm font-semibold">&nbsp;estudiantes</span>
            </p>
          )}
        </div>
        <div className="flex flex-col pl-14">
          <Tooltip message="2 colegiaturas vencidas sin pagar">
            <Label variant="medium">Morosidad Media </Label>
          </Tooltip>
          {loading ? (
            <span className="before:content-['\00a0'] text-3xl bg-slate-200 rounded-md mt-1 animate-pulse" />
          ) : (
            <p
              className="flex items-center mt-1 font-bold text-[#637381]"
              data-testid="midDelinquencyStudensCounter-text"
            >
              <span className="text-3xl">{studentsHeader?.delinquents?.mid || 0}</span>
              <span className="text-sm font-semibold">&nbsp;estudiantes</span>
            </p>
          )}
        </div>
        <div className="flex flex-col pl-14">
          <Tooltip message="1 colegiatura vencida sin pagar">
            <Label variant="low">Morosidad Baja</Label>
          </Tooltip>
          {loading ? (
            <span className="before:content-['\00a0'] text-3xl bg-slate-200 rounded-md mt-1 animate-pulse" />
          ) : (
            <p
              className="flex items-center mt-1 font-bold text-[#637381]"
              data-testid="lowDelinquencyStudensCounter-text"
            >
              <span className="text-3xl">{studentsHeader?.delinquents?.low || 0}</span>
              <span className="text-sm font-semibold">&nbsp;estudiantes</span>
            </p>
          )}
        </div>
      </div>
    </div>
  </Box>
);

export default TripleCardWithStatistics;

const variants = cva('text-sm font-bold rounded-md inline px-3 py-2', {
  variants: {
    variant: {
      high: 'text-[#FF4842] bg-[#ff48421e]',
      medium: 'text-[#F3821A] bg-[#FFEACB]',
      low: 'text-[#B78103] bg-[#ffc1073d]',
    },
  },
});

const Label = ({ variant, children }: PropsWithChildren<VariantProps<typeof variants>>) => (
  <span className={cn(variants({ variant }))}>{children}</span>
);
