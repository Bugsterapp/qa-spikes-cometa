export const parseDateWithoutTimezone = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const formatMonthTitle = (date: Date) => {
  const formatted = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
  });

  return formatted
    .split(' ')
    .map((word) => {
      if (word.length <= 2 || /^\d+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const formatRangeDate = (date: Date) =>
  date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
  });
