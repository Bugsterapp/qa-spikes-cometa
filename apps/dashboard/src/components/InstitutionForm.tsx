import { useState, forwardRef, useImperativeHandle, useMemo, Ref, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { parsePhoneNumber } from 'libphonenumber-js';
import { InputField } from '@cometa/recreo/components/ui/InputField';
import { Button } from '@cometa/recreo/v2';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { PhoneInput } from '@cometa/recreo/components/PhoneInput';
import { isRequired, isValidEmail } from '../utils/validations';
import validator from '../utils/validator';
import { changeMultipleErrors } from '../utils/errorsMessages';

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MIME_TYPE_REGEX = /^image\/(jpeg|jpg|png)$/;

export type InstitutionFormValues = {
  name: string;
  phone: string;
  email: string;
};

export type InstitutionFormProps = {
  initialValues?: Partial<InstitutionFormValues>;
  onSubmit: (form: InstitutionFormValues, logoFile?: File) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  existingLogo?: string;
  cachedLogoFile?: File | null;
  showNameField?: boolean;
  showActions?: boolean;
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  triggerReset?: boolean;
  onResetTriggered?: () => void;
};

function InstitutionFormComponent(
  {
    initialValues = {},
    onSubmit,
    onCancel,
    isLoading = false,
    isEditing = true,
    existingLogo,
    cachedLogoFile,
    showNameField = true,
    showActions = false,
    className = '',
    submitButtonText = 'Guardar',
    cancelButtonText = 'Cancelar',
    triggerReset = false,
    onResetTriggered,
  }: InstitutionFormProps,
  ref: Ref<InstitutionFormRef>
) {
  const [logoFiles, setLogoFiles] = useState<File[]>(cachedLogoFile ? [cachedLogoFile] : []);
  const [fileUploaderKey, setFileUploaderKey] = useState(0);
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  const [fileError, setFileError] = useState<string>('');
  const [isFileLoading, setIsFileLoading] = useState(!!existingLogo);

  const validationRules = {
    email: [isRequired, isValidEmail],
    phone: [isRequired, isValidPhoneNumber],
    ...(showNameField && { name: [isRequired] }),
  };

  const defaultValues = useMemo(
    (): InstitutionFormValues => ({
      name: initialValues.name ?? '',
      phone: initialValues.phone ?? '',
      email: initialValues.email ?? '',
    }),
    [initialValues]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    clearErrors,
    reset,
  } = useForm<InstitutionFormValues>({
    mode: 'onChange',
    defaultValues: defaultValues,
    resolver: async (values) => {
      const validationErrors = validator(validationRules, values);
      const hasErrors = Object.keys(validationErrors).length > 0;
      const formattedErrors = convertValidationErrorsToReactHookFormFormat(validationErrors);

      return {
        values: hasErrors ? {} : values,
        errors: formattedErrors,
      };
    },
  });

  const onFormSubmit = async (form: InstitutionFormValues) => {
    const logoFile = logoFiles.length > 0 && hasLogoChanged ? logoFiles[0] : undefined;
    await onSubmit(form, logoFile);
  };

  const resetForm = useCallback(() => {
    setPhoneInputKey((prev) => prev + 1);
    reset(defaultValues);
    clearErrors();
    setLogoFiles([]);
    setHasLogoChanged(false);
    setFileUploaderKey((prev) => prev + 1);
    setFileError('');
    setIsFileLoading(false);
  }, [defaultValues, reset, clearErrors]);

  useImperativeHandle(ref, () => ({
    resetForm,
    submitForm: () => handleSubmit(onFormSubmit)(),
    isValid,
  }));

  useEffect(() => {
    if (triggerReset) {
      resetForm();
      onResetTriggered?.();
    }
  }, [triggerReset, onResetTriggered, resetForm]);

  return (
    <div className={`flex flex-col gap-8 w-full ${className}`}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col items-start gap-8 w-full">
        {showNameField && (
          <div className="flex flex-col items-start gap-6 w-full">
            <div className="flex flex-col items-start gap-1 w-full">
              <h3 className="w-full text-[#22283A] font-lota text-lg font-bold leading-7">Nombre de la institución</h3>
              <p className="w-full text-[#697086] font-lota text-base font-normal leading-6">
                Este nombre será visible para ti y tus usuarios en la plataforma.
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 w-full">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputField
                    name="name"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ingresa el nombre de tu institución"
                    disabled={!isEditing}
                    className="w-full"
                    isError={!!errors.name}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{changeMultipleErrors(errors.name.message as string)}</p>
              )}
            </div>
            <div className="w-full h-px bg-[#EDF2FC]" />
          </div>
        )}

        <div className="flex flex-col items-start gap-6 w-full">
          <div className="flex flex-col items-start gap-1 w-full">
            <h3 className="w-full text-[#22283A] font-lota text-lg font-bold leading-7">Logo de tu institución</h3>
            <p className="w-full text-[#697086] font-lota text-base font-normal leading-6">
              Este logo aparecerá en los recibos y facturas enviadas.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <FileUploader
              key={`logo-uploader-${fileUploaderKey}`}
              id="logo-uploader"
              multiple={false}
              required={false}
              maxFiles={1}
              maxFileSize={MAX_LOGO_FILE_SIZE}
              acceptedFileTypes={ALLOWED_FILE_TYPES}
              disabled={!isEditing}
              preview
              pdfPreview={false}
              initialFiles={(() => {
                if (cachedLogoFile) return [cachedLogoFile];
                if (existingLogo) return [existingLogo];
                return [];
              })()}
              onFilesChange={(files: File[], isValid: boolean) => {
                setFileError('');
                setIsFileLoading(false);

                if (files.length > 0) {
                  const file = files[0];

                  if (!validateFileType(file)) {
                    setFileError('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, JPEG y PNG.');
                    return;
                  }

                  if (!validateFileSize(file)) {
                    setFileError(`El archivo es demasiado grande. Máximo ${MAX_LOGO_FILE_SIZE / 1024 / 1024}MB.`);
                    return;
                  }

                  if (isValid) {
                    setLogoFiles(files);
                    setHasLogoChanged(true);
                  }
                } else {
                  setLogoFiles([]);
                  setHasLogoChanged(false);
                }
              }}
              helperText="Archivos permitidos: .jpg, .jpeg, .png (Máximo 10 MB)"
              placeholder="Arrastra el logo o <span class='text-blue-600 font-bold cursor-pointer underline font-lota'>haz click aquí</span> para seleccionarlo"
              className="w-full"
            />

            {!isFileLoading && fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
          </div>
          <div className="w-full h-px bg-[#EDF2FC]" />
        </div>

        <div className="flex flex-col items-start gap-6 w-full">
          <div className="flex flex-col items-start gap-1 w-full">
            <h3 className="w-full text-[#22283A] font-lota text-lg font-bold leading-7">Contacto de la institución</h3>
            <p className="w-full text-[#697086] font-lota text-base font-normal leading-6">
              Datos de la persona de contacto principal para consultas relacionadas con la institución.
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 w-full">
            <div className="flex flex-col items-start gap-1 w-full">
              <h4 className="text-base font-normal text-[#212B36] font-lota">Teléfono</h4>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    key={`phone-input-${phoneInputKey}`}
                    ignoreValidation
                    initialValue={field.value}
                    onChange={(value) => {
                      if (value.number.length >= 3) {
                        setValue('phone', value.number, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onRawValueChange={(rawValue) => {
                      if (rawValue.length < 3) {
                        setValue('phone', rawValue, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    label=""
                    disabled={!isEditing}
                    className="w-full"
                    error={changeMultipleErrors(errors.phone?.message as string)}
                  />
                )}
              />
            </div>

            <div className="flex flex-col items-start gap-1 w-full">
              <h4 className="text-base font-normal text-[#212B36] font-lota">Correo electrónico</h4>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    name="email"
                    value={field.value}
                    onChange={field.onChange}
                    type="email"
                    placeholder="Ingresa un correo"
                    disabled={!isEditing}
                    className="w-full"
                    isError={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{changeMultipleErrors(errors.email.message as string)}</p>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex justify-end gap-3 w-full">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onCancel}
                disabled={isLoading}
                className="hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
              >
                {cancelButtonText}
              </Button>
            )}
            <Button
              type="submit"
              variant="neutral"
              size="default"
              disabled={isLoading || !isValid}
              className="bg-[#22283a] text-white hover:bg-[#22283a]/90 transition-colors duration-200"
            >
              {isLoading ? 'Guardando...' : submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export const InstitutionForm = forwardRef<InstitutionFormRef, InstitutionFormProps>(InstitutionFormComponent);

export type InstitutionFormRef = {
  resetForm: () => void;
  submitForm: () => void;
  isValid: boolean;
};

function convertValidationErrorsToReactHookFormFormat(validationErrors: Record<string, string>) {
  return Object.fromEntries(Object.entries(validationErrors).map(([key, value]) => [key, { message: value }]));
}

function validateFileType(file: File): boolean {
  return MIME_TYPE_REGEX.test(file.type) && ALLOWED_FILE_TYPES.includes(file.type);
}

function validateFileSize(file: File): boolean {
  return file.size <= MAX_LOGO_FILE_SIZE;
}

function isValidPhoneNumber(val: string) {
  if (!val) return true;

  try {
    const phoneNumber = parsePhoneNumber(val);
    return phoneNumber.isValid() || 'Ingresa un número de teléfono válido';
  } catch {
    return 'Ingresa un número de teléfono válido';
  }
}
