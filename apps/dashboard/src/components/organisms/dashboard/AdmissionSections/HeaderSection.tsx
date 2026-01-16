import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import LegacyButton from '/src/components/organisms/dashboard/Button';
import { useState } from 'react';
import { StatusEnum, StudentLeadEntity } from '@cometa/trpc/src/admissions/types';
import Status from '/src/components/Status';
import IcStudents from '/public/assets/icons/ic_students.svg';
import Dialog from '/src/components/atoms/Dialog';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useRouter } from 'next/router';
import useAlert from '/src/hooks/useAlert';
import { api } from '/src/utils/api';
import { Button, ContainerError, Input, Label, Radio } from '@cometa/recreo';
import Sheet from '/src/components/atoms/Sheet';
import AcceptProspectForm from '/src/components/admissions/detail/accept-prospect-form';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useSections from '/src/hooks/useSections';
import useLevels from '/src/hooks/useLevels';
import { useSession } from 'next-auth/react';
import { XCircleIcon, TrashIcon } from 'lucide-react';
import AvatarSection from './AvatarSection';
import { AdmissionsServiceClient } from '/src/utils/api-admissions';

type StatusProps = {
  label: string;
  variant: 'info' | 'success' | 'error' | 'muted' | 'warning';
  image: string;
};

export function HeaderSection({ studentLead }: { studentLead?: StudentLeadEntity }) {
  const status = studentLead?.status ?? StatusEnum.DroppedOut;
  const statuses: Record<StatusEnum, StatusProps> = {
    [StatusEnum.Initial]: { label: 'Prospecto', variant: 'info', image: 'border-info' },
    [StatusEnum.Admitted]: { label: 'Admitido', variant: 'success', image: 'border-[#229A16]' },
    [StatusEnum.DroppedOut]: { label: 'Abandono', variant: 'muted', image: 'border-[#919EAB]' },
    [StatusEnum.NotAdmitted]: { label: 'No admitido', variant: 'error', image: 'border-[#D32F2F]' },
  };

  const { setAlertState } = useAlert();
  const { data: session } = useSession();

  const disabledActions = status !== StatusEnum.Initial;

  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownloadClick() {
    setIsDownloading(true);
    try {
      const response = await AdmissionsServiceClient.downloadAdmissionPdfApiV1AdmissionsPkPdfGet(
        studentLead?.id as string,
        { download: true },
        { headers: { Authorization: `Token ${session?.token}` } }
      );

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha_admision_${studentLead?.first_name?.toLowerCase()}_${studentLead?.last_name?.toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setAlertState({
        open: true,
        severity: 'success',
        message: 'La descarga de la ficha ha comenzado.',
      });
    } catch {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo descargar la ficha. Inténtelo de nuevo.',
      });
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setAlertState({ open: false, severity: 'success', message: '' });
      }, 3000);
    }
  }

  return (
    <header className="flex justify-between items-center py-4 px-8">
      <div className="flex items-center gap-4">
        <AvatarSection
          id={studentLead?.id as string}
          borderColor={statuses[status].image}
          photoUrl={studentLead?.photo_url}
          isLead
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#1C1C1D]">
              {studentLead?.first_name} {studentLead?.last_name}
            </h2>
            <div className="flex items-center">
              <Status variant={statuses[status].variant}>{statuses[status].label}</Status>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="medium"
          color="black"
          leftIcon={<DownloadIcon />}
          variant="solid-light"
          data-testid="download-btn"
          onClick={() => {
            if (isDownloading) return;
            handleDownloadClick();
          }}
          disabled={isDownloading}
          isLoading={isDownloading}
        >
          Descargar ficha
        </Button>
        <AdmitAction studentLead={studentLead} disabledActions={disabledActions} />
        <DropdownActions studentLead={studentLead} disabledActions={disabledActions} />
      </div>
    </header>
  );
}

function AdmitAction({ studentLead, disabledActions }: { studentLead?: StudentLeadEntity; disabledActions: boolean }) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const selectSchoolId = selectedSchool?.id as string;

  const [showForm, setShowForm] = useState(false);
  const { data: sections } = useSections(session?.token, selectSchoolId, true);
  const { data: levels } = useLevels(session?.token, selectSchoolId);

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectSchoolId },
    { enabled: !!selectSchoolId }
  );

  if (disabledActions) return null;

  return (
    <>
      <LegacyButton
        className="flex h-10 gap-2 rounded-3xl bg-[#00AB55]"
        data-testid="assignStudent-btn"
        onClick={() => setShowForm(true)}
      >
        <IcStudents />
        Admitir prospecto
      </LegacyButton>

      <Sheet
        open={showForm}
        onOpenChange={(open) => {
          if (!open) setShowForm(false);
        }}
      >
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <AcceptProspectForm
            studentLead={studentLead}
            onClose={() => setShowForm(false)}
            schoolCycles={schoolCycles || []}
            sections={sections || []}
            levels={levels || []}
            admissionId={studentLead?.id as string}
            schoolId={selectSchoolId}
          />
        </Sheet.Content>
      </Sheet>
    </>
  );
}

