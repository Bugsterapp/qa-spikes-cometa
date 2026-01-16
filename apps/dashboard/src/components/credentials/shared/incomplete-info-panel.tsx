import { Button } from '@cometa/recreo/v2';
import { X } from 'lucide-react';
import { useState, useMemo } from 'react';
import Sheet from '/src/components/atoms/Sheet';
import type { EntityLabels } from './audience-selector';
import { DEFAULT_ENTITY_LABELS } from './audience-selector';
import { IncompleteInfoTable, type ColumnConfig } from './incomplete-info-table';

type IncompleteStudent = {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  grade: string;
};

interface IncompleteInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (excludeIncomplete: boolean) => void;
  students: IncompleteStudent[];
  entityLabels?: EntityLabels;
}

export function IncompleteInfoPanel({
  isOpen,
  onClose,
  onGenerate,
  students,
  entityLabels = DEFAULT_ENTITY_LABELS,
}: IncompleteInfoPanelProps) {
  const [excludeIncomplete, setExcludeIncomplete] = useState(true);

  const columns = useMemo<ColumnConfig<IncompleteStudent>[]>(
    () => [
      {
        header: 'Nombre',
        accessor: (row) => `${row.firstName} ${row.lastName}`,
        width: '50%',
      },
      {
        header: 'Nivel',
        accessor: (row) => row.level,
        width: '25%',
      },
      {
        header: 'Grupo',
        accessor: (row) => row.grade,
        width: '25%',
      },
    ],
    []
  );

  const handleGenerate = () => {
    onGenerate(excludeIncomplete);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-[#202A35]/80 z-[55]" onClick={onClose} />}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Sheet.Content className="max-w-[564px] max-h-[calc(100vh-16px)] m-2 rounded-lg !z-[60]" sheetWithoutBackground>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-8 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Información de los {entityLabels.plural}</h2>
              <Button variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <h3 className="text-base font-semibold text-neutral-900">
                Lista de {entityLabels.plural} con información incompleta
              </h3>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeIncomplete}
                    onChange={(e) => setExcludeIncomplete(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">Excluir {entityLabels.plural}</p>
                    <p className="text-sm text-neutral-600 mt-1">
                      Los {entityLabels.plural} con información incompleta se excluirán del archivo descargable.
                    </p>
                  </div>
                </label>
              </div>

              <IncompleteInfoTable data={students} columns={columns} getRowId={(row) => row.id} />
            </div>

            <div className="px-8 py-4 border-t border-neutral-100 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_-12px_24px_-4px_rgba(145,158,171,0.12)]">
              <div className="flex items-center justify-end">
                <Button className="h-[36px] bg-black" onClick={handleGenerate}>
                  {excludeIncomplete ? 'Generar' : 'Generar de todas formas'}
                </Button>
              </div>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
}
