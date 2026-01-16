// Specific validation rules

export const isValidEmail = (val: string) => {
  if (!val) return true;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val) || 'Por favor ingresa un correo válido';
};

export const isRequired = (val: string | number | null) => !!val || 'Este campo es requerido';

export const isValidFullNumber = (val: string) => {
  if (!val) return true;
  return /^\+(?:[0-9]●?){6,11}[0-9]$/i.test(val) || 'Número inválido. Usar el formato: +521551234567';
};

export const isValidBirthdate = (val: string) => {
  if (!val) return true;
  return /^\d{4}-\d{2}-\d{2}$/i.test(val) || 'Fecha inválida. Usar el formato: YYYY-MM-DD';
};
