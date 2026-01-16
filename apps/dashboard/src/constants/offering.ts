export enum OfferingType {
  SCHOLAR = 'SCHOLAR',
  OPEN_LOOP = 'OPEN_LOOP',
  MIX = 'MIX',
}

export const SCHOLAR_OFFERINGS = [OfferingType.SCHOLAR] as const;
export const ONLINE_STORE_OFFERINGS = [OfferingType.OPEN_LOOP, OfferingType.MIX] as const;
export const ALL_OFFERINGS = [OfferingType.SCHOLAR, OfferingType.OPEN_LOOP, OfferingType.MIX] as const;
