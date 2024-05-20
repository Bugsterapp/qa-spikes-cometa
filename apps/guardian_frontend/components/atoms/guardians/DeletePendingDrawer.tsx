import * as Drawer from '~/components/atoms/guardians/Drawer';
import IcInfo from '/public/icons/information-white.svg';
import { Button } from '../Button';
import { useDeletePending } from '~/hooks/useDeletePending';

interface DeletePendingTransferOptionsProps {
  open?: boolean;
  onClose: () => void;
  onDeleted: () => void;
  payinId: string;
  labels: {
    title: React.ReactNode;
    description: React.ReactNode;
  };
}

export const DeletePendingDrawer = ({
  open = true,
  onClose,
  onDeleted,
  payinId,
  labels,
}: DeletePendingTransferOptionsProps) => {
  const { handleDeleted, isLoading } = useDeletePending();

  return (
    <Drawer.Root open={open}>
      <Drawer.Overlay />
      <Drawer.Content className="max-w-md">
        <div className="flex flex-col items-center px-5 py-6 gap-y-6">
          <Drawer.Title className="flex flex-col items-center text-xl text-center text-gray-300 gap-y-6">
            <div className="flex flex-col items-center">
              <IcInfo className="w-16 h-16 mb-4 text-error" viewBox="0 0 54 54" width="none" height="none" />
              <div className="text-lg text-center">{labels.title}</div>
            </div>
            <div className="text-sm text-center px-2.5 py-2">{labels.description}</div>
          </Drawer.Title>
          <div className="w-full h-px border-b border-[#D0D0D0]" />
          <div className="flex flex-col gap-y-4">
            <p className="text-sm font-medium text-center text-gray-300">
              ¿Quieres eliminar el pago en proceso de todos modos?
            </p>
            <div className="flex flex-col gap-y-2.5">
              <Button
                onClick={() => {
                  handleDeleted(payinId, onClose, onDeleted);
                }}
                className="w-full px-1 py-3 text-sm text-[#F46F6F] font-medium rounded-2xl bg-[#FFE3E3] hover:bg-[#F46F6F]/30 active:bg-[#F46F6F]/50 shadow-none disabled:cursor-not-allowed"
                disabled={isLoading || !open}
              >
                Eliminar de todos modos
              </Button>

              <button
                onClick={onClose}
                className="w-full py-3 text-sm font-medium text-blue-100 bg-transparent disabled:text-gray-100 disabled:cursor-not-allowed rounded-2xl hover:bg-blue-100/5 active:bg-blue-100/20 "
                disabled={isLoading || !open}
              >
                Atrás
              </button>
            </div>
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
};
