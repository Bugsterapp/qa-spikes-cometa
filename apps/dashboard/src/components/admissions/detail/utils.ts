import { ApplicationFormEntity, UpsertApplicationFormDto } from '@cometa/trpc/src/admissions/types';

export const DEFAULTS_APPLICATION_FORM_VALUES = {
  curp: '',
  birthplace: '',
  is_outside_mx: false,
  nationality: '',
  homephone: '',
  address: '',
  interior_number: '',
  neighborhood: '',
  municipality: '',
  state: '',
  zipcode: '',
  guardian_relationship: '',
};

export function buildApplicationFormPayload(
  data: Partial<UpsertApplicationFormDto>,
  studentLeadId: string,
  schoolId: string,
  guardianId: string,
  applicationForm?: ApplicationFormEntity
): Partial<UpsertApplicationFormDto> {
  const payload = {
    ...applicationForm,
    ...data,
    student_lead_id: studentLeadId,
    school_id: schoolId,
    guardian_id: guardianId,
  };

  if (!applicationForm) {
    return { ...DEFAULTS_APPLICATION_FORM_VALUES, ...convertNullToUndefined(payload) };
  }

  return convertNullToUndefined({ ...applicationForm, ...payload });
}

function convertNullToUndefined(obj: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v]));
}
