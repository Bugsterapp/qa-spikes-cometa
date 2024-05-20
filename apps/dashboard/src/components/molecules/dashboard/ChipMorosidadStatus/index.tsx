import { cn } from '/src/utils/cn';

interface ChipMorosidadStatusProps {
  dueOrders: number;
}

export default function ChipMorosidadStatus(props: ChipMorosidadStatusProps) {
  const { dueOrders } = props;

  const styles = {
    0: 'bg-successBg text-successText',
    1: 'bg-[#FFC10729] text-processingText',
    2: 'bg-[#FFCB7D66] text-[#F3821A]',
    high: 'bg-[#FFE7D9] text-[#FF4842]',
  }[dueOrders > 2 ? 'high' : dueOrders];

  return (
    <div className="flex items-center justify-center">
      <div className={cn('flex items-center justify-center rounded-[6px] h-[25px] w-[25px] text-xs font-bold', styles)}>
        {dueOrders}
      </div>
    </div>
  );
}
