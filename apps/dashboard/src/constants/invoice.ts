import { Status } from '/types/paid-orders';

export const invoiceStatus = {
  success: 'success',
  pending: 'info',
  canceled: 'error',
  canceling: 'error',
  not_requested: 'disabled',
  failed: 'warning',
  multiple: 'neutral',
  sponsored: 'disabled',
} as const;

export const invoiceStatusI18N = (invoice_time?: string) =>
  ({
    success: {
      status: 'Emitida',
      tooltip: undefined,
    },
    pending: {
      status: 'Por emitir',
      tooltip: `La factura se emitirá hoy a las ${invoice_time || '11:59'}`,
    },
    canceled: {
      status: 'Cancelada',
      tooltip: 'Esta factura ha sido cancelada manualmente',
    },
    canceling: {
      status: 'Por cancelar',
      tooltip: 'Se ha solicitado la cancelación de esta factura',
    },
    not_requested: {
      status: 'Sin factura',
      tooltip: 'No se ha solicitado la emisión de una factura',
    },
    failed: {
      status: 'En revisión',
      tooltip: 'Hemos detectado inconsistencias con esta factura.',
    },
    multiple: {
      status: 'Múltiples',
      tooltip: 'Esta orden ha recibido múltiples pagos parciales',
    },
    sponsored: {
      status: 'Sin factura',
      tooltip: undefined,
    },
  } satisfies Record<Status, { status: string; tooltip?: string }>);
