import { useState, useEffect } from 'react';
import { useDownload } from '/src/components/DownloadManager';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { Button } from '@cometa/recreo';
import IcDownload from '/public/assets/icons/ic_download.svg';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

export function DownloadAction({ filters: initialFilters }: { filters: Record<string, boolean | string[]> }) {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const { addDownload, downloadCompleted, downloadFailed } = useDownload();
  const { mutateAsync: downloadReport } = api.admissions.getAdmissionsReport.useMutation();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  async function handleDownload() {
    const downloadId = addDownload({
      reportName: 'Reporte de admisiones.xlsx',
    });

    try {
      const report = await downloadReport({ school_id: schoolId, ...filters });

      if (!report?.data) {
        downloadFailed('Error al descargar el reporte: No hay datos.');
        return;
      }

      const uint8Array = new Uint8Array(report?.data);
      const blob = new Blob([uint8Array], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);

      downloadCompleted(downloadId, url);
    } catch (error) {
      downloadFailed(`Error al descargar el reporte: ${(error as Error).message}`);
    }
  }

  return (
    <Tooltip message="Descargar reporte">
      <Button variant="solid-light" size="medium" color="black" className="px-4" onClick={handleDownload}>
        <IcDownload width={20} height={20} />
      </Button>
    </Tooltip>
  );
}
