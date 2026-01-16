import { ContainerError } from '@cometa/recreo';
import { Label, Input } from '@cometa/recreo/v2';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFileTypeValidation } from '../../../../hooks/useFileTypeValidation';
import { createDateSchema } from '../../../../utils/date-utils';
import { BaseLegalDocumentForm } from '../shared/BaseLegalDocumentForm';
import { LegalDocumentFileUploader } from '../shared/LegalDocumentFileUploader';
import { FORM_STYLES } from '../../../../constants/legalDocuments';

const proofOfAddressSchema = z.object({
  proof_of_address_issued_at: createDateSchema({
    isRequired: true,
    allowFuture: false,
    maxAgeMonths: 2,
    fieldName: 'fecha de emisión',
  }),
});

type ProofOfAddressFormData = z.infer<typeof proofOfAddressSchema>;

type ProofOfAddressFormProps = {
  onClose: () => void;
  onSave: (data: { files: File[]; issuedAt: string }) => Promise<void>;
  isLoading?: boolean;
  initialDate?: string;
};

export function ProofOfAddressForm({
  onClose,
  onSave,
  isLoading = false,
  initialDate = '',
}: Readonly<ProofOfAddressFormProps>) {
  const {
    files,
    isValid,
    fileType,
    validationError,
    handleFilesChange,
    resetFiles,
    getHelperText,
    setValidationError,
  } = useFileTypeValidation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProofOfAddressFormData>({
    resolver: zodResolver(proofOfAddressSchema),
    mode: 'onChange',
    defaultValues: {
      proof_of_address_issued_at: initialDate,
    },
  });

  const onSubmit = async (formData: ProofOfAddressFormData) => {
    if (files.length === 0) {
      setValidationError('Debes subir al menos un archivo');
      return;
    }

    if (!isValid) return;

    await onSave({
      files,
      issuedAt: formData.proof_of_address_issued_at,
    });
    onClose();
  };

  const handleCancel = () => {
    resetFiles();
    onClose();
  };

  return (
    <BaseLegalDocumentForm
      title="Comprobante de domicilio"
      onClose={handleCancel}
      isLoading={isLoading}
      onSubmit={handleSubmit(onSubmit)}
      info="Puede ser un recibo de Luz, Agua, Teléfono, etc. Y debe tener un máximo 2 meses de antigüedad, de lo contrario será necesario cargarlo nuevamente. Puedes subir archivos PDF o imágenes (máximo 20 MB), pero no puedes mezclar ambos tipos."
    >
      <LegalDocumentFileUploader
        id="proof-of-address"
        onFilesChange={handleFilesChange}
        maxFiles={5}
        fileType={fileType}
        helperText={getHelperText(fileType)}
        error={validationError}
      />

      <div className={FORM_STYLES.inputGroup}>
        <Label htmlFor="proof_of_address_issued_at" className={FORM_STYLES.label}>
          Fecha de emisión del comprobante de domicilio
        </Label>
        <Controller
          name="proof_of_address_issued_at"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="proof_of_address_issued_at"
              type="date"
              isError={!!errors.proof_of_address_issued_at}
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
          )}
        />
        <ContainerError error={errors.proof_of_address_issued_at?.message as string} />
      </div>
    </BaseLegalDocumentForm>
  );
}
