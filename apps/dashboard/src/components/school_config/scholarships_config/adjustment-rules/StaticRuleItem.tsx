'use client';

import { RuleTypeEnum } from '@cometa/trpc/src/types';
import { formatPrice } from '/src/utils/general';

export type StaticRuleItemProps = {
  name: string;
  description: string;
  percentage: number;
  ruleType: RuleTypeEnum;
  appliedAmount?: string;
  balance?: string;
  showBalance?: boolean;
  isFixedAmount?: boolean;
};

function isDiscount(ruleType: RuleTypeEnum): boolean {
  return [RuleTypeEnum.Scholarship, RuleTypeEnum.EarlyBird, RuleTypeEnum.SpecialDiscount].includes(ruleType);
}

export function StaticRuleItem({
  name,
  description,
  percentage,
  ruleType,
  appliedAmount = '0.00',
  balance = '0.00',
  showBalance = false,
  isFixedAmount = false,
}: StaticRuleItemProps) {
  const isDiscountRule = isDiscount(ruleType);

  const badgeColor = isDiscountRule ? 'bg-[#f3ebff] text-[#39186b]' : 'bg-[#eceff6] text-[#22283a]';

  const amountColor = isDiscountRule ? 'text-[#23a337]' : 'text-[#e65959]';

  const amountSign = isDiscountRule ? '-' : '+';

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-1 items-center">
          <p className="font-['Lota_Grotesque'] font-semibold text-sm leading-none text-[#22283a]">{name}</p>
          <div className={`rounded-md ${badgeColor} flex items-center justify-center px-2 py-0.5`}>
            <p className="font-['Lota_Grotesque'] font-semibold text-xs leading-4">
              {isFixedAmount ? `$${percentage}` : `${percentage}%`}
            </p>
          </div>
        </div>
        <p className={`font-['Lota_Grotesque'] font-bold text-sm leading-none ${amountColor}`}>
          {amountSign}
          {formatPrice(Math.abs(parseFloat(appliedAmount)))}
        </p>
      </div>

      <div className="flex items-center justify-between w-full">
        <p className="font-['Lota_Grotesque'] text-sm leading-5 text-[#697086]">{description}</p>
        {showBalance && (
          <div className="flex gap-1 items-center leading-none text-xs whitespace-pre">
            <p className="font-['Lota_Grotesque'] text-[#697086]">Saldo:</p>
            <p className="font-['Lota_Grotesque'] text-[#22283a]">{formatPrice(balance)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
