import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';
import { X } from 'lucide-react';

type ModalVariant = 'delete' | 'unsaved' | 'generating';

interface VariantConfig {
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
}

const VARIANT_CONFIG: Record<ModalVariant, VariantConfig> = {
  delete: {
    title: '¿Seguro que quieres eliminar la plantilla?',
    description: 'Se eliminará la plantilla de manera permanente.',
    cancelText: 'Atrás',
    confirmText: 'Eliminar',
  },
  unsaved: {
    title: '¿Seguro que quieres salir?',
    description: 'Si sales ahora, perderás todo lo que llevas avanzado.',
    cancelText: 'Salir de todas formas',
    confirmText: 'Seguir configurando',
  },
  generating: {
    title: 'Estamos preparando las credenciales',
    description:
      'Cuando el archivo esté listo, lo recibirás por correo electrónico para su descarga.\n\nEste proceso puede tardar algunos minutos según la cantidad de credenciales.',
    cancelText: '',
    confirmText: 'Entendido',
  },
};

export interface CredentialModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant: ModalVariant;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
}

export function CredentialModal({
  open,
  onClose,
  onConfirm,
  variant,
  title,
  description,
  cancelText,
  confirmText,
  loading = false,
}: CredentialModalProps) {
  const config = VARIANT_CONFIG[variant];

  const finalTitle = title ?? config.title;
  const finalDescription = description ?? config.description;
  const finalCancelText = cancelText ?? config.cancelText;
  const finalConfirmText = confirmText ?? config.confirmText;

  const isDeleteVariant = variant === 'delete';
  const isGeneratingVariant = variant === 'generating';

  const leftButton = {
    variant: isDeleteVariant ? ('ghost' as const) : ('secondary' as const),
    onClick: isDeleteVariant ? onClose : onConfirm,
    text: isDeleteVariant ? finalCancelText : loading ? 'Procesando...' : finalCancelText,
  };

  const rightButton = {
    variant: isDeleteVariant ? ('destructive' as const) : ('default' as const),
    onClick: isDeleteVariant ? onConfirm : onClose,
    text: isDeleteVariant ? (loading ? 'Procesando...' : finalConfirmText) : finalConfirmText,
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-[#202A35]/80 z-[70]" />}
      <Dialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
        disableCloseOutside
        className="font-lota antialiased z-[75] !w-[440px] !px-8 !pt-6 !pb-3"
        overlay={false}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -right-2 -top-2 p-2 text-[#A2ABB9] hover:text-neutral-600 transition-colors"
            aria-label="Cerrar"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <Dialog.Title className="text-xl font-bold">{finalTitle}</Dialog.Title>
          <Dialog.Description className="text-sm whitespace-pre-line leading-5">{finalDescription}</Dialog.Description>

          {isGeneratingVariant ? (
            <div className="pt-6 pb-3">
              <Button variant="default" className="w-full" onClick={onConfirm} disabled={loading}>
                {finalConfirmText}
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 pt-6 pb-3">
              <Button variant={leftButton.variant} className="flex-1" onClick={leftButton.onClick} disabled={loading}>
                {leftButton.text}
              </Button>
              <Button variant={rightButton.variant} className="flex-1" onClick={rightButton.onClick} disabled={loading}>
                {rightButton.text}
              </Button>
            </div>
          )}
        </div>
      </Dialog.Root>
    </>
  );
}
