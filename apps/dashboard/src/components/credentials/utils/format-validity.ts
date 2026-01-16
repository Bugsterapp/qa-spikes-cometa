import { parse, isValid, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatValidity(date: string): string {
  if (!date) {
    return '';
  }

  const parsedDate = parse(date, 'dd/MM/yyyy', new Date());

  if (!isValid(parsedDate)) {
    return '';
  }

  return format(parsedDate, 'd MMMM yyyy', { locale: es });
}
