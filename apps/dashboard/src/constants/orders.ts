export enum OrderType {
  SCHOLAR = 'SCHOLAR',
  OPTIONAL = 'OPTIONAL',
  ONLINE_STORE = 'ONLINE_STORE',
}

export const getOrderTypeLabel = (type: OrderType): string => {
  switch (type) {
    case OrderType.SCHOLAR:
      return 'Escolar';
    case OrderType.OPTIONAL:
      return 'Opcional';
    case OrderType.ONLINE_STORE:
      return 'Tienda en línea';
    default:
      return 'Escolar';
  }
};
