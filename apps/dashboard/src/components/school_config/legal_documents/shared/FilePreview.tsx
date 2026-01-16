import { FileResponse } from '@cometa/trpc/src/bot/types';
import { handleDownloadFile } from '../../../../utils/file-utils';
import { formatFileSize } from '../../../../utils/legal-documents-utils';
import IcDownload from 'public/assets/icons/ic_download.svg';
import { Button } from '@cometa/recreo/v2';

type FilePreviewProps = {
  file: FileResponse;
  label?: string;
};

export function FilePreview({ file, label }: Readonly<FilePreviewProps>) {
  const isImage = file.file_type.startsWith('image/');
  const isPdf = file.file_type === 'application/pdf';

  const handleDownload = async () => {
    await handleDownloadFile(file.file_url, file.file_name);
  };

  const renderFileContent = () => {
    if (isImage) {
      return <img src={file.file_url} alt={file.file_name} className="w-full h-full object-contain" />;
    }

    const iconPath = isPdf
      ? 'M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
      : 'M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z';

    const secondPath = isPdf ? 'M14 2V8H20' : 'M13 2V9H20';

    return (
      <div className="flex flex-col items-center gap-2">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#697086]">
          <path d={iconPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={secondPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isPdf && <span className="text-sm font-medium text-[#697086]">PDF</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm font-medium text-[#697086]">{label}</p>}
      <div className="relative rounded-lg overflow-hidden border border-[#eceff6] bg-white">
        <div className="aspect-video relative bg-[#f8f9fb] flex items-center justify-center">{renderFileContent()}</div>
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#22283a] truncate">{file.file_name}</p>
            <p className="text-xs text-[#697086] mt-1">{formatFileSize(file.file_size)}</p>
          </div>
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Descargar archivo"
          >
            <IcDownload className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
