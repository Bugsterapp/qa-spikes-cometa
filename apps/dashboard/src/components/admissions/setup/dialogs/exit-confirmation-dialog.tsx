import { Button } from '@cometa/recreo/v2';
import { Dialog } from '@cometa/recreo';

export type ExitConfirmationDialogProps = {
  isOpen: boolean;
  onExitWithoutSaving: () => void;
  onContinueEditing: () => void;
  context?: 'setup' | 'configuration';
};

export function ExitConfirmationDialog({
  isOpen,
  onExitWithoutSaving,
  onContinueEditing,
  context = 'setup',
}: ExitConfirmationDialogProps) {
  const getDialogContent = () => {
    switch (context) {
      case 'configuration':
        return {
          title: '¡Aún no terminamos!',
          description:
            'Guardamos todo lo que hiciste, pero aún quedan pasos por configurar antes de poder usar tu flujo de admisión.',
        };
      case 'setup':
      default:
        return {
          title: '¿Seguro que quieres salir?',
          description: 'Si sales ahora, perderás todo lo que llevas avanzado.',
        };
    }
  };

  const { title, description } = getDialogContent();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onContinueEditing();
        }
      }}
      disableCloseOutside
      className="font-lota antialiased z-[60]"
      overlay
    >
      <div className="max-w-sm space-y-4">
        <Dialog.Title className="text-xl">{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>

        <div className="flex gap-4 pt-2">
          <Button variant="light" className="flex-1" onClick={onExitWithoutSaving}>
            Salir sin guardar
          </Button>
          <Button className="flex-1" onClick={onContinueEditing}>
            Seguir configurando
          </Button>
        </div>
      </div>
    </Dialog.Root>
  );
}
