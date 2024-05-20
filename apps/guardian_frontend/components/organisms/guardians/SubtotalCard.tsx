import React from 'react';
import Box from '~/components/atoms/common/Box';
import { formatPrice } from '~/utils/orders';

type Props = {
  className?: string;
  subtotalValue: number;
  commissionValue: number;
  totalValue: number;
  currency?: 'MXN' | 'USD';
  isLoading?: boolean;
};

const SubtotalCard = ({
  className,
  subtotalValue,
  commissionValue,
  totalValue,
  currency = 'MXN',
  isLoading,
}: Props) => (
  <Box className={`flex flex-col space-y-3 ${className ?? ''}`} as="section">
    <div className="flex flex-col">
      <h4 className="text-[#212B36] text-xs font-semibold m-0 mb-2">Subtotal a pagar</h4>
      <span className="text-sm font-semibold text-[#212B36]">
        {formatPrice(subtotalValue, currency)} {currency}
      </span>
      <span className="font-medium text-xs text-[#637381]">
        {commissionValue ? <>+{formatPrice(commissionValue, 'MXN')} fee administrativo</> : null}
      </span>
    </div>
    <span className="bg-[#637381] w-full h-[1px]" />
    <div className="flex flex-col">
      <h4 className="text-[#212B36] text-xs font-semibold m-0">Total a pagar</h4>
      <span className={`text-base font-semibold text-[#3366FF] ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? (
          '---'
        ) : (
          <>
            {formatPrice(totalValue, currency)} {currency}
          </>
        )}
      </span>
    </div>
  </Box>
);

export default SubtotalCard;
