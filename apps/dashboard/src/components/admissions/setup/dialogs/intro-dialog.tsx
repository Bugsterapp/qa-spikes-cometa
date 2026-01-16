import { XIcon } from 'lucide-react';
import { Button } from '@cometa/recreo/v2';
import { Dialog } from '@cometa/recreo';

type IntroDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
};

export function IntroDialog({ isOpen, onClose, onNext }: IntroDialogProps) {
  return (
    <Dialog.Root
      open={isOpen}
      position="center"
      className="font-lota antialiased z-[60] max-w-lg"
      overlay
      disableCloseOutside
    >
      <div className="space-y-4 relative w-full">
        <Dialog.Title className="text-xl font-bold">¿Qué es el proceso de admisión?</Dialog.Title>

        <Button variant="ghost" onClick={onClose} className="absolute -top-6 -right-2 p-0 h-auto">
          <XIcon className="w-4 h-4 text-gray-600" />
        </Button>

        <div className="space-y-6">
          <div className="text-neutral-700 text-sm">
            <span className="font-bold">Arma tu proceso paso a paso: </span>
            <span>
              Te mostramos cómo elegir y ordenar los pasos de tu flujo ideal. Puedes partir con lo esencial y luego
              ajustar.
            </span>
          </div>

          <div className="bg-gray-300 rounded-lg aspect-video flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM19 33L33.5 23.5L19 15V33Z"
                fill="white"
              />
            </svg>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button onClick={onNext}>Ok, entendido</Button>
          </div>
        </div>
      </div>
    </Dialog.Root>
  );
}
