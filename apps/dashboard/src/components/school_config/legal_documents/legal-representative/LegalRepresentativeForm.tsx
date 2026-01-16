import { ContainerError } from '@cometa/recreo';
import { Label, Input } from '@cometa/recreo/v2';
import { InputField } from '@cometa/recreo/components/ui/InputField';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDateSchema } from '../../../../utils/date-utils';
import { BaseLegalDocumentForm } from '../shared/BaseLegalDocumentForm';
import { LegalDocumentFileUploader } from '../shared/LegalDocumentFileUploader';
import { FileType, FORM_STYLES } from '../../../../constants/legalDocuments';

// CURP format: 4 letters (initial + first vowel of first name + initials of last names) + 6 digits (YYMMDD birth date) +
// 1 letter (H/M for sex) + 2 letters (state code) + 3 consonants (from names) + 2 characters (homoclave: letter/digit + digit)
const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

const legalRepresentativeSchema = z.object({
  legal_representative_name: z.string().min(1, 'El nombre es requerido'),
  legal_representative_last_name: z.string().min(1, 'Los apellidos son requeridos'),
  legal_representative_curp: z
    .string()
    .min(1, 'El CURP es requerido')
    .transform((val) => val.toUpperCase())
    .refine((val) => curpRegex.test(val), 'El formato del CURP no es válido'),
  legal_representative_birth_date: createDateSchema({
    isRequired: true,
    allowFuture: false,
    fieldName: 'fecha de nacimiento',
  }),
});

type LegalRepresentativeFormData = z.infer<typeof legalRepresentativeSchema>;

export type LegalRepresentative = LegalRepresentativeFormData & {
  files: File[];
};

type LegalRepresentativeFormProps = {
  onClose: () => void;
  onSave: (representative: LegalRepresentative) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<LegalRepresentativeFormData>;
};

export function LegalRepresentativeForm({
  onClose,
  onSave,
  isLoading = false,
  initialData,
}: Readonly<LegalRepresentativeFormProps>) {
  const [frontFiles, setFrontFiles] = useState<File[]>([]);
  const [backFiles, setBackFiles] = useState<File[]>([]);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LegalRepresentativeFormData>({
    resolver: zodResolver(legalRepresentativeSchema),
    mode: 'onChange',
    defaultValues: {
      legal_representative_name: initialData?.legal_representative_name || '',
      legal_representative_last_name: initialData?.legal_representative_last_name || '',
      legal_representative_curp: initialData?.legal_representative_curp || '',
      legal_representative_birth_date: initialData?.legal_representative_birth_date || '',
    },
  });

  const onSubmit = async (formData: LegalRepresentativeFormData) => {
    let hasError = false;

    if (frontFiles.length === 0) {
      setFrontError('Debes subir el frente de la INE o IFE');
      hasError = true;
    }

    if (backFiles.length === 0) {
      setBackError('Debes subir el reverso de la INE o IFE');
      hasError = true;
    }

    if (hasError) return;

    await onSave({
      ...formData,
      files: [...frontFiles, ...backFiles],
    });
    onClose();
  };

  const handleCancel = () => {
    setFrontFiles([]);
    setBackFiles([]);
    setFrontError(null);
    setBackError(null);
    onClose();
  };

  return (
    <BaseLegalDocumentForm
      title="Representante legal"
      onClose={handleCancel}
      isLoading={isLoading}
      onSubmit={handleSubmit(onSubmit)}
      info="INE o IFE del representante legal de la escuela (frente y reverso)"
    >
      <div className="flex flex-col gap-6">
        <LegalDocumentFileUploader
          id="legal-representative-front"
          label="Frente de la INE o IFE"
          onFilesChange={(newFiles) => {
            setFrontFiles(newFiles);
            if (newFiles.length > 0) {
              setFrontError(null);
            }
          }}
          maxFiles={1}
          fileType={FileType.IMAGE}
          helperText="Archivos permitidos: .jpg, .jpeg, .png (Máximo 20 MB)"
          error={frontError}
          pdfPreview={false}
        />

        <LegalDocumentFileUploader
          id="legal-representative-back"
          label="Reverso de la INE o IFE"
          onFilesChange={(newFiles) => {
            setBackFiles(newFiles);
            if (newFiles.length > 0) {
              setBackError(null);
            }
          }}
          maxFiles={1}
          fileType={FileType.IMAGE}
          helperText="Archivos permitidos: .jpg, .jpeg, .png (Máximo 20 MB)"
          error={backError}
          pdfPreview={false}
        />
      </div>

      <div className={FORM_STYLES.separator} />

      <div className={FORM_STYLES.inputGroup}>
        <h3 className={FORM_STYLES.sectionTitle}>Datos del Representante Legal</h3>
        <p className="text-sm text-[#637381] leading-5">Ingresa los siguientes datos del Representante legal</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className={FORM_STYLES.inputGroup}>
          <Label htmlFor="legal_representative_name" className={FORM_STYLES.label}>
            Nombres
          </Label>
          <Controller
            name="legal_representative_name"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                placeholder="Ingresa el nombre"
                className="w-full"
                isError={!!errors.legal_representative_name}
              />
            )}
          />
          <ContainerError error={errors.legal_representative_name?.message as string} />
        </div>

        <div className={FORM_STYLES.inputGroup}>
          <Label htmlFor="legal_representative_last_name" className={FORM_STYLES.label}>
            Apellidos
          </Label>
          <Controller
            name="legal_representative_last_name"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                placeholder="Ingresa los apellidos"
                className="w-full"
                isError={!!errors.legal_representative_last_name}
              />
            )}
          />
          <ContainerError error={errors.legal_representative_last_name?.message as string} />
        </div>

        <div className={FORM_STYLES.inputGroup}>
          <Label htmlFor="legal_representative_curp" className={FORM_STYLES.label}>
            CURP
          </Label>
          <Controller
            name="legal_representative_curp"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                placeholder="Ingresa el CURP"
                className="w-full"
                isError={!!errors.legal_representative_curp}
                maxLength={18}
              />
            )}
          />
          <ContainerError error={errors.legal_representative_curp?.message as string} />
        </div>

        <div className={FORM_STYLES.inputGroup}>
          <Label htmlFor="legal_representative_birth_date" className={FORM_STYLES.label}>
            Fecha de nacimiento
          </Label>
          <Controller
            name="legal_representative_birth_date"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                id="legal_representative_birth_date"
                isError={!!errors.legal_representative_birth_date}
                className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
              />
            )}
          />
          <ContainerError error={errors.legal_representative_birth_date?.message as string} />
        </div>
      </div>
    </BaseLegalDocumentForm>
  );
}
