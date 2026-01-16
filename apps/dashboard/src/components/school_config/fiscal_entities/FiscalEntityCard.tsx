import { BotFiscalEntityDTO } from '@cometa/trpc/src/bot/types';
import { EntityType, getStatusTooltip } from '../../../utils/onboarding-status';
import { ReviewCard } from '../ReviewCard';
import { Button } from '@cometa/recreo/v2';
import { useMemo } from 'react';
import IcWarningTriangle from 'public/assets/icons/ic_warning_triangle.svg';
import IcOctagonAlert from 'public/assets/icons/ic_octagon_alert.svg';
import { getCSDExpirationStatus, CSDExpirationStatus } from '../../../utils/csd-utils';

type FiscalEntityCardProps = {
  fiscalEntity: BotFiscalEntityDTO;
  onView?: (fiscalEntity: BotFiscalEntityDTO) => void;
  onEdit?: (fiscalEntity: BotFiscalEntityDTO) => void;
};

function useCSDExpirationStatus(fiscalEntity: BotFiscalEntityDTO): CSDExpirationStatus {
  return useMemo(() => getCSDExpirationStatus(fiscalEntity), [fiscalEntity]);
}

type CSDExpirationAlertProps = {
  variant: 'expiring' | 'expired';
  expirationDate: string;
  onUpdate: () => void;
};

function CSDExpirationAlert({ variant, expirationDate, onUpdate }: Readonly<CSDExpirationAlertProps>) {
  const isExpired = variant === 'expired';

  return (
    <div
      className={`flex items-center gap-[12px] rounded-[8px] px-[16px] py-[12px] border border-solid w-full ${
        isExpired ? 'bg-[#ffefef] border-[#fe9696]' : 'bg-[#fff9e6] border-[#ffd559]'
      }`}
    >
      <div className="flex items-start gap-[12px] grow min-w-0">
        <div className="shrink-0 pt-[2px]">
          {isExpired ? (
            <IcOctagonAlert className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <IcWarningTriangle className="w-[15px] h-[14px] text-[#8c6a04]" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-[4px] min-w-0">
          <p
            className={`font-lota font-bold text-[14px] leading-[20px] ${
              isExpired ? 'text-[#8b3636]' : 'text-[#8c6a04]'
            }`}
          >
            Tu CSD {isExpired ? 'venció' : 'vence'} el {expirationDate}.
          </p>
          <p
            className={`font-lota font-normal text-[14px] leading-[20px] ${
              isExpired ? 'text-[#8b3636]' : 'text-[#8c6a04]'
            }`}
          >
            {isExpired
              ? 'Actualízalo para poder volver a emitir facturas.'
              : 'Actualízalo antes de esa fecha para evitar interrupciones en tu facturación.'}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className={`shrink-0 h-[24px] px-[12px] py-[8px] rounded-full text-[12px] leading-[16px] font-[550] whitespace-nowrap ${
          isExpired
            ? 'border-[#8b3636] text-[#8b3636] bg-[#ffefef] hover:bg-[#ffd9d9] hover:text-[#8b3636] hover:border-[#8b3636]'
            : 'border-[#8c6a04] text-[#8c6a04] bg-[#fff9e6] hover:bg-[#ffecb2] hover:text-[#8c6a04] hover:border-[#8c6a04]'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onUpdate();
        }}
      >
        Actualizar ahora
      </Button>
    </div>
  );
}

export function FiscalEntityCard({ fiscalEntity, onView, onEdit }: Readonly<FiscalEntityCardProps>) {
  const expirationStatus = useCSDExpirationStatus(fiscalEntity);
  const shouldShowAlert = expirationStatus.isExpiring || expirationStatus.isExpired;

  return (
    <ReviewCard
      entity={fiscalEntity}
      title={fiscalEntity.name}
      subtitle={`RFC ${fiscalEntity.tax_id}`}
      status={fiscalEntity.status}
      onView={() => onView?.(fiscalEntity)}
      onEdit={onEdit}
      getStatusTooltip={(status) => getStatusTooltip(status, EntityType.FiscalEntity)}
      hideStatusChip={shouldShowAlert}
    >
      {shouldShowAlert && expirationStatus.formattedDate && (
        <CSDExpirationAlert
          variant={expirationStatus.isExpired ? 'expired' : 'expiring'}
          expirationDate={expirationStatus.formattedDate}
          onUpdate={() => onView?.(fiscalEntity)}
        />
      )}
    </ReviewCard>
  );
}
