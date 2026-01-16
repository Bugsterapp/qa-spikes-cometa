import { useState, useRef } from 'react';
import { useAlert } from '~/hooks';
import { cn } from '~/lib/cn';
import AddFile from '~/public/icons/fi-rr-file-add.svg';
import { Button } from '~/components/ui/Button';

interface UploadFileProps {
  disabled?: boolean;
  buttonMessage?: string;
  successMessage?: string;
  failureMessage?: string;
  onUploadFile: (file: File) => void;
  acceptedFileTypes?: string[];
  buttonClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function UploadFile({
  onUploadFile,
  buttonMessage,
  buttonClassName,
  iconClassName,
  textClassName,
  disabled,
  successMessage = 'Archivo subido correctamente',
  failureMessage = 'Error al subir el archivo',
  acceptedFileTypes = ['.pdf', '.png', '.jpg', '.jpeg'],
}: UploadFileProps) {
  const { setAlert } = useAlert();
  const [disableButton, setdisableButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setdisableButton(true);
    if (file) {
      try {
        await onUploadFile(file);
        setAlert(successMessage, 'success');
      } catch (error) {
        setAlert(failureMessage);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setdisableButton(false);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileUpload}
      />
      <Button
        className={cn(
          'w-full px-4 py-3 bg-transparent border border-[#4A5CFF] border-[1.5px] rounded-full cursor-pointer hover:bg-transparent active:bg-transparent shadow-none hover:shadow-none active:shadow-none disabled:shadow-none',
          buttonClassName
        )}
        disabled={disabled || disableButton}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center">
          <AddFile className={cn('text-[#4A5CFF] mr-2', iconClassName)} />
          <span className={cn('text-sm font-medium text-[#4A5CFF] font-medium', textClassName)}>{buttonMessage}</span>
        </div>
      </Button>
    </>
  );
}
