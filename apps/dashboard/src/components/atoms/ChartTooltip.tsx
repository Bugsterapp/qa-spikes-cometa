import * as Tooltip from '@radix-ui/react-tooltip';

interface Props {
  children: React.ReactNode;
  percentage: number;
  onTime: number;
  delinquents: number;
  delinquentsPercentage: number;
  barMonth: string;
  barYear: string;
}

const ChartTooltip = ({
  children,
  percentage,
  onTime,
  delinquents,
  delinquentsPercentage,
  barMonth,
  barYear,
}: Props) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="left"
          avoidCollisions
          className="w-[235px] shadow-card z-[99999] bg-white py-4 rounded-lg h-fit"
        >
          <div>
            <span className="px-6 text-[14px] text-[#212B36] font-semibold">
              {barMonth} {barYear}
            </span>
            <div id="divider" className="border-b border-[#919EAB3D] my-3 mr-[14px]" />
            <div className="px-6 flex items-center gap-3">
              <span className="rounded-full min-w-[12px] h-[12px] bg-[#00AB55]" />
              <span
                className="text-[14px] text-[#212B36] font-semibold text-left"
                data-testid="completePaymentsStudents-text"
              >
                Estudiantes con pagos completos
              </span>
              <span className="text-[14px] text-[#212B36] font-semibold pb-5" data-testid="onTimePercentage-text">
                {percentage}%
              </span>
            </div>
            <span className="text-[12px] px-12 text-[#637381] font-normal" data-testid="onTimeCount-text">
              {onTime}
            </span>
            <div className="px-6 flex items-center gap-3">
              <span className="rounded-full min-w-[12px] h-[12px] border border-[#00AB557A] bg-[#54D62C29]" />
              <span
                className="text-[14px] text-[#212B36] font-semibold text-left"
                data-testid="incompletePaymentsStudents-text"
              >
                Estudiantes con pagos pendientes
              </span>
              <span className="text-[14px] text-[#212B36] font-semibold pb-5" data-testid="delinquentsPercentage-text">
                {delinquentsPercentage}%
              </span>
            </div>
            <span className="text-[12px] px-12 text-[#637381] font-normal" data-testid="delinquentsCount-text">
              {delinquents}
            </span>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default ChartTooltip;
