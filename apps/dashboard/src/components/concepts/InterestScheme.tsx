import React, { useState } from 'react';
import { TimelineLayout } from './TimelineLayout';
import SettingsDropDown from '/src/components/SettingsDropDown';
import IcEditPencil from '/public/assets/icons/ic_pencil.svg';
import IcDeleteTrash from '/public/assets/icons/ic_delete_trash.svg';
import { InterestSchema, PaginatedDashboardFulfillmentListSerializerV2List } from '@cometa/trpc';
import { DropdownActionItem } from './DropdownActionItem';

interface InterestSchemeProps {
  interestSchemes: InterestSchema[];
  fulfillmentCount: PaginatedDashboardFulfillmentListSerializerV2List['count'];
  onEditInterest: (index: number) => void;
  onDeleteInterest: (index: number) => void;
  actionButton?: React.ReactNode;
}

export const InterestSchemas: React.FC<InterestSchemeProps> = ({
  interestSchemes,
  fulfillmentCount,
  onEditInterest,
  onDeleteInterest,
  actionButton,
}) => {
  const [showAllInterests, setShowAllInterests] = useState(false);

  const renderInterestCard = (interest: InterestSchema, index: number) => (
    <div
      key={index + interest.month_offset + interest.day_offset}
      className="border border-[#E9EEF7] rounded-lg p-4 flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[#212B36] text-base">
            {interest.month_offset === 1 && interest.day_offset === 0
              ? 'A partir del día 1 del siguiente mes'
              : interest.month_offset === 2 && interest.day_offset === 0
              ? 'A partir del día 1 del segundo mes de morosidad'
              : `${interest.day_offset} días después de la fecha de vencimiento`}
          </p>
          <span className="bg-[#FF4842] bg-opacity-10 text-[#FF4842] text-xs font-bold px-2 py-0.5 rounded-md">
            {interest.value}
            {interest.type === 'PERCENT' ? '%' : ' MXN'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#637381] italic">
          <span>
            {interest.compounding === 'SINGLE'
              ? 'Este recargo solo se aplica una vez'
              : interest.compounding === 'DAILY'
              ? 'El recargo se repite cada día'
              : interest.compounding === 'WEEKLY'
              ? 'El recargo se repite cada semana'
              : interest.compounding === 'FORTNIGHTLY'
              ? 'El recargo se repite cada 15 días'
              : interest.compounding === 'MONTHLY'
              ? 'El recargo se repite cada mes'
              : ''}
          </span>
          <div className="w-[1px] h-[18px] bg-[#91A0AB] opacity-25" />
          <span>
            Interés{' '}
            <span className="font-bold">
              {' '}
              {interest.compounding === 'SINGLE' || interest.compounding === 'DAILY' ? 'simple' : 'compuesto'}
            </span>
          </span>
        </div>
      </div>
      <SettingsDropDown tooltipMessage="Opciones">
        <DropdownActionItem
          icon={<IcEditPencil />}
          label="Editar interés"
          onClick={() => onEditInterest(index)}
          disabled={fulfillmentCount !== 0}
          tooltipMessage="No disponible porque hay pagos en proceso."
          testId={`edit-interest-button-${index}`}
        />
        <DropdownActionItem
          icon={<IcDeleteTrash />}
          label="Eliminar interés"
          onClick={() => onDeleteInterest(index)}
          disabled={fulfillmentCount !== 0}
          tooltipMessage="No disponible porque hay pagos en proceso."
          testId={`delete-interest-button-${index}`}
        />
      </SettingsDropDown>
    </div>
  );

  return (
    <TimelineLayout
      title="Esquema de intereses"
      description="Cuando un concepto tiene varios recargos, se aplica el que corresponda según los días transcurridos desde la fecha de vencimiento."
      items={interestSchemes}
      showAllItems={showAllInterests}
      onToggleShow={() => setShowAllInterests(!showAllInterests)}
      renderItem={renderInterestCard}
      actionButton={actionButton}
    />
  );
};
