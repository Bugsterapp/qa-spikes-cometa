import { useState } from 'react';
import { BotFiscalEntityDTO, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { EntityType, getStatusDisplay, getStatusTooltip, getStatusVariant } from '../../../utils/onboarding-status';
import { Button, Input, Label } from '@cometa/recreo/v2';
import { Tooltip } from '../../atoms/Tooltip';
import { Chip, ContainerError } from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import SidebarActions from '../../atoms/SidebarActions';
import { ErrorBanner } from '../../atoms/ErrorBanner';
import taxRegimeValues from '../../../utils/static_data/taxRegimeValues';
import { formatDateShort } from '../../../utils/general';
import IcDownload from 'public/assets/icons/ic_download.svg';
import IcEyeOn from 'public/assets/icons/ic_eye_outline-on.svg';
import IcEyeOff from 'public/assets/icons/ic_eye_outline-off.svg';
import IcOctagonAlert from 'public/assets/icons/ic_octagon_alert.svg';
import IcWarningTriangle from 'public/assets/icons/ic_warning_triangle.svg';
import { api } from '../../../utils/api';
import useAlert from '../../../hooks/useAlert';
import { fileToSerializableFormat } from '../../../utils/file-utils';
import { checkIfExpiring, checkIfExpired } from '../../../utils/csd-utils';
import { MAX_FILE_SIZE } from '../../../constants/legalDocuments';

type FiscalEntityDetailsDrawerProps = {
  fiscalEntity: BotFiscalEntityDTO | null;
  onClose: () => void;
  onDelete?: (fiscalEntity: BotFiscalEntityDTO) => void;
  onCSDUpdate?: () => void;
};

export function FiscalEntityDetailsDrawer({
  fiscalEntity,
  onClose,
  onDelete,
  onCSDUpdate,
}: Readonly<FiscalEntityDetailsDrawerProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showCSDPassword, setShowCSDPassword] = useState(false);
  const [csdKeyFile, setCsdKeyFile] = useState<File | null>(null);
  const [csdCertFile, setCsdCertFile] = useState<File | null>(null);
  const [csdPassword, setCsdPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    keyFile: '',
    certFile: '',
    password: '',
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const { setAlertState } = useAlert();
  const utils = api.useUtils();

  const updateCSDMutation = api.backoffice.updateCSD.useMutation({
    onSuccess: () => {
      void utils.bot.getFiscalEntities.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Se ha enviado la solicitud de actualización correctamente',
      });
      setValidationErrors({ keyFile: '', certFile: '', password: '' });
      setApiError(null);
      onCSDUpdate?.();
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.message || 'Error al actualizar el certificado';
      setApiError(errorMessage);
      setValidationErrors({ keyFile: '', certFile: '', password: '' });
    },
  });

  if (!fiscalEntity) return null;

  const displayName = fiscalEntity.name;
  const isPendingReview = fiscalEntity.status === OnboardingStatus.Pending;
  const isApproved = fiscalEntity.status === OnboardingStatus.Approved;
  const taxRegimeName = getTaxRegimeName(fiscalEntity.taxing_system_name);

  const certificateExpiry = fiscalEntity.certificate_expiry;
  const isExpiring = checkIfExpiring(certificateExpiry);
  const isExpired = checkIfExpired(certificateExpiry);
  const showCSDUpdateForm = isApproved && (isExpiring || isExpired);
  const formattedExpirationDate = certificateExpiry ? formatDateShort(certificateExpiry, true) : '';

  const handleDelete = () => {
    onDelete?.(fiscalEntity);
  };

  const handleDownloadFile = (fileUrl: string | null | undefined, fileName: string) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveCSD = async () => {
    const errors = {
      keyFile: !csdKeyFile ? 'Por favor selecciona el archivo .key' : '',
      certFile: !csdCertFile ? 'Por favor selecciona el archivo .cer' : '',
      password: !csdPassword ? 'Por favor ingresa la contraseña' : '',
    };

    setValidationErrors(errors);
    setApiError(null);

    if (errors.keyFile || errors.certFile || errors.password || !csdKeyFile || !csdCertFile) {
      return;
    }

    const serializedKeyFile = await fileToSerializableFormat(csdKeyFile);
    const serializedCertFile = await fileToSerializableFormat(csdCertFile);

    updateCSDMutation.mutate({
      fiscalEntityId: fiscalEntity.tax_id,
      csd_key_file: serializedKeyFile,
      csd_certificate_file: serializedCertFile,
      csd_password: csdPassword,
    });
  };

  const handleDiscard = () => {
    setCsdKeyFile(null);
    setCsdCertFile(null);
    setCsdPassword('');
    setValidationErrors({ keyFile: '', certFile: '', password: '' });
    setApiError(null);
    onClose();
  };

  return (
    <>
      <SidebarHeader
        title="Entidad fiscal"
        onClose={onClose}
        boxClassName="border-b border-gray-300 px-8 py-4 rounded-t-lg"
        titleClassName="text-gray-900 text-lg font-semibold mr-2"
      />

      <div className="flex flex-col gap-6 p-8 bg-white overflow-y-auto flex-1 rounded-lg">
        <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-base font-semibold text-gray-900">{displayName}</h2>
          <div className="shrink-0">
            <Tooltip message={getStatusTooltip(fiscalEntity.status, EntityType.FiscalEntity)}>
              <Chip variant={getStatusVariant(fiscalEntity.status)}>{getStatusDisplay(fiscalEntity.status)}</Chip>
            </Tooltip>
          </div>
        </div>

        <SectionContainer title="Datos de identificación">
          <InfoField label="Razón social" value={fiscalEntity.name} />
          <InfoField label="RFC" value={fiscalEntity.tax_id} />
          <InfoField label="Régimen fiscal" value={taxRegimeName} />
          {fiscalEntity.certificate_expiry && (
            <InfoField
              label="Fecha de expiración del  certificado"
              value={formatDateShort(fiscalEntity.certificate_expiry, false)}
            />
          )}
        </SectionContainer>

        {showCSDUpdateForm && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Certificado de Sello Digital</h3>

            {apiError && <ErrorBanner message={apiError} />}

            <div
              className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                isExpired ? 'bg-[#ffefef] border-[#fe9696]' : 'bg-[#fff9e6] border-[#ffd559]'
              }`}
            >
              <div className="shrink-0 pt-[2px]">
                {isExpired ? (
                  <IcOctagonAlert className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <IcWarningTriangle className="w-[15px] h-[14px] text-[#8c6a04]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 grow">
                <p className={`font-lota font-bold text-sm ${isExpired ? 'text-[#8b3636]' : 'text-[#8c6a04]'}`}>
                  Tu CSD {isExpired ? 'venció' : 'vence'} el {formattedExpirationDate}.
                </p>
                <p className={`font-lota text-sm ${isExpired ? 'text-[#8b3636]' : 'text-[#8c6a04]'}`}>
                  {isExpired
                    ? 'Actualízalo para poder volver a emitir facturas.'
                    : 'Actualízalo antes de esa fecha para evitar interrupciones en tu facturación.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[#22283a] text-base font-semibold">Adjunta tu CSD (.key)</h4>

              <FileUploader
                id="csd-key-file-update"
                onFilesChange={(files) => {
                  setCsdKeyFile(files[0] || null);
                  if (validationErrors.keyFile) {
                    setValidationErrors((prev) => ({ ...prev, keyFile: '' }));
                  }
                  if (apiError) {
                    setApiError(null);
                  }
                }}
                helperText="Archivo de llave privada CSD (.key) (Máximo 500 KB)"
                size="large"
                maxFiles={1}
                multiple={false}
                maxFileSize={MAX_FILE_SIZE}
                required
                readOnly={false}
                className="rounded-xl"
                acceptedFileSuffixes={['.key']}
              />
              {validationErrors.keyFile && <ContainerError error={validationErrors.keyFile} />}
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[#22283a] text-base font-semibold">Adjunta tu CSD (.cer)</h4>

              <FileUploader
                id="csd-certificate-file-update"
                onFilesChange={(files) => {
                  setCsdCertFile(files[0] || null);
                  if (validationErrors.certFile) {
                    setValidationErrors((prev) => ({ ...prev, certFile: '' }));
                  }
                  if (apiError) {
                    setApiError(null);
                  }
                }}
                helperText="Archivo de certificado CSD (.cer) (Máximo 500 KB)"
                size="large"
                maxFiles={1}
                multiple={false}
                maxFileSize={MAX_FILE_SIZE}
                required
                readOnly={false}
                className="rounded-xl"
                acceptedFileSuffixes={['.cer']}
              />
              {validationErrors.certFile && <ContainerError error={validationErrors.certFile} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[#22283a] text-base font-normal">Contraseña CSD</Label>
              <div className="relative">
                <Input
                  id="csd_password_update"
                  type={showCSDPassword ? 'text' : 'password'}
                  value={csdPassword}
                  onChange={(e) => {
                    setCsdPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: '' }));
                    }
                    if (apiError) {
                      setApiError(null);
                    }
                  }}
                  isError={!!validationErrors.password}
                  style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
                  placeholder=""
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowCSDPassword(!showCSDPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors shrink-0"
                  title={showCSDPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showCSDPassword ? <IcEyeOn className="w-6 h-6 -ml-0.5" /> : <IcEyeOff className="w-6 h-6 -ml-0.5" />}
                </Button>
              </div>
              {validationErrors.password && <ContainerError error={validationErrors.password} />}
            </div>
          </div>
        )}

        {!isApproved && (
          <SectionContainer title="Certificado de Sello Digital">
            <FileField
              label="CSD (.cer)"
              fileUrl={fiscalEntity.csd_certificate_file_url}
              defaultFileName="certificado.cer"
              onDownload={handleDownloadFile}
            />
            <FileField
              label="CSD (.key)"
              fileUrl={fiscalEntity.csd_key_file_url}
              defaultFileName="llave.key"
              onDownload={handleDownloadFile}
            />
            <div className="flex items-center justify-between px-6 py-4 bg-white h-14 relative">
              <div className="flex items-center">
                <div className="w-[148px] text-sm text-gray-500 shrink-0">Contraseña CSD</div>
                <div className="text-base text-gray-900 font-medium">
                  {fiscalEntity.csd_password
                    ? showPassword
                      ? fiscalEntity.csd_password
                      : '************'
                    : 'No disponible'}
                </div>
              </div>
              {fiscalEntity.csd_password && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <IcEyeOn className="w-6 h-6 -ml-0.5" /> : <IcEyeOff className="w-6 h-6 -ml-0.5 " />}
                </Button>
              )}
            </div>
          </SectionContainer>
        )}

        {!isApproved && (
          <SectionContainer title="Datos de dirección">
            {fiscalEntity.state && <InfoField label="Estado" value={fiscalEntity.state} />}
            {fiscalEntity.postal_code && <InfoField label="Código postal" value={fiscalEntity.postal_code} />}
            {fiscalEntity.city && <InfoField label="Ciudad" value={fiscalEntity.city} />}
            {fiscalEntity.district && <InfoField label="Colonia" value={fiscalEntity.district} />}
            {fiscalEntity.address_name && <InfoField label="Calle" value={fiscalEntity.address_name} />}
            {fiscalEntity.address_number && <InfoField label="Número exterior" value={fiscalEntity.address_number} />}
          </SectionContainer>
        )}
      </div>

      {showCSDUpdateForm && (
        <SidebarActions variant="form">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDiscard}
            disabled={updateCSDMutation.isPending}
            className="text-[#7b35e8]"
          >
            Descartar
          </Button>
          <Button
            type="button"
            onClick={handleSaveCSD}
            disabled={updateCSDMutation.isPending}
            className="bg-[#873aff] hover:bg-[#7b35e8]"
          >
            {updateCSDMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </SidebarActions>
      )}

      {isPendingReview && !showCSDUpdateForm && (
        <SidebarActions variant="form">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Eliminar entidad fiscal
          </Button>
        </SidebarActions>
      )}
    </>
  );
}

const InfoField = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <div className={`flex items-center px-6 py-4 bg-white border-b border-gray-200 last:border-b-0 ${className}`}>
    <div className="w-[148px] text-sm text-gray-500 shrink-0">{label}</div>
    <div className="text-base text-gray-900 font-medium ml-4">{value}</div>
  </div>
);

const FileField = ({
  label,
  fileUrl,
  defaultFileName,
  onDownload,
}: {
  label: string;
  fileUrl: string | null | undefined;
  defaultFileName: string;
  onDownload: (url: string, fileName: string) => void;
}) => (
  <div className="flex items-center px-6 py-4 bg-white border-b border-gray-200 h-14">
    <div className="w-[148px] text-sm text-gray-500 shrink-0">{label}</div>
    <div className="flex items-center gap-2 flex-1">
      {fileUrl ? (
        <>
          <button
            onClick={() => onDownload(fileUrl, getFileNameFromUrl(fileUrl) || defaultFileName)}
            className="text-blue-600 hover:text-blue-700 transition-colors underline"
            title={getFileNameFromUrl(fileUrl) || defaultFileName}
          >
            {truncateFileName(getFileNameFromUrl(fileUrl) || defaultFileName)}
          </button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDownload(fileUrl, getFileNameFromUrl(fileUrl) || defaultFileName)}
          >
            <IcDownload className="w-4 h-4 text-blue-600" />
          </Button>
        </>
      ) : (
        <span className="text-gray-500">No disponible</span>
      )}
    </div>
  </div>
);

const SectionContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 w-full">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">{children}</div>
  </div>
);

function getFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop();
    return fileName || null;
  } catch {
    return null;
  }
}

function truncateFileName(fileName: string, maxLength = 20): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return fileName.substring(0, maxLength - 3) + '...';
  }

  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExtension = fileName.substring(0, lastDotIndex);

  const availableSpace = maxLength - extension.length - 3;

  if (availableSpace <= 0) {
    return '...' + extension;
  }

  return nameWithoutExtension.substring(0, availableSpace) + '...' + extension;
}

function getTaxRegimeName(taxingSystemName: string): string {
  const regime = taxRegimeValues.find((regime) => regime.value === taxingSystemName);
  return regime ? `${regime.value} - ${regime.name}` : taxingSystemName;
}
