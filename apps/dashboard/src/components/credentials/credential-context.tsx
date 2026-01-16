import { createContext, useContext } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CredentialConfig, CredentialSide, SchoolData, StudentData } from './types';
import type { CredentialFormData } from './types/form-types';

type CredentialContextValue = {
  // React Hook Form
  formMethods: UseFormReturn<CredentialFormData>;
  isDirty: boolean;
  isValid: boolean;

  // Config (derived from form for backward compatibility)
  config: CredentialConfig;
  setConfig: (config: CredentialConfig) => void;
  updateConfig: (updates: Partial<CredentialConfig>) => void;

  // UI state
  side: CredentialSide;
  setSide: (side: CredentialSide) => void;
  toggleSide: () => void;

  // Data
  studentData: StudentData;
  schoolData: SchoolData;

  // File handlers
  signatureFile: File | null;
  setSignatureFile: (file: File | null) => void;
  digitalSealFile: File | null;
  setDigitalSealFile: (file: File | null) => void;

  // API operations
  createTemplate: (onSuccess?: () => void) => Promise<void>;
  updateTemplate: (onSuccess?: () => void) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  duplicateFromTemplate: (sourceTemplateId: string) => Promise<void>;

  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isLoading: boolean;

  // Error states
  createError: string | null;
  updateError: string | null;
  loadError: string | null;

  // Current template
  currentTemplateId: string | null;
};

const CredentialContext = createContext<CredentialContextValue | null>(null);

export { CredentialContext };

export function useCredential() {
  const context = useContext(CredentialContext);
  if (!context) {
    throw new Error('useCredential must be used within a CredentialProvider');
  }
  return context;
}
