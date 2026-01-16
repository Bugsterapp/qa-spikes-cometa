export const TEACHER_ROLE_KEY = 'TEACHER';

export const MEMBERSHIPS = {
  OWNER: 'Dueño',
  GENERAL_DIRECTOR: 'Director/a General',
  ADMINISTRATIVE_DIRECTOR: 'Director/a Administrativo',
  ACCOUNTANT: 'Contador/a',
  TREASURER: 'Tesorero/a',
  ADMISSIONS: 'Admisiones',
  CASH_COLLECTION: 'Caja y Cobranzas',
  OTHER: 'Otro',
  [TEACHER_ROLE_KEY]: 'Maestro/a',
} as const;
