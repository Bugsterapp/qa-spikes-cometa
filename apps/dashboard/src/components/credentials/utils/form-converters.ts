import type { CredentialConfig } from '../types';
import type { CredentialFormData } from '../types/form-types';

type FileState = {
  signatureFile?: File | null;
  digitalSealFile?: File | null;
  originalSignatureFileId?: string | null;
  originalDigitalSealFileId?: string | null;
};

/**
 * Converts CredentialConfig to CredentialFormData (for react-hook-form)
 */
export function convertConfigToFormData(config: CredentialConfig, files: FileState = {}): CredentialFormData {
  return {
    ...config,
    signatureFile: files.signatureFile ?? null,
    digitalSealFile: files.digitalSealFile ?? null,
    originalSignatureFileId: files.originalSignatureFileId ?? null,
    originalDigitalSealFileId: files.originalDigitalSealFileId ?? null,
  };
}

/**
 * Converts CredentialFormData back to CredentialConfig (removes file state)
 */
export function convertFormDataToConfig(formData: CredentialFormData): CredentialConfig {
  const {
    signatureFile: _signatureFile,
    digitalSealFile: _digitalSealFile,
    originalSignatureFileId: _originalSignatureFileId,
    originalDigitalSealFileId: _originalDigitalSealFileId,
    ...config
  } = formData;

  return config;
}
