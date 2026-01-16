import { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react';
import { Dialog, Button } from '@cometa/recreo';
import SuccessIcon from '/public/assets/success.svg';
import LoadingIcon from '/public/assets/loading.svg';
import IcClose from '/public/assets/icons/ic_close.svg';
import { cn } from '@cometa/utils';
export type DownloadStatus = 'generating' | 'completed' | 'error';

export type DownloadState = {
  id: string;
  reportName: string;
  status: DownloadStatus;
  errorMessage?: string;
  progress?: number;
};

export type DownloadContextType = {
  currentDownload: DownloadState | null;
  addDownload: (download: Omit<DownloadState, 'status' | 'id'>) => string;
  downloadCompleted: (id: string, downloadUrl: string) => void;
  downloadFailed: (errorMessage: string) => void;
  removeDownload: () => void;
};

export const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function useDownload() {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
}

interface DownloadProviderProps {
  children: React.ReactNode;
}

function triggerBrowserDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function DownloadProvider({ children }: DownloadProviderProps) {
  const [currentDownload, setCurrentDownload] = useState<DownloadState | null>(null);
  const [pendingDownload, setPendingDownload] = useState<DownloadState | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const downloadFile = useCallback(triggerBrowserDownload, []);

  const isDownloadInProgress = useMemo(() => !!currentDownload, [currentDownload]);

  useEffect(() => {
    if (currentDownload?.status === 'completed') {
      setShowConfirmationDialog(false);
    }
  }, [currentDownload]);

  const addDownload = useCallback(
    (input: Omit<DownloadState, 'status' | 'id'>) => {
      const download = { ...input, status: 'generating', id: crypto.randomUUID() } satisfies DownloadState;

      if (isDownloadInProgress) {
        setPendingDownload(download);
        setShowConfirmationDialog(true);
        return download.id;
      }

      setCurrentDownload(download);

      return download.id;
    },
    [isDownloadInProgress]
  );

  const cancelNewDownload = useCallback(() => {
    setShowConfirmationDialog(false);
    setPendingDownload(null);
  }, []);

  const startPendingDownload = useCallback(() => {
    if (pendingDownload) {
      setCurrentDownload({ ...pendingDownload, status: 'generating' });
      setPendingDownload(null);
    }
  }, [pendingDownload]);

  const removeDownload = useCallback(() => {
    setCurrentDownload(null);
  }, []);

  const downloadCompleted = useCallback(
    (id: string, downloadUrl: string) => {
      setCurrentDownload((download) => {
        if (!download || download.id !== id) return null;

        downloadFile(downloadUrl, download.reportName ?? 'report.xlsx');

        setTimeout(removeDownload, 3000);

        return { ...download, status: 'completed' };
      });
    },
    [downloadFile]
  );

  const downloadFailed = useCallback((errorMessage: string) => {
    setCurrentDownload((prev) => {
      if (!prev) return null;

      setTimeout(removeDownload, 3000);

      return { ...prev, status: 'error', errorMessage };
    });
  }, []);

  const confirmNewDownload = useCallback(() => {
    removeDownload();
    startPendingDownload();
    setShowConfirmationDialog(false);
  }, [removeDownload, startPendingDownload]);

  const value = {
    currentDownload,
    addDownload,
    downloadCompleted,
    downloadFailed,
    removeDownload,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
      <Dialog.Root open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <Dialog.Title>Descarga en progreso</Dialog.Title>
        <Dialog.Description>
          Ya hay una descarga en progreso. ¿Deseas cancelar la descarga actual y comenzar una nueva?
        </Dialog.Description>
        <div className="flex justify-center gap-2">
          <Button size="small" variant="outline" color="legacy" onClick={cancelNewDownload}>
            Cancelar
          </Button>
          <Button size="small" variant="solid" color="legacy" onClick={confirmNewDownload}>
            Confirmar
          </Button>
        </div>
      </Dialog.Root>
    </DownloadContext.Provider>
  );
}

function LoadingState() {
  return (
    <div className="h-full grid place-items-center">
      <LoadingIcon />
    </div>
  );
}

function SuccessState() {
  return (
    <div className="h-full grid place-items-center">
      <SuccessIcon />
    </div>
  );
}

function DownloadMessage() {
  const { currentDownload } = useDownload();

  const messages = {
    generating: 'Generando reporte',
    completed: 'La descarga de tus archivos ha iniciado',
    error: 'Hemos tenido problemas para la descarga de tus archivos',
  };

  const errorMessage = currentDownload?.status === 'error' ? currentDownload.errorMessage || messages.error : null;

  return (
    <div className="flex flex-col justify-center">
      <p className="text-lg font-bold">{messages[currentDownload?.status || 'generating']}</p>
      {errorMessage && <p className="text-sm text-gray-600">{errorMessage}</p>}
    </div>
  );
}

function DownloadActions() {
  const { removeDownload, currentDownload } = useDownload();

  if (currentDownload?.status === 'completed' || currentDownload?.status === 'error') {
    return (
      <button className="bg-transparent font-bold" onClick={() => removeDownload()}>
        <IcClose fill="#212B36" />
      </button>
    );
  }

  if (currentDownload?.status === 'generating') {
    return (
      <button className="text-[#FF4842] bg-transparent font-bold" onClick={() => removeDownload()}>
        Cancelar
      </button>
    );
  }

  return null;
}

export function DownloadStatusBar({ className }: { className?: string }) {
  const { currentDownload } = useDownload();

  if (!currentDownload) return null;

  return (
    <div
      className={cn(
        'fixed px-6 bottom-0 right-0 w-full h-20 bg-white shadow-backgroundDownload z-10 flex justify-between items-center',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {currentDownload.status === 'generating' && <LoadingState />}
        {currentDownload.status === 'completed' && <SuccessState />}
        <DownloadMessage />
      </div>
      <div className="flex items-center">
        <DownloadActions />
      </div>
    </div>
  );
}
