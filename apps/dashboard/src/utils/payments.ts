const parseDateWithoutTimezone = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const formatDateToDDMM = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Generates the tooltip message for blocked payment periods
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Formatted message with dates
 */
export const getBlockedPaymentTooltipMessage = (startDate: string, endDate: string): string => {
  const start = parseDateWithoutTimezone(startDate);
  const end = parseDateWithoutTimezone(endDate);
  const reactivationDate = addDays(end, 1);

  const formattedStart = formatDateToDDMM(start);
  const formattedEnd = formatDateToDDMM(end);
  const formattedReactivation = formatDateToDDMM(reactivationDate);

  return `El registro de pagos está pausado del ${formattedStart} al ${formattedEnd} por el cierre fiscal. Los pagos se reactivarán automáticamente el ${formattedReactivation}.`;
};
