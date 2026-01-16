export type RelationshipKeys = 'Padre' | 'Madre' | 'Tío/a' | 'Abuelo/a' | 'Hermano/a' | 'Otro';
export type GenderKeys = 'M' | 'F';

export const guardianRelationship: Record<RelationshipKeys, Record<GenderKeys, string>> = {
  Padre: {
    M: 'Hijo',
    F: 'Hija',
  },
  Madre: {
    M: 'Hijo',
    F: 'Hija',
  },
  'Tío/a': {
    M: 'Sobrino',
    F: 'Sobrina',
  },
  'Abuelo/a': {
    M: 'Nieto',
    F: 'Nieta',
  },
  'Hermano/a': {
    M: 'Hermano',
    F: 'Hermana',
  },
  Otro: {
    M: 'Otro',
    F: 'Otra',
  },
};

export const guardianRelationshipOptions = Object.keys(guardianRelationship).map((key) => ({
  id: key as RelationshipKeys,
  label: key,
}));
