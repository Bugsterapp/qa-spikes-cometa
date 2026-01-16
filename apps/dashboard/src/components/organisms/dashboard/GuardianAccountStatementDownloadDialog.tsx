import { useState, useEffect } from 'react';
import { Dialog } from '@cometa/recreo';
import { SchoolCycleSelector, useSchoolCycleSelector } from './SchoolCycleSelector';
import {
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { api } from '/src/utils/api';
import * as Sentry from '@sentry/nextjs';
import type { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';

interface GuardianAccountStatementDownloadDialogProps {
  guardianId: string;
  open: boolean;
  onClose: () => void;
}

export function GuardianAccountStatementDownloadDialog({
  guardianId,
  open,
  onClose,
}: GuardianAccountStatementDownloadDialogProps) {
  const { schoolCycles = [], activeCycle } = useSchoolCycleSelector();
  const [selectedCycle, setSelectedCycle] = useState<SchoolCycleEntity | null>(activeCycle ?? null);

  const addToQueue = useAddToQueue();
  const setToError = useSetToError();
  const setIsWorking = useSetIsWorking();

  const downloadMutation = api.guardian.downloadFamilyAccountStatement.useMutation({
    onSuccess: (data) => {
      addToQueue(data.id, ETypeFile.EXCEL);
    },
    onError: (err) => {
      setToError();
      Sentry.captureException(err);
      alert('Hubo un error al solicitar el estado de cuenta familiar. Intenta nuevamente.');
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedCycle(activeCycle ?? null);
    }
  }, [open, activeCycle]);

  const handleDownload = () => {
    if (!guardianId || !selectedCycle) return;
    setIsWorking();
    downloadMutation.mutate({
      guardian_id: guardianId,
      school_cycle_id: selectedCycle.id as string,
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Title className="text-center text-xl font-bold mb-2">Descarga el estado de cuenta</Dialog.Title>
      <Dialog.Description className="text-left mb-8 text-[#637381]">
        Selecciona el ciclo escolar del estado de cuenta que deseas descargar
      </Dialog.Description>
      <div className="mb-7">
        <SchoolCycleSelector
          cycles={schoolCycles}
          selected={selectedCycle}
          setFn={setSelectedCycle}
          hideTodos
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <button
          id="cancel-download-account-statement"
          className="bg-[#F4F6F8] text-[#212B36] font-bold py-2 px-6 rounded-full text-sm hover:opacity-90"
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
        <button
          id="download-account-statement"
          className={`font-bold py-2 px-6 rounded-full text-sm transition-colors
            ${
              selectedCycle === null || downloadMutation.isPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#22C55E] text-white hover:opacity-90 cursor-pointer'
            }`}
          onClick={handleDownload}
          type="button"
          disabled={selectedCycle === null || downloadMutation.isPending}
        >
          Descargar
        </button>
      </div>
    </Dialog.Root>
  );
}
