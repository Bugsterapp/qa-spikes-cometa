import React from 'react';
import { formatPrice } from '../../utils/general';

const Price = ({ amount, currency = 'MXN' }: { amount: string | number; currency?: string }) => {
  // Use the `formatPrice` function to format the price
  const formattedPrice = formatPrice(Number(amount), currency);

  return (
    <span className="flex items-start text-xs flex-col pl-3">
      Suma <strong className="font-bold text-sm">{formattedPrice}</strong>
    </span>
  );
};

export default Price;
