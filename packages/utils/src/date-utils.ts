/**
 * Get the current date, formatted in spanish and based on your locale
 * @return {string} Formatted date
 * @example '24 de agosto'
 */
export function getFormattedDate(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
  const formattedDate = date.toLocaleDateString('es-ES', options);
  return `${formattedDate.charAt(0) === '0' ? formattedDate.slice(1) : formattedDate}`;
}

/**
 * Get the date previous to today, formatted in spanish and based on your locale
 * @return {string} Formatted date
 * @example '23 de agosto'
 */
export function getPreviousDay(): string {
  const date = new Date();
  const previousDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long' };
  const formattedDate = previousDay.toLocaleDateString('es-ES', options);
  return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`;
}

/**
 * Get the current week range, formatted in spanish and based on your locale
 * @return {string} Formatted range of dates
 * @example 'Lunes 19 al domingo 25'
 */
export function getWeekRange(): string {
  const date = new Date();
  const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
  const endOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric' };
  const startFormattedDate = startOfWeek.toLocaleDateString('es-ES', options);
  const endFormattedDate = endOfWeek.toLocaleDateString('es-ES', options);
  return `${startFormattedDate.charAt(0).toUpperCase() + startFormattedDate.slice(1)} al ${endFormattedDate}`;
}

/**
 * Get the current month and year, formatted in spanish and based on your locale
 * @return {string} Formatted date
 * @example 'Agosto de 2024'
 */
export function getMonthAndYear(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('es-ES', options);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

/**
 * Format the received day with '0_' format and validate if the day is valid
 * @param {string} value - Day to format
 * @return {string} Formatted day
 * @example '1' -> '01'
 */
export function formatDay(value: string): string {
  let day = value.substring(0, 2);
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
}

/**
 * Format the received month with '0_' format and validate if the month is valid
 * @param {string} value - Month to format
 * @return {string} Formatted month
 * @example '1' -> '01'
 */
export function formatMonth(value: string): string {
  let month = value.substring(0, 2);
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
}

/**
 * Format the received year with '0_' format and validate if the year is valid
 * @param {string} value - Year to format
 * @return {string} Formatted year
 * @example '2024' -> '2024'
 */
export function formatYear(value: string): string {
  const year = value.substring(0, 4);
  return `${year}`;
}
