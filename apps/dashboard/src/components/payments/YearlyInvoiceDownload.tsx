import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cometa/recreo/v2';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import IcCheck from '../../../public/assets/icons/ic_check.svg';
import IcDownloadArrow from '../../../public/assets/icons/ic_download_arrow.svg';
import IcInfo from '../../../public/assets/icons/ic_info.svg';
import { useSelectedSchoolId } from '../../guards/AuthGuard';
import useAlert from '../../hooks/useAlert';
import { api } from '../../utils/api';
import { Tooltip } from '../atoms/Tooltip';
import { useFlagWithVariableMatching } from '../flags/FlagsProvider';

export function YearlyInvoiceDownload() {
  const { data: session } = useSession();
  const selectedSchoolId = useSelectedSchoolId();
  const { setAlertState } = useAlert();
  const { isEnabled: enableYearlyInvoiceDownload } = useFlagWithVariableMatching('enable_yearly_invoice_download');
  const [isYearlyInvoiceDialogOpen, setIsYearlyInvoiceDialogOpen] = useState(false);

  const availableYear = getAvailableYearForDownload();

  const {
    data: yearlyInvoiceStatus,
    refetch: refetchStatus,
    isLoading: isLoadingYearlyInvoiceStatus,
  } = api.payments.yearlyInvoicesStatus.useQuery(
    {
      schoolId: selectedSchoolId || '',
      year: availableYear,
    },
    {
      enabled: !!selectedSchoolId && enableYearlyInvoiceDownload,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const downloadYearlyInvoicesMutation = api.payments.downloadYearlyInvoices.useMutation({
    onError: () => {
      setAlertState({
        severity: 'error',
        message: 'Ocurrió un error al descargar las facturas del año',
        open: true,
      });
      setIsYearlyInvoiceDialogOpen(false);
    },
  });

  const handleRequestYearlyInvoices = () => {
    downloadYearlyInvoicesMutation.mutate(
      {
        schoolId: selectedSchoolId || '',
        year: availableYear,
      },
      {
        onSuccess: () => {
          setAlertState({
            severity: 'success',
            message: '¡Solicitud enviada! Revisa tu correo para obtener el enlace de descarga',
            open: true,
          });
          setIsYearlyInvoiceDialogOpen(false);
          refetchStatus();
        },
      }
    );
  };

  const handleDirectDownload = () => {
    if (yearlyInvoiceStatus?.download_url) {
      const link = document.createElement('a');
      link.href = yearlyInvoiceStatus.download_url;
      link.download = `facturas_${availableYear}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  if (!enableYearlyInvoiceDownload || isLoadingYearlyInvoiceStatus) {
    return null;
  }

  return (
    <>
      {yearlyInvoiceStatus?.status === 'generating' && yearlyInvoiceStatus?.user_will_be_notified ? (
        <Tooltip
          message={`El archivo de facturas está siendo generado. Enviaremos el enlace de descarga a ${
            session?.user?.email ?? 'tu correo'
          } en menos de 2 horas.`}
        >
          <Button disabled className="flex items-center justify-center">
            <IcCheck className="w-3 h-auto" />
            Generando facturas
          </Button>
        </Tooltip>
      ) : (
        <>
          {yearlyInvoiceStatus?.status === 'ready' && yearlyInvoiceStatus?.download_url ? (
            <Button onClick={handleDirectDownload}>
              <IcDownloadArrow className="h-4 w-4" />
              Descargar facturas {availableYear}
            </Button>
          ) : (
            <Dialog
              open={isYearlyInvoiceDialogOpen}
              onOpenChange={(open) => {
                setIsYearlyInvoiceDialogOpen(open);
                if (!open) {
                  downloadYearlyInvoicesMutation.reset();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <IcDownloadArrow className="h-4 w-4" />
                  Descargar facturas {availableYear}
                </Button>
              </DialogTrigger>
              <DialogContent className="gap-4">
                <DialogHeader>
                  <DialogTitle className="text-lg leading-7 font-semibold">
                    Descargar facturas {availableYear}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-5 text-[#697086]">
                    <>
                      Generaremos un archivo ZIP con{' '}
                      <span className="font-semibold text-[#22283a]">
                        todas las facturas emitidas en el periodo del 01/01/{availableYear} al 15/12/{availableYear}
                      </span>{' '}
                      y lo enviaremos a{' '}
                      <span className="font-semibold text-[#22283a]">{session?.user?.email ?? 'tu correo'}</span>.
                    </>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 items-start px-4 py-3 bg-[#e8f4ff] border border-[#64b5ff] rounded-lg">
                  <div className="flex items-start pt-[2px] shrink-0">
                    <IcInfo className="shrink-0 w-4 h-4" />
                  </div>
                  <p className="text-sm leading-5 text-[#0d4f8c]">
                    Recibirás el enlace de descarga en menos de 2 horas
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="light"
                    disabled={downloadYearlyInvoicesMutation.isPending}
                    onClick={() => setIsYearlyInvoiceDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleRequestYearlyInvoices} disabled={downloadYearlyInvoicesMutation.isPending}>
                    {downloadYearlyInvoicesMutation.isPending ? 'Procesando...' : 'Solicitar descarga'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}

function getAvailableYearForDownload(): number {
  const today = new Date();
  const actualCurrentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const isAfterDecember16 = currentMonth === 11 && currentDay >= 16;
  return isAfterDecember16 ? actualCurrentYear : actualCurrentYear - 1;
}
