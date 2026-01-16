import React from 'react';

interface FileAttachmentProps {
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
}

const PDFIcon = () => (
  <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0H4C1.79 0 0 1.79 0 4V32C0 34.21 1.79 36 4 36H28C30.21 36 32 34.21 32 32V12L20 0Z" fill="#E53935" />
    <path d="M20 0L32 12H20V0Z" fill="#FFCDD2" />
    <path
      d="M16 18C16 18 12.5 18 10 18C7.5 18 6 19.5 6 22C6 24.5 7.5 26 10 26C12.5 26 16 26 16 26V24C16 24 12.5 24 10 24C8.5 24 8 23.5 8 22C8 20.5 8.5 20 10 20C12.5 20 16 20 16 20V18Z"
      fill="white"
    />
    <path
      d="M18 18V26H22C24.21 26 26 24.21 26 22C26 19.79 24.21 18 22 18H18ZM20 20H22C23.1 20 24 20.9 24 22C24 23.1 23.1 24 22 24H20V20Z"
      fill="white"
    />
    <path d="M12 12V16H14V14H16V12H12Z" fill="white" />
  </svg>
);

export default function FileAttachment({ fileName, fileSize, fileType, fileUrl }: FileAttachmentProps) {
  return (
    <div className="bg-[rgba(139,147,160,0.04)] flex flex-row gap-2.5 h-[76px] items-center justify-start overflow-clip px-3 py-2.5 relative rounded-lg w-full max-w-[344px]">
      <div className="flex flex-col gap-3.5 items-start justify-center p-0 relative">
        <div className="flex flex-row gap-3.5 items-center justify-center p-0 relative w-[281px]">
          <div className="flex-1 flex flex-row gap-3 items-start justify-start p-0 relative">
            <div className="h-9 overflow-clip relative w-8">
              {fileType === 'pdf' ? (
                <PDFIcon />
              ) : (
                <div className="w-8 h-9 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">FILE</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2 items-start justify-start p-0 relative">
              <div className=" leading-[0] not-italic relative text-[#22283a] text-[14px] text-left w-full">
                <p className="block leading-[14px] truncate">{fileName}</p>
              </div>

              <div className="flex flex-row gap-2 items-start justify-start p-0 relative w-full">
                <div className="flex flex-col  justify-center leading-[0] not-italic relative text-[#535765] text-[12px] text-left whitespace-nowrap">
                  <p className="block leading-3">{fileSize}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`Descargar ${fileName}`}
        />
      )}
    </div>
  );
}
