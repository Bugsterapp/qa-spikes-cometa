import { CredentialTemplateType } from '@cometa/trpc/src/students/types';

export type EntityLabels = {
  singular: string;
  plural: string;
};

export const DEFAULT_ENTITY_LABELS: EntityLabels = {
  singular: 'elemento',
  plural: 'elementos',
};

export const ENTITY_LABELS_MAP: Record<CredentialTemplateType, EntityLabels> = {
  [CredentialTemplateType.Student]: {
    singular: 'alumno',
    plural: 'alumnos',
  },
  [CredentialTemplateType.Guardian]: {
    singular: 'tutor',
    plural: 'tutores',
  },
  [CredentialTemplateType.Teacher]: {
    singular: 'maestro',
    plural: 'maestros',
  },
};

export function formatEntityCount(count: number, labels: EntityLabels): string {
  const label = count === 1 ? labels.singular : labels.plural;
  return `${count} ${label}`;
}

export function getEntityLabels(type: CredentialTemplateType): EntityLabels {
  return ENTITY_LABELS_MAP[type];
}
