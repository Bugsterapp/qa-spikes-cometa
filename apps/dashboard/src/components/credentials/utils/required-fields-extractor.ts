import type { CredentialConfig } from '../types';
import { CredentialTemplateType } from '@cometa/trpc/src/students/types';

const VALID_BACKEND_FIELDS = [
  'name',
  'last_name',
  'enrollment_code',
  'identifier',
  'photo',
  'level',
  'grade',
  'group',
] as const;

type BackendRequiredField = (typeof VALID_BACKEND_FIELDS)[number];

const FIELD_MAPPINGS: Record<CredentialTemplateType, Record<string, BackendRequiredField | null>> = {
  [CredentialTemplateType.Student]: {
    name: 'name',
    last_name: 'last_name',
    enrollment_code: 'enrollment_code',
    identifier: 'identifier',
    level: 'level',
    grade: 'grade',
    cct_identifier: null,
    school_cycle: null,
    expires_at: null,
  },
  [CredentialTemplateType.Guardian]: {},
  [CredentialTemplateType.Teacher]: {},
} as const;

export function extractRequiredFields(
  config: CredentialConfig | undefined | null,
  options: { includePhoto?: boolean; credentialType?: CredentialTemplateType } = {}
): string[] | undefined {
  const { includePhoto = true, credentialType = CredentialTemplateType.Student } = options;

  if (!config || !config.front_fields) {
    return undefined;
  }

  const fieldMapping = FIELD_MAPPINGS[credentialType];
  const requiredFields = new Set<string>();

  Object.entries(config.front_fields).forEach(([fieldKey, fieldConfig]) => {
    if (fieldConfig.show) {
      const backendField = fieldMapping[fieldKey];
      if (backendField) {
        requiredFields.add(backendField);

        if (fieldKey === 'grade' && credentialType === 'student') {
          requiredFields.add('group');
        }
      }
    }
  });

  if (includePhoto) {
    requiredFields.add('photo');
  }

  return requiredFields.size > 0 ? Array.from(requiredFields) : undefined;
}
