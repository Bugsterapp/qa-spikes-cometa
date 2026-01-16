import { Dialog } from '@cometa/recreo';
import { X } from 'lucide-react';

type FileDialogProps = {
  title: string;
  url: string;
  isOpen: boolean;
  onClose: () => void;
};
export function FileDialog({ title, url, isOpen, onClose }: FileDialogProps) {
  const isPdf = url.includes('.pdf');

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()} className="p-0 bg-black rounded-none">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
        <Dialog.Title className="text-white mb-0">{title}</Dialog.Title>
        <Dialog.Close className="bg-black text-white rounded-full outline-none">
          <X />
        </Dialog.Close>
      </div>

      <div className="h-[calc(100vh-40px)] flex-1 bg-black">
        {isPdf ? (
          <iframe src={url} width="100%" height="100%" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <img src={url} alt={title} className=" w-full h-auto" />
          </div>
        )}
      </div>
    </Dialog.Root>
  );
}
