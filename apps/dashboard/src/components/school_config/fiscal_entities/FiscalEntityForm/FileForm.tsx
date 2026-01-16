import { useState } from 'react';
import { ContainerError } from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { Button, Input, Label } from '@cometa/recreo/v2';
import { BotFiscalEntityDTO } from '@cometa/trpc/src/bot/types';
import { UseFormRegister, UseFormSetValue, UseFormClearErrors, FieldErrors, UseFormWatch } from 'react-hook-form';
import { useFiscalEntityForm } from '../../../../stores/fiscalEntityFormStore';
import { serializableFormatToFile } from '../../../../utils/file-utils';
import { CertificateExtractedDisplay } from './CertificateExtractedDisplay';
import { FiscalEntityForm } from './types';
import IcEyeOff from 'public/assets/icons/ic_eye_outline-off.svg';
import IcEyeOn from 'public/assets/icons/ic_eye_outline-on.svg';
import IcDownload from 'public/assets/icons/ic_download.svg';
import { MAX_FILE_SIZE } from '../../../../constants/legalDocuments';

type FileFormProps = {
  register: UseFormRegister<FiscalEntityForm>;
  errors: FieldErrors<FiscalEntityForm>;
  setValue: UseFormSetValue<FiscalEntityForm>;
  clearErrors: UseFormClearErrors<FiscalEntityForm>;
  watch: UseFormWatch<FiscalEntityForm>;
  isEditing: boolean;
  fiscalEntity?: BotFiscalEntityDTO | null;
  onCertificateUpload: (files: File[]) => Promise<void>;
  onDownloadFile: (url: string, filename: string) => Promise<void>;
};

export function FileForm({
  register,
  errors,
  clearErrors,
  watch,
  isEditing,
  fiscalEntity,
  onCertificateUpload,
  onDownloadFile,
}: Readonly<FileFormProps>) {
  const { files, storeFile } = useFiscalEntityForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[#22283a] text-lg font-semibold">Certificado de Sello Digital</h3>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h4 className="text-[#22283a] text-base font-semibold">Constancia de situación fiscal (CSF)</h4>
          <p className="text-[#444c60] text-sm">
            La fecha de emisión no debe ser de más de 2 meses de antigüedad. En caso de no facturar, compartir tu CSF
            personal
          </p>
        </div>

        {isEditing && fiscalEntity?.fiscal_entity_file_url && (
          <DownloadButton
            url={fiscalEntity.fiscal_entity_file_url}
            filename="constancia-situacion-fiscal.pdf"
            onDownload={onDownloadFile}
          >
            Descargar CSF enviada anteriormente
          </DownloadButton>
        )}

        <FileUploader
          id="fiscal-entity-file"
          acceptedFileTypes={['application/pdf']}
          onFilesChange={(files) => {
            const file = files[0] || null;
            if (file) {
              clearErrors('fiscal_entity_file');
            }
            storeFile('fiscal_entity_file', file);
          }}
          helperText="Archivos permitidos: .pdf (Máximo 500 KB)"
          size="large"
          maxFiles={1}
          multiple={false}
          preview
          maxFileSize={MAX_FILE_SIZE}
          required={!isEditing}
          visualizer
          readOnly={false}
          className="rounded-xl"
          initialFiles={files.fiscal_entity_file ? [serializableFormatToFile(files.fiscal_entity_file)] : []}
        />
        <ContainerError error={errors.fiscal_entity_file?.message as string} />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[#22283a] text-base font-semibold">Adjunta tu CSD (.key)</h4>

        {isEditing && fiscalEntity?.csd_key_file_url && (
          <DownloadButton url={fiscalEntity.csd_key_file_url} filename="csd-key.key" onDownload={onDownloadFile}>
            Descargar archivo .key enviado anteriormente
          </DownloadButton>
        )}

        <FileUploader
          id="csd-key-file"
          onFilesChange={(files) => {
            const file = files[0] || null;
            if (file) {
              clearErrors('csd_key_file');
            }
            storeFile('csd_key_file', file);
          }}
          helperText="Archivo de llave privada CSD (.key) (Máximo 500 KB)"
          size="large"
          maxFiles={1}
          multiple={false}
          maxFileSize={MAX_FILE_SIZE}
          required={!isEditing}
          readOnly={false}
          className="rounded-xl"
          acceptedFileSuffixes={['.key']}
          initialFiles={files.csd_key_file ? [serializableFormatToFile(files.csd_key_file)] : []}
        />
        <ContainerError error={errors.csd_key_file?.message as string} />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[#22283a] text-base font-semibold">Adjunta tu CSD (.cer)</h4>

        {isEditing && fiscalEntity?.csd_certificate_file_url && (
          <DownloadButton
            url={fiscalEntity.csd_certificate_file_url}
            filename="csd-certificate.cer"
            onDownload={onDownloadFile}
          >
            Descargar archivo .cer enviado anteriormente
          </DownloadButton>
        )}

        <FileUploader
          id="csd-certificate-file"
          onFilesChange={onCertificateUpload}
          helperText="Archivo de certificado CSD (.cer) (Máximo 500 KB)"
          size="large"
          maxFiles={1}
          multiple={false}
          maxFileSize={MAX_FILE_SIZE}
          required={!isEditing}
          readOnly={false}
          className="rounded-xl"
          acceptedFileSuffixes={['.cer']}
          initialFiles={files.csd_certificate_file ? [serializableFormatToFile(files.csd_certificate_file)] : []}
        />
        <ContainerError error={errors.csd_certificate_file?.message as string} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-[#22283a] text-base font-normal">Contraseña CSD</Label>
        <div className="relative">
          <Input
            {...register('csd_password')}
            id="csd_password"
            type={showPassword ? 'text' : 'password'}
            isError={!!errors.csd_password}
            style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
            placeholder=""
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors shrink-0"
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <IcEyeOn className="w-6 h-6 -ml-0.5" /> : <IcEyeOff className="w-6 h-6 -ml-0.5" />}
          </Button>
        </div>
        <ContainerError error={errors.csd_password?.message as string} />
      </div>

      {watch('tax_id') && watch('name') && files.csd_certificate_file && (
        <CertificateExtractedDisplay
          taxId={watch('tax_id')}
          name={watch('name')}
          issuedAt={watch('issued_at')}
          expiresAt={watch('expires_at')}
          className="mt-4"
        />
      )}
    </div>
  );
}

type DownloadButtonProps = {
  url: string;
  filename: string;
  children: React.ReactNode;
  onDownload: (url: string, filename: string) => void | Promise<void>;
};

function DownloadButton({ url, filename, children, onDownload }: Readonly<DownloadButtonProps>) {
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => onDownload(url, filename)}
        className="inline-flex items-center gap-2 text-sm text-[#3366FF] hover:text-[#1890FF] transition-colors duration-150 font-medium bg-transparent border-none cursor-pointer p-0"
      >
        <IcDownload className="w-4 h-4" />
        {children}
      </button>
    </div>
  );
}
