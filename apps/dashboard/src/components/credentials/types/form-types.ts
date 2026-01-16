import { z } from 'zod';
import type { CredentialConfig } from '../types';
import { CredentialTemplateType } from '@cometa/trpc/src/students/types';

/**
 * Form data structure that includes all credential config fields plus file state
 */
export type CredentialFormData = CredentialConfig & {
  signatureFile: File | null;
  digitalSealFile: File | null;
  originalSignatureFileId: string | null;
  originalDigitalSealFileId: string | null;
};

/**
 * Zod validation schema for credential form
 */
export const credentialFormSchema = z.object({
  templateName: z.string().min(1, 'El nombre de la plantilla es requerido'),
  type: z.nativeEnum(CredentialTemplateType),
  orientation: z.enum(['portrait', 'landscape']),
  color_scheme: z.object({
    background: z.object({
      primary: z.string(),
      secondary: z.string(),
    }),
    text_color: z.string(),
  }),
  front_fields: z.object({
    name: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    last_name: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    enrollment_code: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    identifier: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    school_cycle: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    expires_at: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    cct_identifier: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    level: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    grade: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
  }),
  back_fields: z.object({
    free_text: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      value: z.string().optional(),
    }),
    signature: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      file_id: z.string().optional(),
    }),
    digital_seal: z.object({
      show: z.boolean(),
      color: z.string(),
      editable: z.boolean(),
      file_id: z.string().optional(),
    }),
  }),
  signatureFile: z.instanceof(File).nullable(),
  digitalSealFile: z.instanceof(File).nullable(),
  originalSignatureFileId: z.string().nullable(),
  originalDigitalSealFileId: z.string().nullable(),
});
