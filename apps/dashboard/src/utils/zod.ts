import { parse, isValid, format } from 'date-fns';

export function validateZodStringDate(value: string | undefined, options?: { disableFutureDates?: boolean }) {
  if (!value) return true;

  const date = parse(value, 'dd/MM/yyyy', new Date());
  if (!isValid(date)) return false;

  const formatted = format(date, 'dd/MM/yyyy');
  if (formatted !== value) return false;

  if (options?.disableFutureDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return false;
  }

  return true;
}
