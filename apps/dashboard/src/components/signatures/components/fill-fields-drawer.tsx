import { XIcon } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@cometa/recreo/v2';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { getFieldLabel, getFieldTypeLabel } from '/src/components/signatures/utils/field-helpers';

interface FillFieldsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

function FieldsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-80 mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-3 w-48 mb-2" />
            <Skeleton className="h-2 w-32" />
          </div>
          <div className="w-64">
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FillFieldsDrawer({ open, onOpenChange, templateId }: FillFieldsDrawerProps) {
  const { data: fields, isLoading } = api.students.getTemplateFields.useQuery(
    { template_id: templateId },
    {
      enabled: open && !!templateId,
    }
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Rellenar campos</h2>
            <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
              <XIcon size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <FieldsSkeleton />
            ) : fields && fields.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-6">
                  Selecciona el campo de origen para cada campo del documento
                </p>
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{getFieldLabel(field)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getFieldTypeLabel(field.type)} • Página {field.page}
                        {field.fieldMeta && 'required' in field.fieldMeta && field.fieldMeta.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                    </div>
                    <div className="w-64">
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder">Sin opciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#919EAB] text-sm text-center py-8">No hay campos disponibles en este template</p>
            )}
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
