import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function getFormattedDate() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
  const formattedDate = date.toLocaleDateString('es-ES', options);
  return `${formattedDate.charAt(0) === '0' ? formattedDate.slice(1) : formattedDate}`;
}

export function getPreviousDay() {
  const date = new Date();
  const previousDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
  const formattedDate = previousDay.toLocaleDateString('es-ES', options);
  return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`;
}

export function getWeekRange() {
  const date = new Date();
  const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
  const endOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric' };
  const startFormattedDate = startOfWeek.toLocaleDateString('es-ES', options);
  const endFormattedDate = endOfWeek.toLocaleDateString('es-ES', options);
  return `${startFormattedDate.charAt(0).toUpperCase() + startFormattedDate.slice(1)} al ${endFormattedDate}`;
}

export function getMonthAndYear() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('es-ES', options);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export const formatDay = (val: string) => {
  let day = val.substring(0, 2);
  if (day.length === 1 && parseInt(day[0]) > 3) {
    day = `0${day[0]}`;
  } else if (day.length === 2) {
    // set the lower and upper boundary
    if (Number(day) === 0) {
      day = `01`;
    } else if (Number(day) > 31) {
      day = '31';
    }
  }
  return `${day}`;
};

export const formatMonth = (val: string) => {
  let month = val.substring(0, 2);
  if (month.length === 1 && parseInt(month[0]) > 1) {
    month = `0${month[0]}`;
  } else if (month.length === 2) {
    // set the lower and upper boundary
    if (Number(month) === 0) {
      month = `01`;
    } else if (Number(month) > 12) {
      month = '12';
    }
  }
  return `${month}`;
};

export const formatYear = (val: string) => {
  const year = val.substring(0, 4);
  return `${year}`;
};

function isValidISODate(date: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return isoDateRegex.test(date);
}

function isValidDate(date: string): boolean {
  const selectedDate = new Date(date);
  return !Number.isNaN(selectedDate.getTime());
}

function isFutureDate(date: string): boolean {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today;
}

function isWithinMaxAge(date: string, maxAgeMonths: number): boolean {
  const selectedDate = new Date(date);
  const today = new Date();
  const monthsAgo = new Date(today);
  monthsAgo.setMonth(today.getMonth() - maxAgeMonths);
  return selectedDate >= monthsAgo;
}

type DateSchemaOptions = {
  isRequired?: boolean;
  allowFuture?: boolean;
  maxAgeMonths?: number;
  fieldName?: string;
};

export function createDateSchema(options: DateSchemaOptions = {}) {
  const { isRequired = true, allowFuture = false, maxAgeMonths, fieldName = 'fecha' } = options;

  let schema = z.string().trim();

  if (isRequired) {
    schema = schema.min(1, `La ${fieldName} es requerida`);
  }

  return schema
    .refine((date) => date === '' || isValidISODate(date), {
      message: 'El formato de fecha debe ser YYYY-MM-DD',
    })
    .refine((date) => date === '' || isValidDate(date), {
      message: 'La fecha ingresada no es válida',
    })
    .refine((date) => date === '' || allowFuture || !isFutureDate(date), {
      message: `La ${fieldName} no puede ser futura`,
    })
    .refine((date) => date === '' || !maxAgeMonths || isWithinMaxAge(date, maxAgeMonths), {
      message: `El documento no puede tener más de ${maxAgeMonths} meses de antigüedad`,
    });
}

export function parseISODateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formats a date range in Spanish using a template string
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @param template - Template string with placeholders: {startDay}, {startMonth}, {startYear}, {endDay}, {endMonth}, {endYear}
 * @returns Formatted date range string
 * @example
 * formatDateRangeSpanish(
 *   new Date(2025, 11, 20),
 *   new Date(2026, 0, 8),
 *   'Del {startDay} de {startMonth} de {startYear} al {endDay} de {endMonth} de {endYear}'
 * )
 * // returns "Del 20 de diciembre de 2025 al 8 de enero de 2026"
 */
export function formatDateRangeSpanish(startDate: Date, endDate: Date, template: string): string {
  const parts = {
    startDay: format(startDate, 'd', { locale: es }),
    startMonth: format(startDate, 'MMMM', { locale: es }),
    startYear: format(startDate, 'yyyy', { locale: es }),
    endDay: format(endDate, 'd', { locale: es }),
    endMonth: format(endDate, 'MMMM', { locale: es }),
    endYear: format(endDate, 'yyyy', { locale: es }),
  };

  return template
    .replace('{startDay}', parts.startDay)
    .replace('{startMonth}', parts.startMonth)
    .replace('{startYear}', parts.startYear)
    .replace('{endDay}', parts.endDay)
    .replace('{endMonth}', parts.endMonth)
    .replace('{endYear}', parts.endYear);
}
