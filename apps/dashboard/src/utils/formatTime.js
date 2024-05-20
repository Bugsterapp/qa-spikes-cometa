import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

const MONTH_ABREVIATIONS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function getMonthByAbreviation(abreviation) {
  for (let i = 0; i < MONTH_ABREVIATIONS.length; i++) if (MONTH_ABREVIATIONS === abreviation) return MONTH_NAMES[i];
  return null;
}

export function getMonthByNumber(number) {
  return MONTH_NAMES[number];
}

export function getMonthAbreviationByNumber(number) {
  return MONTH_ABREVIATIONS[number];
}

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy p');
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}
