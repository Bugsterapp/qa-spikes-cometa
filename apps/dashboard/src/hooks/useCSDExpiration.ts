import { useMemo } from 'react';
import { BotFiscalEntityDTO } from '@cometa/trpc/src/bot/types';
import { formatDateShort } from '../utils/general';

const DAYS_THRESHOLD = 30;

type CSDExpirationResult = {
  hasExpiringCSD: boolean;
  hasExpiredCSD: boolean;
  closestExpirationDate: string | null;
  daysUntilExpiration: number | null;
};

export function useCSDExpiration(fiscalEntities: BotFiscalEntityDTO[] | undefined): CSDExpirationResult {
  return useMemo(() => {
    if (!fiscalEntities || fiscalEntities.length === 0) {
      return {
        hasExpiringCSD: false,
        hasExpiredCSD: false,
        closestExpirationDate: null,
        daysUntilExpiration: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let closestExpiration: { dateString: string; days: number; isExpired: boolean } | null = null;

    for (const entity of fiscalEntities) {
      const certificateExpiry = entity?.certificate_expiry;

      if (!certificateExpiry) continue;

      const expiryDate = new Date(certificateExpiry);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        if (!closestExpiration || closestExpiration.isExpired === false || diffDays > closestExpiration.days) {
          closestExpiration = {
            dateString: certificateExpiry,
            days: diffDays,
            isExpired: true,
          };
        }
      } else if (diffDays > 0 && diffDays <= DAYS_THRESHOLD) {
        if (!closestExpiration || (!closestExpiration.isExpired && diffDays < closestExpiration.days)) {
          closestExpiration = {
            dateString: certificateExpiry,
            days: diffDays,
            isExpired: false,
          };
        }
      }
    }

    if (closestExpiration) {
      const formattedDate = formatDateShort(closestExpiration.dateString, true);

      return {
        hasExpiringCSD: !closestExpiration.isExpired,
        hasExpiredCSD: closestExpiration.isExpired,
        closestExpirationDate: formattedDate,
        daysUntilExpiration: closestExpiration.days,
      };
    }

    return {
      hasExpiringCSD: false,
      hasExpiredCSD: false,
      closestExpirationDate: null,
      daysUntilExpiration: null,
    };
  }, [fiscalEntities]);
}
