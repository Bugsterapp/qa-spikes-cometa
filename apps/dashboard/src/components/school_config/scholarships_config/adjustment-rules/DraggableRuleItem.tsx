'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RuleTypeEnum } from '@cometa/trpc/src/types';
import { formatPrice } from '/src/utils/general';
import GripVerticalIcon from 'public/assets/icons/levels_grades_groups/ic_drag_handle.svg';

export type DraggableRuleItemProps = {
  id: string;
  order: number;
  name: string;
  description: string;
  percentage: number;
  ruleType: RuleTypeEnum;
  appliedAmount?: string;
  balance?: string;
  isFixedAmount?: boolean;
};

function isDiscount(ruleType: RuleTypeEnum): boolean {
  return [RuleTypeEnum.Scholarship, RuleTypeEnum.EarlyBird, RuleTypeEnum.SpecialDiscount].includes(ruleType);
}

export function DraggableRuleItem({
  id,
  order,
  name,
  description,
  percentage,
  ruleType,
  appliedAmount = '0.00',
  balance = '0.00',
  isFixedAmount = false,
}: DraggableRuleItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDiscountRule = isDiscount(ruleType);

  const badgeColor = isDiscountRule
    ? 'bg-[#f3ebff] text-[#39186b]'
    : 'bg-[#eceff6] text-[#22283a] border border-transparent';

  const amountColor = isDiscountRule ? 'text-[#23a337]' : 'text-[#e65959]';

  const amountSign = isDiscountRule ? '-' : '+';

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center w-full">
      <div
        className="flex-1 bg-white border border-[#d0d8e9] rounded-lg pl-2 pr-3 py-3 flex gap-1 items-center shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05),0px_1px_3px_0px_rgba(34,40,58,0.10)] cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="grid grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0] relative shrink-0">
          <div className="col-[1] row-[1] ml-0 mt-0 relative w-6 h-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" stroke="#d0d8e9" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <p className="col-[1] row-[1] font-['Lota_Grotesque'] font-bold leading-none ml-[11.5px] mt-[6px] text-[#697086] text-xs text-center whitespace-pre translate-x-[-50%]">
            {order}
          </p>
        </div>

        <div className="flex gap-1 items-center">
          <GripVerticalIcon className="w-4 h-4 text-[#697086]" />
        </div>

        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-1 items-center justify-center">
              <p className="font-['Lota_Grotesque'] font-semibold leading-none text-[#22283a] text-sm whitespace-pre">
                {name}
              </p>
              <div
                className={`rounded-md ${badgeColor} flex gap-1 items-center justify-center overflow-clip px-2 py-0.5`}
              >
                <p className="font-['Lota_Grotesque'] font-semibold leading-4 text-xs whitespace-pre">
                  {isFixedAmount ? `$${percentage}` : `${percentage}%`}
                </p>
              </div>
            </div>
            <p
              className={`font-['Lota_Grotesque'] font-bold leading-5 text-sm whitespace-pre text-right ${amountColor}`}
            >
              {amountSign}
              {formatPrice(Math.abs(parseFloat(appliedAmount)))}
            </p>
          </div>

          <div className="flex items-center justify-between w-full">
            <p className="font-['Lota_Grotesque'] leading-5 text-[#697086] text-sm whitespace-pre">{description}</p>
            <div className="flex gap-1 items-center leading-none text-xs whitespace-pre text-right">
              <p className="font-['Lota_Grotesque'] text-[#697086]">Saldo:</p>
              <p className="font-['Lota_Grotesque'] text-[#22283a]">{formatPrice(balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
