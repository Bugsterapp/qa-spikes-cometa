import type { ColumnsResponse } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { useCallback, useMemo, useState } from 'react';
import useSendTrackEventWithUserName from '../hooks/useSendTrackEventWithUserName';
import IcConfigurereport from '/public/assets/icons/configure_report.svg';
import IcClose from '/public/assets/icons/ic_close.svg';
import Dialog from '/src/components/atoms/Dialog';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import Button from '/src/components/organisms/dashboard/Button';
import { GenericRowCheckBoxButton } from '/src/components/organisms/dashboard/StudentAssignedTable';
import { useReportConfig } from '/src/hooks/useReportConfig';

type DownloadReportProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpen: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isMutating?: boolean;
  openDownloadReportMenuOptions: React.Dispatch<any>;
  handleDownloadReportComplete: () => void;
  handleDownloadReportPersonalized: () => void;
  handleDownloadInvoices: () => void;
  storeKey: string;
  reportHeaderTitle: string;
  completeReportSubtitle: string;
  zipReportSubtitle: string;
};

export function DownloadReport({
  open,
  onClose,
  onOpen,
  isLoading,
  handleDownloadReportComplete,
  handleDownloadInvoices,
  handleDownloadReportPersonalized,
  openDownloadReportMenuOptions,
  storeKey,
  reportHeaderTitle,
  completeReportSubtitle,
  zipReportSubtitle,
}: DownloadReportProps) {
  const [selectedRows] = useReportConfig(storeKey);
  return (
    <>
      <Dialog.Root
        classNames="px-0 pt-4 pb-0 h-[465px] min-w-[500px]"
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          } else onOpen();
        }}
      >
        {isLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : (
          <>
            <Dialog.Title>
              <div className="flex justify-between px-6">
                <div className="flex flex-col">
                  <h3 className="flex mb-1 text-lg font-bold">Descarga de {reportHeaderTitle}</h3>
                  <span className="text-sm font-normal flex text-[#637381]">
                    Elige entre los distintos reportes que puedes descargar
                  </span>
                </div>
                <Dialog.Close onClick={onClose} className="-translate-y-3">
                  <IcClose fill="#637381" />
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div className="h-[1px] my-4 bg-[rgba(145,158,171,0.24)] mx-5" />
            <div className="px-4">
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center">
                <div className="flex flex-col items-start gap-2 ">
                  <h3 className="font-semibold text-foreground">Reporte personalizado</h3>
                  <p className="text-xs text-left text-gray-600">
                    Configura un reporte a tu medida, guárdalo y lo tendrás disponible cada vez que lo necesites
                  </p>
                </div>
                {selectedRows?.length === 0 && (
                  <Button
                    className="py-1 mt-2 text-sm font-bold bg-white border rounded-lg border-blue-secondary-200 text-blue-secondary-200 h-9"
                    variant="outline"
                    onClick={openDownloadReportMenuOptions}
                    id="report-config-button"
                  >
                    Configurar
                  </Button>
                )}
                {selectedRows?.length > 0 && (
                  <div className="flex">
                    <Button
                      className="py-1 mt-2 text-sm font-bold bg-white border rounded-l-lg rounded-r-none border-blue-secondary-200 text-blue-secondary-200 h-9"
                      variant="outline"
                      onClick={handleDownloadReportPersonalized}
                    >
                      Descargar
                    </Button>
                    <Tooltip message="Configurar reporte personalizado">
                      <Button
                        className="flex w-10 p-0 py-1 mt-2 text-sm font-bold bg-white border rounded-l-none rounded-r-lg border-blue-secondary-200 text-blue-secondary-200 h-9"
                        variant="outline"
                        onClick={openDownloadReportMenuOptions}
                      >
                        <IcConfigurereport />
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="font-semibold text-foreground">Reporte completo</h3>
                  <p className="text-xs text-left text-gray-600">
                    Descarga toda la información que tenemos sobre cada uno de {completeReportSubtitle}
                  </p>
                </div>
                <Button
                  className="py-1 mt-2 text-sm font-bold bg-white border rounded-lg border-blue-secondary-200 text-blue-secondary-200 h-9"
                  variant="outline"
                  onClick={handleDownloadReportComplete}
                >
                  Descargar
                </Button>
              </div>
              <div className="bg-white rounded-lg h-[104px] px-[18px] py-4 mb-4 flex border border-[#DFE3E8] gap-6 items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="font-semibold text-foreground">Facturas (XML y PDF)</h3>
                  <p className="text-xs text-left text-gray-600">
                    Descarga todas las facturas emitidas {zipReportSubtitle}
                  </p>
                </div>
                <Button
                  className="py-1 mt-2 text-sm font-bold bg-white border rounded-lg border-blue-secondary-200 text-blue-secondary-200 h-9"
                  variant="outline"
                  onClick={handleDownloadInvoices}
                >
                  Descargar
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog.Root>
    </>
  );
}

type DownloadReportOptions = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
  onOpen: () => void;
  isLoading?: boolean;
  storeKey: string;
  columnsData: ColumnsResponse['columns'];
};
export function DownloadReportOptions({
  open,
  onClose,
  onOpen,
  isLoading,
  columnsData,
  storeKey,
}: DownloadReportOptions) {
  return (
    <>
      <Dialog.Root
        classNames="min-w-[500px] px-0 pt-4 pb-1 h-[465px]"
        open={open}
        hideShadow
        overlay={false}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          } else onOpen();
        }}
      >
        {isLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : (
          <div id="report-config-menu-options">
            <Dialog.Title>
              <div className="flex justify-between px-6">
                <div className="flex flex-col">
                  <h3 className="flex mb-1 text-lg font-bold">Personaliza tu reporte</h3>
                  <span className="text-sm font-normal flex text-[#637381]">
                    Selecciona la información que quieres incluir en tu descargable.{' '}
                  </span>
                </div>
                <Dialog.Close onClick={onClose} className="-translate-y-3">
                  <IcClose fill="#637381" />
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div>
              {columnsData ? (
                <TableComponent data={columnsData} onClose={onClose} storeKey={storeKey} />
              ) : (
                <div className="relative flex flex-col justify-between min-h-[380px]">
                  <div className="h-[293px] pr-1 pb-6">
                    <div className="flex items-center bg-[#FBFCFD] sticky top-0 z-10 pl-3 h-[45px]">
                      <div className="p-3.5">
                        <Skeleton className="w-5 h-5" />
                      </div>
                      <Skeleton className="w-1/3 h-4 ml-2" />
                    </div>
                    <div className="h-full overflow-y-scroll scrollbar">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="flex items-center mx-3 border-b border-gray-300">
                          <div className="p-3.5">
                            <Skeleton className="w-5 h-5" />
                          </div>
                          <Skeleton className="w-3/4 h-4 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-[64px] bg-white shadow-combinedShadow w-full rounded-b-2xl">
                    <div className="flex items-center justify-end flex-1 h-full gap-3 px-3">
                      <Skeleton className="w-20 h-8" />
                      <Skeleton className="h-8 w-36" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog.Root>
    </>
  );
}

const TableComponent: React.FC<{ data: ColumnsResponse['columns']; onClose: () => void; storeKey: string }> = ({
  data,
  onClose,
  storeKey,
}) => {
  const [selectedRowsPersisted, setSelectedRowsPersisted] = useReportConfig(storeKey);
  const [localSelectedRows, setLocalSelectedRows] = useState<string[]>(selectedRowsPersisted);
  const [isScrolled, setIsScrolled] = useState(false);
  const sendTrackEvent = useSendTrackEventWithUserName();

  const dataAsArray = useMemo(() => Object.entries(data), [data]);

  const selectAllChecked =
    localSelectedRows.length === 0 ? false : localSelectedRows.length === dataAsArray.length ? true : 'indeterminate';

  const handleSelectRow = useCallback((key: string) => {
    setLocalSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(key)) {
        return prevSelectedRows.filter((selectedRow) => selectedRow !== key);
      }
      return [...prevSelectedRows, key];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (localSelectedRows.length === dataAsArray.length) {
      setLocalSelectedRows([]);
    } else {
      setLocalSelectedRows(dataAsArray.map(([key]) => key));
    }
  }, [dataAsArray, localSelectedRows]);

  const handleSave = useCallback(() => {
    const hasChanged = JSON.stringify(selectedRowsPersisted) !== JSON.stringify(localSelectedRows);
    if (hasChanged) {
      sendTrackEvent(`dashboard: ${storeKey} | DownloadReportCustomizer`, {
        selected_columns_count: localSelectedRows.length,
        selected_columns: localSelectedRows,
        added_columns: localSelectedRows.filter((key) => !selectedRowsPersisted.includes(key)),
        removed_columns: selectedRowsPersisted.filter((key) => !localSelectedRows.includes(key)),
      });
    }
    setSelectedRowsPersisted(localSelectedRows);
    onClose();
  }, [localSelectedRows, setSelectedRowsPersisted, onClose, selectedRowsPersisted, sendTrackEvent, storeKey]);

  const handleDiscard = useCallback(() => {
    setLocalSelectedRows(selectedRowsPersisted);
    onClose();
  }, [selectedRowsPersisted, onClose]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setIsScrolled(top > 5);
  }, []);

  return (
    <div className="relative flex flex-col justify-between min-h-[380px]">
      <div className="h-[293px] pr-1 pb-6">
        <div
          className={cn(
            'flex items-center bg-[#FBFCFD] sticky top-0 z-10 pl-4 h-[45px] transition-shadow duration-300',
            {
              'shadow-card': isScrolled,
            }
          )}
          onScroll={handleScroll}
        >
          <div className="py-2 pl-1 pr-2">
            <GenericRowCheckBoxButton checked={selectAllChecked} onClick={handleSelectAll} className="px-1 py-2" />
          </div>
          <div className="text-left text-[#637381] text-sm font-bold">Nombre de la columna</div>
        </div>
        <div className="h-full overflow-y-scroll scrollbar" onScroll={handleScroll}>
          {dataAsArray.map(([key, value], index) => (
            <div key={`${index}-${key}`} className="flex items-center border-b border-[rgba(145,158,171,0.24)] mx-4">
              <div className="py-2 pl-1 pr-2 cursor-pointer">
                <GenericRowCheckBoxButton
                  checked={localSelectedRows.includes(key)}
                  className="py-1.5 px-1 cursor-pointer"
                  onClick={() => handleSelectRow(key)}
                />
              </div>
              <div className="text-sm text-left">{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[64px] bg-white shadow-combinedShadow w-full rounded-b-2xl">
        <div className="flex items-center justify-end flex-1 h-full gap-4 px-4">
          <button type="button" className="font-bold text-[#3366FF] text-sm" onClick={handleDiscard}>
            Descartar
          </button>
          <Tooltip
            message="Selecciona al menos una columna para continuar"
            disableHover={localSelectedRows?.length > 0}
          >
            <Button
              variant={localSelectedRows?.length === 0 ? 'ghost' : 'secondary'}
              className={cn('h-[36px] w-[155px] disabled:cursor-not-allowed', {
                'bg-[#E5E8EB] ': localSelectedRows?.length === 0,
              })}
              onClick={handleSave}
              disabled={localSelectedRows?.length === 0}
              id="report-config-save-button"
            >
              Guardar cambios
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
