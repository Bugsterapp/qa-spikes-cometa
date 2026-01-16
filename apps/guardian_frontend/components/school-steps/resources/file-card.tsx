import { useState } from 'react';
import { FileDialog } from './file-dialog';
import { SchoolStepResourceEntity, UrlFileEntity } from '@cometa/trpc/src/admissions/types';

export function FileCard({ resource, file }: { resource: SchoolStepResourceEntity; file?: UrlFileEntity }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);

  const fileUrl = file?.url || '';
  const isPdf = fileUrl.includes('.pdf');

  const resourceName = resource.name || '';

  return (
    <>
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex">
        <div className="flex-1">
          <h2 className="text-base font-bold mb-2">{resourceName}</h2>
          {resource?.description ? <p className="text-gray-600 mb-3">{resource.description}</p> : null}
          <button
            className="text-sm font-semibold w-20 px-5 py-2.5 border-2 border-neutral-900 bg-transparent rounded-full text-center hover:bg-neutral-900 hover:text-white"
            onClick={openDialog}
          >
            Abrir
          </button>
        </div>
        <div className="ml-4 w-32 h-48 relative cursor-pointer rounded-lg overflow-hidden" onClick={openDialog}>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {fileUrl === '' ? (
              <PlaceholderImage />
            ) : isPdf ? (
              <iframe src={fileUrl} width="100%" height="100%" style={{ border: 'none', borderRadius: '8px' }} />
            ) : (
              <img src={fileUrl} alt={resourceName} className="w-full h-full object-cover rounded-lg" />
            )}
          </div>
          <div className="absolute inset-0 z-20 rounded-lg border-2 border-neutral-50" />
        </div>
      </div>

      <FileDialog title={resourceName} url={fileUrl} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
}

function PlaceholderImage() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0" />
    </svg>
  );
}
