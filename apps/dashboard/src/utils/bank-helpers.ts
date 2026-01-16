import { BANK_CONFIG } from '../constants/banks';

export function getBankLabel(bankName: string): string {
  const config = BANK_CONFIG[bankName];
  return config?.label || bankName;
}
