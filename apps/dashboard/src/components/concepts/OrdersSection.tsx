import React from 'react';
import { SectionLayout } from './SectionLayout';
import { DetailConcept } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { renderMoney } from '../../utils/datagridHeaders';
import { formatDateWithSpanishFormat } from '../../utils/general';

interface OrdersSectionProps {
  concept: DetailConcept;
  checkIfHasMonthsToPay: () => boolean;
  formatName: (name: string) => string;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({ concept, checkIfHasMonthsToPay, formatName }) => (
  <SectionLayout title="Órdenes">
    {concept?.orders &&
      concept?.orders.length > 0 &&
      concept?.orders.map((order, index) => (
        <div
          key={order.id}
          className={cn('py-4 border-b-2', {
            'pt-[6px] pb-4': index === 0,
          })}
        >
          <p className="text-base font-semibold text-[#1C1C1D]">
            {checkIfHasMonthsToPay() ? order.name : formatName(order.name)}
          </p>
          <div className="flex flex-row justify-between text-sm text-[#1C1C1D] font-normal">
            {checkIfHasMonthsToPay() && <p>{formatDateWithSpanishFormat(order.due ?? '')}</p>}
            <p>{renderMoney(order.price)}</p>
          </div>
        </div>
      ))}
  </SectionLayout>
);
