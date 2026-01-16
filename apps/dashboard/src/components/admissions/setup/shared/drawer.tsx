import { Button } from '@cometa/recreo/v2';
import { X } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { Tooltip } from '/src/components/atoms/Tooltip';

interface ConfigurationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
  saveDisabledTooltip?: string;
}

export function ConfigurationDrawer({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  isLoading = false,
  isSaveDisabled = false,
  saveDisabledTooltip,
}: ConfigurationDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.Content className="max-w-[564px] max-h-[calc(100vh-16px)] m-2 rounded-lg font-lota antialiased">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-8 py-4 border-b border-neutral-200">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">{children}</div>

          <div className="px-8 py-4 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),_0px_-12px_24px_-4px_rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-end gap-4">
              <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                Descartar
              </Button>
              {isSaveDisabled && saveDisabledTooltip ? (
                <Tooltip side="top" message={saveDisabledTooltip}>
                  <Button onClick={onSave} disabled>
                    Guardar
                  </Button>
                </Tooltip>
              ) : (
                <Button onClick={onSave} disabled={isLoading || isSaveDisabled}>
                  Guardar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
