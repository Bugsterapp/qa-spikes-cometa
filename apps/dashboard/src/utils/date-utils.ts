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
