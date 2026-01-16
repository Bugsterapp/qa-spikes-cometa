import { FileField } from './shared/file-field';
import { TextEditorField } from './shared/text-editor-field';
import { CREDENTIAL_FIELD_LABELS, type CredentialConfig } from './types';
import { useCredential } from './credential-context';

type BackConfigurationProps = {
  config: CredentialConfig;
  onConfigChange: (config: CredentialConfig) => void;
};

type BackFieldKey = keyof CredentialConfig['back_fields'];

export function BackConfiguration({ config, onConfigChange }: BackConfigurationProps) {
  const { signatureFile, setSignatureFile, digitalSealFile, setDigitalSealFile } = useCredential();

  function handleFieldToggle(field: BackFieldKey, enabled: boolean) {
    onConfigChange({
      ...config,
      back_fields: {
        ...config.back_fields,
        [field]: {
          ...config.back_fields[field],
          show: enabled,
        },
      },
    });
  }

  function handleSignatureFilesChange(files: File[]) {
    const file = files.length > 0 ? files[0] : null;
    setSignatureFile(file);
  }

  function handleDigitalSealFilesChange(files: File[]) {
    const file = files.length > 0 ? files[0] : null;
    setDigitalSealFile(file);
  }

  function handleFreeTextChange(value: string) {
    onConfigChange({
      ...config,
      back_fields: {
        ...config.back_fields,
        free_text: {
          ...config.back_fields.free_text,
          value,
        },
      },
    });
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <FileField
        id="field-signature"
        label={CREDENTIAL_FIELD_LABELS.signature}
        isEnabled={config.back_fields.signature.show}
        onToggle={(enabled) => handleFieldToggle('signature', enabled)}
        files={signatureFile ? [signatureFile] : []}
        onFilesChange={handleSignatureFilesChange}
        placeholder={FILE_FIELD_PLACEHOLDER}
      />

      <FileField
        id="field-digital_seal"
        label={CREDENTIAL_FIELD_LABELS.digital_seal}
        isEnabled={config.back_fields.digital_seal.show}
        onToggle={(enabled) => handleFieldToggle('digital_seal', enabled)}
        files={digitalSealFile ? [digitalSealFile] : []}
        onFilesChange={handleDigitalSealFilesChange}
        placeholder={FILE_FIELD_PLACEHOLDER}
      />

      <TextEditorField
        id="field-free_text"
        label={CREDENTIAL_FIELD_LABELS.free_text}
        isEnabled={config.back_fields.free_text.show}
        onToggle={(enabled) => handleFieldToggle('free_text', enabled)}
        value={config.back_fields.free_text.value || ''}
        onChange={handleFreeTextChange}
      />
    </div>
  );
}

const FILE_FIELD_PLACEHOLDER =
  'Arrastra el archivo o <span class="text-blue-600 font-bold cursor-pointer underline">haz click aquí</span> seleccionarlo desde tu computadora';
