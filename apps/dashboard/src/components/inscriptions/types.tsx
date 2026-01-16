export type StudentStatus = 'lead' | 'new_student' | 'active' | 'inactive' | 'graduated' | 'dropped_out';

export const STUDENT_STATUS: Record<StudentStatus, string> = {
  lead: 'Prospecto',
  new_student: 'Nuevo ingreso',
  active: 'Activo',
  inactive: 'Inactivo',
  graduated: 'Graduado',
  dropped_out: 'Baja',
};

export const STUDENT_STATUS_TYPE: Record<StudentStatus, 'info' | 'success' | 'muted' | 'warning' | 'error'> = {
  lead: 'info',
  new_student: 'warning',
  active: 'success',
  inactive: 'muted',
  graduated: 'info',
  dropped_out: 'error',
};

export type InscriptionStatus = 'Inscrito' | 'Reinscrito' | 'No inscrito' | 'Pendiente';
export const INSCRIPTION_STATUS_TYPE: Record<InscriptionStatus, 'info' | 'success' | 'muted' | 'warning'> = {
  Inscrito: 'info',
  Reinscrito: 'success',
  'No inscrito': 'muted',
  Pendiente: 'warning',
};
