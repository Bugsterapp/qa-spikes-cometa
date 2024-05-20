import * as Tooltip from '@radix-ui/react-tooltip';

interface Props {
  children: React.ReactNode;
  percentage: number;
  delinquents: number;
  barMonth: string;
  pending: number;
}

const ChartTooltip = ({ children, percentage, delinquents, barMonth, pending }: Props) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="left"
          avoidCollisions
          className="rounded-[12px] border border-[#D6E4FF] bg-white px-[16px] py-[12px] shadow-[0_8px_32px_0_rgba(0,48,204,0.18)] will-change-[transform,opacity]"
        >
          <div className="flex justify-start flex-col">
            <span className="text-[10px] text-[#7986B2] font-normal mb-1">
              {barMonth} al {percentage}%
            </span>
            <span className="text-xs text-[#050B1F] font-semibold">
              Pagaron:{' '}
              <span className="font-normal">
                {pending} {pending === 0 || pending > 1 ? 'alumnos' : 'alumno'}
              </span>
            </span>
            <span className="text-xs text-[#050B1F] font-semibold">
              Faltan por pagar:{' '}
              <span className="font-normal">
                {delinquents} {delinquents === 0 || delinquents > 1 ? 'alumnos' : 'alumno'}
              </span>
            </span>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default ChartTooltip;
