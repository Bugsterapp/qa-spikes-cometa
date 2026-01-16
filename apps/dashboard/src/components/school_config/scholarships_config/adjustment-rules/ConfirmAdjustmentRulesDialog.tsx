'use client';

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@cometa/recreo/v2';
import { Button } from '@cometa/recreo/v2';
import InfoIcon from '/public/assets/icons/ic_info_outline.svg';

export type ConfirmAdjustmentRulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function ConfirmAdjustmentRulesDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ConfirmAdjustmentRulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f8f9fb] border-[#d0d8e9] flex flex-col gap-4 p-6 rounded-md shadow-lg max-w-md">
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle className="font-['Lota_Grotesque'] font-semibold text-lg leading-7 text-[#22283a]">
            ¿Estás seguro de que deseas este nuevo orden de aplicación?
          </DialogTitle>
          <DialogDescription className="font-['Lota_Grotesque'] text-sm leading-5 text-[#697086]">
            Al aplicar estos cambios se aplicarán únicamente a órdenes en estado "pendiente de pago" y todas las nuevas
            órdenes que se generen.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#e8f4ff] border border-[#64b5ff] rounded-lg px-4 py-3 flex gap-3 items-start">
          <div className="flex items-start pt-[2px]">
            <InfoIcon className="w-4 h-4 text-[#0d4f8c]" />
          </div>
          <div className="flex-1">
            <p className="font-['Lota_Grotesque'] text-sm leading-5 text-[#0d4f8c]">
              <span className="font-['Lota_Grotesque'] font-semibold">Importante:</span> Los cambios no son retroactivos
              y no afectarán a las órdenes ya completadas o facturadas.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 px-4 py-2 rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 px-4 py-2 rounded-full bg-[#22283a] hover:bg-[#1a1f2e] text-white shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]"
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
