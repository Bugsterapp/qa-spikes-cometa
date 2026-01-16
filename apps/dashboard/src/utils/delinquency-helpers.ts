import { StatusDc1Enum } from '@cometa/trpc';

export const getFulfillmentStatusValues = (fulfillmentStatus?: StatusDc1Enum) => {
  switch (fulfillmentStatus) {
    case StatusDc1Enum.WAITING_PAID:
      return {
        value: 'Pago iniciado',
        status: 'muted',
        tooltip: 'El tutor ha iniciado un proceso de pago para esta orden desde su portal.',
      } as const;
    case StatusDc1Enum.PARTIAL_PAID:
      return {
        value: 'Pago parcial',
        status: 'warning',
        tooltip: 'Una parte de esta orden ha sido pagada. Pero aún tiene pagos pendientes.',
      } as const;
    default:
      return {
        value: 'Por pagar',
        status: 'info',
        tooltip: 'Esta orden está pendiente de pago.',
      } as const;
  }
};
