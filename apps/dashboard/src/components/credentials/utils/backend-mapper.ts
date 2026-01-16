import type { CredentialConfig } from '../types';
import { DEFAULT_CREDENTIAL_CONFIG } from '../types';
import {
  CredentialTemplateType,
  type CreateCredentialTemplateDTO,
  type CredentialTemplateEntity,
  type StudentCredentialConfigSchemaInput,
  type StudentCredentialConfigSchemaOutput,
  type FieldConfig,
  type FileField,
  type FreeTextField,
} from '@cometa/trpc/src/students/types';

export function mapToBackendDTO(
  config: CredentialConfig,
  schoolId: string,
  templateName: string
): CreateCredentialTemplateDTO {
  return {
    school_id: schoolId,
    name: templateName,
    type: CredentialTemplateType.Student,
    config: {
      type: 'student',
      orientation: config.orientation,
      color_scheme: {
        background: {
          primary: config.color_scheme.background.primary,
          secondary: config.color_scheme.background.secondary,
        },
        text_color: config.color_scheme.text_color,
      },
      front_fields: {
        name: mapFrontFieldToBackend(config.front_fields.name),
        last_name: mapFrontFieldToBackend(config.front_fields.last_name),
        enrollment_code: mapFrontFieldToBackend(config.front_fields.enrollment_code),
        identifier: mapFrontFieldToBackend(config.front_fields.identifier),
        school_cycle: mapFrontFieldToBackend(config.front_fields.school_cycle),
        expires_at: mapFrontFieldToBackend(config.front_fields.expires_at),
        cct_identifier: mapFrontFieldToBackend(config.front_fields.cct_identifier),
        level: mapFrontFieldToBackend(config.front_fields.level),
        grade: mapFrontFieldToBackend(config.front_fields.grade),
      },
      back_fields: {
        free_text: mapFreeTextToBackend(config.back_fields.free_text),
        signature: mapFileFieldToBackend(config.back_fields.signature),
        digital_seal: mapFileFieldToBackend(config.back_fields.digital_seal),
      },
    } as { type: 'student' } & StudentCredentialConfigSchemaInput,
  };
}

export function mapFromBackendConfig(entity: CredentialTemplateEntity): CredentialConfig {
  if (entity.config.type !== CredentialTemplateType.Student) {
    throw new Error('Only student credential templates are supported');
  }

  const backendConfig = entity.config as StudentCredentialConfigSchemaOutput;
  const defaults = DEFAULT_CREDENTIAL_CONFIG;

  return {
    templateName: entity.name,
    type: entity.config.type as CredentialTemplateType,
    orientation: backendConfig.orientation ?? defaults.orientation,
    color_scheme: {
      background: {
        primary: backendConfig.color_scheme?.background?.primary ?? defaults.color_scheme.background.primary,
        secondary: backendConfig.color_scheme?.background?.secondary ?? defaults.color_scheme.background.secondary,
      },
      text_color: backendConfig.color_scheme?.text_color ?? defaults.color_scheme.text_color,
    },
    front_fields: {
      name: mapBackendFieldToFrontend(backendConfig.front_fields?.name, defaults.front_fields.name),
      last_name: mapBackendFieldToFrontend(backendConfig.front_fields?.last_name, defaults.front_fields.last_name),
      enrollment_code: mapBackendFieldToFrontend(
        backendConfig.front_fields?.enrollment_code,
        defaults.front_fields.enrollment_code
      ),
      identifier: mapBackendFieldToFrontend(backendConfig.front_fields?.identifier, defaults.front_fields.identifier),
      school_cycle: mapBackendFieldToFrontend(
        backendConfig.front_fields?.school_cycle,
        defaults.front_fields.school_cycle
      ),
      expires_at: mapBackendFieldToFrontend(backendConfig.front_fields?.expires_at, defaults.front_fields.expires_at),
      cct_identifier: mapBackendFieldToFrontend(
        backendConfig.front_fields?.cct_identifier,
        defaults.front_fields.cct_identifier
      ),
      level: mapBackendFieldToFrontend(backendConfig.front_fields?.level, defaults.front_fields.level),
      grade: mapBackendFieldToFrontend(backendConfig.front_fields?.grade, defaults.front_fields.grade),
    },
    back_fields: {
      free_text: mapBackendFreeTextToFrontend(backendConfig.back_fields?.free_text, defaults.back_fields.free_text),
      signature: mapBackendFileFieldToFrontend(backendConfig.back_fields?.signature, defaults.back_fields.signature),
      digital_seal: mapBackendFileFieldToFrontend(
        backendConfig.back_fields?.digital_seal,
        defaults.back_fields.digital_seal
      ),
    },
  };
}

function mapFrontFieldToBackend(field: {
  show: boolean;
  color: string;
  editable: boolean;
  value?: string;
}): FieldConfig {
  return {
    show: field.show,
    color: field.color,
    editable: field.editable,
    value: field.value ?? null,
  };
}

function mapBackendFieldToFrontend(
  field: FieldConfig | undefined,
  defaultField: { show: boolean; color: string; editable: boolean; value?: string }
): { show: boolean; color: string; editable: boolean; value?: string } {
  return {
    show: field?.show ?? defaultField.show,
    color: field?.color ?? defaultField.color,
    editable: field?.editable ?? defaultField.editable,
    value: field?.value ?? defaultField.value,
  };
}

function mapFileFieldToBackend(field: { show: boolean; file_id?: string }): FileField {
  return {
    show: field.show,
    file_id: field.file_id || null,
  };
}

function mapBackendFileFieldToFrontend(
  field: FileField | undefined,
  defaultField: { show: boolean; color: string; editable: boolean; file_id?: string }
): { show: boolean; color: string; editable: boolean; file_id?: string } {
  return {
    show: field?.show ?? defaultField.show,
    color: defaultField.color,
    editable: defaultField.editable,
    file_id: field?.file_id ?? defaultField.file_id,
  };
}

function mapFreeTextToBackend(field: { show: boolean; color: string; value?: string }): FreeTextField {
  return {
    show: field.show,
    color: field.color,
    value: field.value || '',
  };
}

function mapBackendFreeTextToFrontend(
  field: FreeTextField | undefined,
  defaultField: { show: boolean; color: string; editable: boolean; value?: string }
): { show: boolean; color: string; editable: boolean; value?: string } {
  return {
    show: field?.show ?? defaultField.show,
    color: field?.color ?? defaultField.color,
    editable: defaultField.editable,
    value: field?.value ?? defaultField.value,
  };
}
