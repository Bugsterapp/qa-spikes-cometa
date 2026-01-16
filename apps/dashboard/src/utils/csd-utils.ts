import { BotFiscalEntityDTO, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { formatDateShort } from './general';

export const DAYS_THRESHOLD = 30;

export type CSDExpirationStatus = {
  isExpiring: boolean;
  isExpired: boolean;
  formattedDate: string | null;
};

/**
 * Checks if a certificate is expiring within the threshold (30 days)
 * Includes certificates expiring today (day 0)
 */
export function checkIfExpiring(certificateExpiry: string | null | undefined): boolean {
  if (!certificateExpiry) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(certificateExpiry);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= DAYS_THRESHOLD;
}

/**
 * Checks if a certificate is expired
 */
export function checkIfExpired(certificateExpiry: string | null | undefined): boolean {
  if (!certificateExpiry) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(certificateExpiry);
  expiryDate.setHours(0, 0, 0, 0);

  return expiryDate.getTime() < today.getTime();
}

/**
 * Gets the CSD expiration status for a fiscal entity
 * Only returns expiring/expired status if the entity is approved
 */
export function getCSDExpirationStatus(fiscalEntity: BotFiscalEntityDTO | null | undefined): CSDExpirationStatus {
  const certificateExpiry = fiscalEntity?.certificate_expiry;

  if (!certificateExpiry || fiscalEntity?.status !== OnboardingStatus.Approved) {
    return {
      isExpiring: false,
      isExpired: false,
      formattedDate: null,
    };
  }

  const isExpired = checkIfExpired(certificateExpiry);
  const isExpiring = !isExpired && checkIfExpiring(certificateExpiry);
  const formattedDate = formatDateShort(certificateExpiry, true);

  if (isExpired) {
    return {
      isExpiring: false,
      isExpired: true,
      formattedDate,
    };
  }

  if (isExpiring) {
    return {
      isExpiring: true,
      isExpired: false,
      formattedDate,
    };
  }

  return {
    isExpiring: false,
    isExpired: false,
    formattedDate: null,
  };
}