function DropdownActions({
  studentLead,
  disabledActions,
}: {
  studentLead?: StudentLeadEntity;
  disabledActions: boolean;
}) {
  const admissionId = studentLead?.id as string;

  const router = useRouter();
  const { setAlertState } = useAlert();

  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const [openDroppedOutDialog, setOpenDroppedOutDialog] = useState(false);
  const [status, setStatus] = useState<'' | StatusEnum>('');
  const [droppedOutReason, setDroppedOutReason] = useState('');

  const { data } = api.admissions.getAdmissionPayments.useQuery(
    {
      studentId: studentLead?.external_id as string,
    },
    {
      enabled: !!studentLead?.external_id,
    }
  );
  const payments = data as any;
  const hasPayments = payments && payments?.length > 0;

  const utils = api.useUtils();

  const updateAdmissionStatus = api.admissions.updateAdmissionStatus.useMutation({
    onSuccess: () => {
      utils.admissions.getAdmissionDetail.invalidate({ admissionId });
      setOpenDroppedOutDialog(false);
    },
  });

  const deleteAdmission = api.admissions.deleteAdmission.useMutation({
    onSuccess: () => {
      setOpenDialog(false);
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Se eliminó el prospecto exitosamente.',
      });

      router.push('/admissions');
    },
    onError: () => {
      setOpenDialog(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo eliminar el prospecto.',
      });
    },
  });

  if (disabledActions) return null;

  const handleDeleteClick = () => (hasPayments ? undefined : setOpenDialog(true));

  const isDeleteMessageConfirmed = confirmDelete === 'ELIMINAR';

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <LegacyButton
            className="bg-[#00AB5514] text-[#00AB55] hover:bg-[#00AB5544] font-semibold text-sm px-6 flex items-center gap-3 shadow-none rounded-full"
            data-testid="admission-menu-btn"
          >
            <ThreeDotsIcon />
          </LegacyButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="border border-[#E9EEF7] bg-white rounded-2xl flex flex-col mt-1 text-sm shadow-sm"
            align="end"
          >
            <DropdownMenu.Item asChild>
              <LegacyButton
                onClick={() => setOpenDroppedOutDialog(true)}
                className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                data-testid="admission-finish-btn"
              >
                <XCircleIcon className="w-5 mr-1" /> Finalizar proceso
              </LegacyButton>
            </DropdownMenu.Item>
            {hasPayments ? (
              <Tooltip message="No se puede eliminar el prospecto porque tiene pagos realizados" side="bottom">
                <DropdownMenu.Item asChild>
                  <LegacyButton
                    disabled={hasPayments}
                    onClick={handleDeleteClick}
                    className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                    data-testid="admission-delete-btn"
                  >
                    <TrashIcon className="w-5" /> Eliminar prospecto
                  </LegacyButton>
                </DropdownMenu.Item>
              </Tooltip>
            ) : (
              <DropdownMenu.Item asChild>
                <LegacyButton
                  disabled={hasPayments}
                  onClick={handleDeleteClick}
                  className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                  data-testid="admission-delete-btn"
                >
                  <TrashIcon className="w-5" /> Eliminar prospecto
                </LegacyButton>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root
        open={openDroppedOutDialog}
        position="center"
        onOpenChange={(state) => setOpenDroppedOutDialog(state)}
      >
        <Dialog.Title>Finalizar proceso de admisión</Dialog.Title>

        <div className="mt-4 mb-8">
          <Dialog.Description className="text-base">
            Los tutores ya no podrán continuar con el proceso una vez finalizado. Sin embargo, toda la información
            capturada seguirá disponible para el colegio.
          </Dialog.Description>

          <Dialog.Description className="text-[#3E4559] text-start text-base font-semibold">
            ¿Por qué estás finalizando este proceso de admisión?
          </Dialog.Description>
          <Radio.Group
            name="action"
            className="flex flex-col gap-4"
            value={status}
            onValueChange={(value: StatusEnum) => setStatus(value)}
          >
            <div className="flex items-center gap-4">
              <Radio.Item
                id="dropped_out"
                value="dropped_out"
                className="cursor-pointer"
                data-testid="radio-dropped-out"
              />
              <Label htmlFor="dropped_out" className="text-base cursor-pointer">
                El prospecto abandonó el proceso
              </Label>
            </div>
            <div className="flex items-center gap-4">
              <Radio.Item
                id="not_admitted"
                value="not_admitted"
                className="cursor-pointer"
                data-testid="radio-not-admitted"
              />
              <Label htmlFor="not_admitted" className="text-base cursor-pointer">
                La aplicación fue rechazada
              </Label>
            </div>
          </Radio.Group>
        </div>
        {status !== '' ? (
          <Input
            type="text"
            value={droppedOutReason}
            onChange={(e) => setDroppedOutReason(e.target.value)}
            placeholder={status === 'dropped_out' ? 'Motivo de abandono' : 'Motivo de rechazo'}
            isLegacy={false}
          />
        ) : null}

        <div className="flex justify-center gap-x-10 mt-8">
          <Dialog.Close
            className="bg-transparent text-[#637381] font-bold	py-2 px-8 text-sm	hover:opacity-90 outline-none"
            data-testid="cancelar-btn"
          >
            Cancelar
          </Dialog.Close>
          <button
            className="bg-[#FF4842] text-white font-bold	py-2 px-8 rounded-lg text-sm hover:opacity-90 hover:cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() =>
              updateAdmissionStatus.mutate({
                admissionId,
                data: { status: status as StatusEnum, dropped_out_reason: droppedOutReason },
              })
            }
            disabled={!status || updateAdmissionStatus.isPending}
            data-testid="finalizar-btn"
          >
            Finalizar
          </button>
        </div>
      </Dialog.Root>

      <Dialog.Root open={openDialog} position="center" onOpenChange={(state) => setOpenDialog(state)}>
        <Dialog.Title>Eliminar prospecto</Dialog.Title>

        <div className="my-4">
          <Dialog.Description className="text-base">
            Toda la información relacionada será <strong>eliminada permanentemente</strong> y no podrás acceder a ella
            nuevamente.
          </Dialog.Description>

          <div className="text-start">
            <Dialog.Description className="text-sm text-start mb-2">
              Escribe "ELIMINAR" para confirmar
            </Dialog.Description>
            <Input
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              isLegacy={false}
              error={isDeleteMessageConfirmed ? '' : 'error'}
            />
            {isDeleteMessageConfirmed ? null : <ContainerError error="Escribe la palabra correcta para continuar" />}
          </div>
        </div>

        <div className="flex justify-center gap-x-10">
          <Dialog.Close
            className="bg-transparent text-[#637381] font-bold	py-2 px-8 text-sm	hover:opacity-90 outline-none"
            data-testid="cancelar-btn"
          >
            Cancelar
          </Dialog.Close>
          <button
            className="bg-[#FF4842] text-white font-bold	py-2 px-8 rounded-lg text-sm hover:opacity-90 hover:cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() => deleteAdmission.mutate({ admissionId })}
            disabled={!isDeleteMessageConfirmed || deleteAdmission.isPending}
          >
            Eliminar
          </button>
        </div>
      </Dialog.Root>
    </>
  );
}

function ThreeDotsIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.00008 2.66667C2.73646 2.66667 3.33341 2.06971 3.33341 1.33333C3.33341 0.596954 2.73646 0 2.00008 0C1.2637 0 0.666748 0.596954 0.666748 1.33333C0.666748 2.06971 1.2637 2.66667 2.00008 2.66667Z"
        fill="#00AB55"
      />
      <path
        d="M2.00008 9.33354C2.73646 9.33354 3.33341 8.73658 3.33341 8.00021C3.33341 7.26383 2.73646 6.66687 2.00008 6.66687C1.2637 6.66687 0.666748 7.26383 0.666748 8.00021C0.666748 8.73658 1.2637 9.33354 2.00008 9.33354Z"
        fill="#00AB55"
      />
      <path
        d="M2.00008 15.9998C2.73646 15.9998 3.33341 15.4029 3.33341 14.6665C3.33341 13.9301 2.73646 13.3331 2.00008 13.3331C1.2637 13.3331 0.666748 13.9301 0.666748 14.6665C0.666748 15.4029 1.2637 15.9998 2.00008 15.9998Z"
        fill="#00AB55"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.52953 9.24243L8.53533 2.48774C8.53533 2.35838 8.47915 2.23433 8.37914 2.14286C8.27914 2.05139 8.1435 2 8.00207 2C7.86064 2 7.725 2.05139 7.625 2.14286C7.52499 2.23433 7.46881 2.35838 7.46881 2.48774L7.46301 9.23414L5.91016 7.81335C5.81016 7.72191 5.67455 7.67054 5.53314 7.67054C5.39174 7.67054 5.25613 7.72191 5.15613 7.81335C5.05616 7.90481 5 8.02885 5 8.15818C5 8.28751 5.05616 8.41155 5.15613 8.50301L6.86842 10.0711C7.01699 10.2071 7.19339 10.3149 7.38755 10.3885C7.58172 10.4621 7.78983 10.5 8 10.5C8.21017 10.5 8.41828 10.4621 8.61244 10.3885C8.80661 10.3149 8.98301 10.2071 9.13157 10.0711L10.8439 8.50448C10.9438 8.41301 11 8.28898 11 8.15964C11 8.03031 10.9438 7.90628 10.8439 7.81481C10.7439 7.72337 10.6083 7.67201 10.4669 7.67201C10.3255 7.67201 10.1898 7.72337 10.0898 7.81481L8.52953 9.24243Z"
        fill="#1C1C1D"
      />
      <path
        d="M13.5 12.5H2.5C2.22386 12.5 2 12.7239 2 13C2 13.2761 2.22386 13.5 2.5 13.5H13.5C13.7761 13.5 14 13.2761 14 13C14 12.7239 13.7761 12.5 13.5 12.5Z"
        fill="#374957"
      />
    </svg>
  );
}
