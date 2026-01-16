import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimelineLayout } from './TimelineLayout';
import SettingsDropDown from '/src/components/SettingsDropDown';

import IcEditPencil from '/public/assets/icons/ic_pencil.svg';
import IcDeleteTrash from '/public/assets/icons/ic_delete_trash.svg';
import { EarlyBirdDiscount } from '@cometa/trpc';
import { DropdownActionItem } from './DropdownActionItem';
import { PaginatedDashboardFulfillmentListSerializerV2List } from '@cometa/trpc';

interface EarlyBirdDiscountsProps {
  discounts: EarlyBirdDiscount[];
  isSingleOrder?: boolean;
  orderDueDate?: string;
  onEditDiscount: (index: number) => void;
  onDeleteDiscount: (index: number) => void;
  actionButton?: React.ReactNode;
  fulfillmentCount: PaginatedDashboardFulfillmentListSerializerV2List['count'];
}

export const EarlyBirdDiscounts: React.FC<EarlyBirdDiscountsProps> = ({
  discounts,
  isSingleOrder,
  orderDueDate,
  onEditDiscount,
  onDeleteDiscount,
  actionButton,
  fulfillmentCount,
}) => {
  const [showAllDiscounts, setShowAllDiscounts] = useState(false);

  const renderDiscountCard = (discount: EarlyBirdDiscount, index: number) => (
    <div key={index} className="border border-[#E9EEF7] rounded-lg p-4 flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[#212B36] text-base">
            {isSingleOrder && orderDueDate
              ? `Hasta el ${format(subDays(new Date(orderDueDate), discount.up_to_days - 1), 'PPP', { locale: es })}`
              : `Hasta ${discount.up_to_days} días antes de la fecha de vencimiento`}
          </p>
          <span className="bg-[#4BC665] bg-opacity-10 text-[#44B55C] text-xs font-bold px-2 py-0.5 rounded-md">
            {discount.discount_value} {discount.discount_type === 'AMOUNT' ? 'MXN' : '%'} dscto
          </span>
        </div>
      </div>
      <SettingsDropDown tooltipMessage="Opciones">
        <DropdownActionItem
          icon={<IcEditPencil />}
          label="Editar descuento"
          onClick={() => onEditDiscount(index)}
          disabled={fulfillmentCount !== 0}
          tooltipMessage="No disponible porque hay pagos en proceso."
          testId={`edit-discount-button-${index}`}
        />
        <DropdownActionItem
          icon={<IcDeleteTrash />}
          label="Eliminar descuento"
          onClick={() => onDeleteDiscount(index)}
          disabled={fulfillmentCount !== 0}
          tooltipMessage="No disponible porque hay pagos en proceso."
          testId={`delete-discount-button-${index}`}
        />
      </SettingsDropDown>
    </div>
  );

  return (
    <TimelineLayout
      title="Descuentos pronto pago"
      description="Cuando un concepto tiene varios descuentos pronto pago, se aplica el que corresponda según la cantidad de días previos a la fecha de vencimiento."
      items={discounts}
      showAllItems={showAllDiscounts}
      onToggleShow={() => setShowAllDiscounts(!showAllDiscounts)}
      renderItem={renderDiscountCard}
      actionButton={actionButton}
    />
  );
};
