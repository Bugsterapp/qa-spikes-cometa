export const conceptTypeTranslations: Record<string, string> = {
  MONTHLY_FEE: 'Colegiatura / mensualidad',
  INSCRIPTION: 'Inscripción',
  REINSCRIPTION: 'Reinscripción',
  TRANSPORT: 'Transporte',
  SPORTS: 'Deportes',
  EXTRACURRICULAR: 'Extracurriculares (no deportes)',
  CAFETERIA: 'Cafetería',
  BOOKS_AND_MATERIALS: 'Libros y materiales',
  UNIFORMS_AND_MERCH: 'Uniformes y otras mercancías',
  EXAMS_AND_CERTIFICATES: 'Exámenes y certificados',
  PRE_DEBT: 'Deuda previa',
  OTHER: 'Otro',
};

export const getConceptTypeLabel = (type: string): string => conceptTypeTranslations[type] || type;

export const sortOrder = [
  'colegiatura / mensualidad',
  'inscripción',
  'reinscripción',
  'transporte',
  'deportes',
  'extracurriculares (no deportes)',
  'cafetería',
  'libros y materiales',
  'uniformes y otras mercancías',
  'exámenes y certificados',
  'deuda previa',
  'otro',
];
