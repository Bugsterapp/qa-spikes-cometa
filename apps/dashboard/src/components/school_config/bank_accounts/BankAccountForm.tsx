import {
  ContainerError,
  SelectInput,
  SelectInputContent,
  SelectInputItem,
  SelectInputTrigger,
  SelectInputValue,
} from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { Button, Input, Label } from '@cometa/recreo/v2';
import { BankName, DocumentType, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import IcDownload from 'public/assets/icons/ic_download.svg';
import InfoCircleIcon from 'public/assets/icons/ic_info_circle_outline.svg';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BANK_CONFIG } from '../../../constants/banks';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import { BankAccountAction, useBankAccount, useBankAccountMutations } from '../../../hooks/bank_accounts';
import useSendTrackEventWithUserName from '../../../hooks/useSendTrackEventWithUserName';
import { compressImage, handleDownloadFile } from '../../../utils/file-utils';
import SidebarActions from '../../atoms/SidebarActions';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import DeclinedAlert from '../DeclinedAlert';

const bankAccountSchema = z.object({
  nickname: z.string().min(1, 'El nombre de la cuenta es requerido'),
  owner: z.string().min(1, 'El nombre del dueño de la cuenta es requerido'),
  account_number: z.string().length(18, 'El número CLABE debe tener 18 dígitos'),
  bank_name: z.nativeEnum(BankName, { errorMap: () => ({ message: 'Selecciona un banco' }) }),
  document_type: z.literal(DocumentType.RFC, { errorMap: () => ({ message: 'Solo se permite RFC' }) }),
  document_number: z.string().min(1, 'El RFC es requerido'),
  file: z.any(),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

const MAX_IMAGE_SIZE = 10000000; // 10 MB for images
const MAX_PDF_SIZE = 500000; // 500 KB for PDFs
const RFC_MAX_LENGTH = 13;

const toTitleCase = (s: string) =>
  s.replaceAll(/([^\s]+)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const getBankLabel = (bankName: string): string => {
  const config = BANK_CONFIG[bankName];
  return config?.label || toTitleCase(bankName);
};

const banks = Object.values(BankName)
  .map((bank) => ({
    value: bank,
    label: getBankLabel(bank),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function BankAccountForm() {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [maxFileSize, setMaxFileSize] = useState(MAX_IMAGE_SIZE);
  const selectedSchool = useSelectedSchool();

  const { bankAccountAction, selectedBankAccount, closeDrawer } = useBankAccount();
  const { createBankAccount, confirmOnboardingDelete } = useBankAccountMutations();

  const isEditing = bankAccountAction === BankAccountAction.Editing;
  const bankAccount = isEditing ? selectedBankAccount : null;
  const isDeclined = bankAccount?.status === OnboardingStatus.Declined;

  const handleSave = (formValues: BankAccountFormData) => {
    if (!selectedSchool?.id) {
      return;
    }

    createBankAccount(selectedSchool.id, formValues);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      nickname: bankAccount?.nickname ?? '',
      owner: bankAccount?.owner ?? '',
      account_number: bankAccount?.account_number ?? '',
      bank_name: bankAccount?.bank_name as BankName | undefined,
      document_type: DocumentType.RFC,
      document_number: bankAccount?.document_number ?? '',
    },
    mode: 'onChange',
  });

  const documentNumber = watch('document_number');

  const resolveDocumentNumber = () => {
    if (!isRFCValid(documentNumber)) {
      setError('document_number', {
        type: 'manual',
        message: 'El formato del RFC no es válido',
      });
      return;
    }

    clearErrors('document_number');
  };

  const onSubmit = async (data: BankAccountFormData) => {
    if (!selectedFile) {
      setError('file', {
        type: 'manual',
        message: 'La carátula de estado de cuenta es requerida',
      });
      return;
    }

    if (!isRFCValid(documentNumber)) {
      setError('document_number', {
        type: 'manual',
        message: 'El formato del RFC no es válido',
      });
      return;
    }

    const formData = {
      ...data,
    };

    if (selectedFile instanceof File) {
      try {
        formData.file = await compressImage(selectedFile, 500);
      } catch (error) {
        setError('file', {
          type: 'manual',
          message: error instanceof Error ? error.message : 'Error al procesar el archivo',
        });
        return;
      }
    }

    handleSave(formData);
  };

  const handleDelete = () => {
    if (!selectedBankAccount?.id) {
      return;
    }

    sendTrackEventWithUserName('dashboard: Bank Account declined | Clicked delete');
    void confirmOnboardingDelete(selectedBankAccount.id);
  };

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Agregar cuenta bancaria"
        onClose={closeDrawer}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />
      <form className="flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-1 overflow-y-auto px-8">
          <div className="flex flex-col gap-8 mb-6 pt-8">
            <div className="flex flex-col gap-8">
              {isDeclined ? (
                <DeclinedAlert
                  message={bankAccount?.reason ?? undefined}
                  defaultMessage="La información registrada no coincide con el estado de cuenta adjuntado. Por favor, actualiza la información y vuelve a intentarlo."
                />
              ) : (
                <div className="bg-[#f8f9fb] border border-[#d0d8e9] rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <InfoCircleIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#22283a] leading-5">
                      Después de registrar tu cuenta, nuestro equipo verificará la información. Te avisaremos cuando
                      esté lista para recibir depósitos.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">Nombre de la cuenta</Label>
                  <Input
                    {...register('nickname')}
                    id="nickname"
                    type="text"
                    isError={!!errors.nickname?.message}
                    placeholder=""
                    className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
                  />
                  <ContainerError error={errors.nickname?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">Carátula de estado de cuenta</Label>

                  {bankAccount?.file_url && (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (bankAccount.file_url) {
                            try {
                              await handleDownloadFile(bankAccount.file_url);
                            } catch (error) {
                              Sentry.captureException(error);
                              window.open(bankAccount.file_url, '_blank');
                            }
                          }
                        }}
                        className="inline-flex items-center gap-2 text-sm text-[#3366FF] hover:text-[#1890FF] transition-colors duration-150 font-medium bg-transparent border-none cursor-pointer p-0"
                      >
                        <IcDownload className="w-4 h-4" />
                        Descargar carátula de cuenta enviada anteriormente
                      </button>
                    </div>
                  )}

                  <FileUploader
                    key={maxFileSize}
                    id="bank-account-file"
                    acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
                    initialFiles={selectedFile ? [selectedFile] : []}
                    onFilesChange={(files) => {
                      const file = files[0] || null;

                      if (file) {
                        const newMaxSize = file.type === 'application/pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
                        setMaxFileSize(newMaxSize);
                        clearErrors('file');
                      }

                      setSelectedFile(file);
                    }}
                    helperText="Los 18 dígitos del numero CLABE deben estar visibles. PDFs máximo 500KB, imágenes máximo 10MB."
                    size="large"
                    maxFiles={1}
                    multiple={false}
                    preview
                    maxFileSize={maxFileSize}
                    required={false}
                    visualizer
                    className="rounded-xl"
                  />
                  <ContainerError error={errors.file?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">Titular de la cuenta</Label>
                  <Input
                    {...register('owner')}
                    id="owner"
                    type="text"
                    isError={!!errors.owner?.message}
                    placeholder=""
                    className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
                  />
                  <ContainerError error={errors.owner?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">Número CLABE</Label>
                  <Input
                    {...register('account_number', {
                      onChange: (e) => {
                        const value = e.target.value.replaceAll(/\D/g, '').slice(0, 18);
                        setValue('account_number', value);
                      },
                    })}
                    id="account_number"
                    type="text"
                    inputMode="numeric"
                    isError={!!errors.account_number?.message}
                    placeholder=""
                    className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
                    maxLength={18}
                  />
                  <ContainerError error={errors.account_number?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">RFC</Label>
                  <Input
                    {...register('document_number', {
                      onBlur: () => {
                        resolveDocumentNumber();
                      },
                      shouldUnregister: false,
                    })}
                    id="document_number"
                    type="text"
                    isError={!!errors.document_number?.message}
                    placeholder=""
                    className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
                    maxLength={RFC_MAX_LENGTH}
                  />
                  <ContainerError error={errors.document_number?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#22283a] text-base font-normal">Banco</Label>
                  <SelectInput
                    onValueChange={(value: string) => {
                      setValue('bank_name', value as BankName, { shouldValidate: true });
                    }}
                    value={watch('bank_name')}
                  >
                    <SelectInputTrigger className="w-full outline-none rounded-md h-12 ">
                      <SelectInputValue placeholder="Selecciona una opción" />
                    </SelectInputTrigger>
                    <SelectInputContent className="w-full outline-none">
                      {banks.map((bank) => (
                        <SelectInputItem
                          key={bank.value}
                          value={bank.value}
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                        >
                          {bank.label}
                        </SelectInputItem>
                      ))}
                    </SelectInputContent>
                  </SelectInput>
                  <ContainerError error={errors.bank_name?.message as string} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SidebarActions variant="form">
          {isDeclined && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              sendTrackEventWithUserName(
                isDeclined
                  ? 'dashboard: Bank Account declined | Clicked discard'
                  : 'dashboard: Bank Account edit | Clicked cancel'
              );
              closeDrawer();
            }}
          >
            Descartar
          </Button>
          <Button type="submit" variant="default">
            {isDeclined ? 'Enviar nueva solicitud' : 'Guardar'}
          </Button>
        </SidebarActions>
      </form>
    </div>
  );
}

const rfcRegex = /^[A-ZÑ&]{3,4}-?\d{6}-?[A-Z\d]{3}$/i;

function isRFCValid(rfc: string): boolean {
  return rfcRegex.test(rfc);
}
