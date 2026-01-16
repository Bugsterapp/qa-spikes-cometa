import { Button } from '@cometa/recreo/v2';
import { SchoolStepResourceEntity, UrlFileEntity } from '@cometa/trpc/src/admissions/types';

export function FileCard({ resource, file }: { resource: SchoolStepResourceEntity; file?: UrlFileEntity }) {
  const fileUrl = file?.url || '';
  const isPdf = fileUrl.includes('.pdf');
  const resourceName = resource.name || '';

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex">
      <div className="flex-1 max-w-32 break-words">
        <h2 className="text-xs font-semibold">{resourceName}</h2>
        {resource?.description ? (
          <p className="text-neutral-700 text-[10px] mt-1 mb-2">{resource.description}</p>
        ) : null}
        <Button variant="outline" size="sm">
          Abrir
        </Button>
      </div>
      <div className="ml-4 w-16 h-24 relative cursor-pointer rounded-lg overflow-hidden">
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
  );
}

function PlaceholderImage() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0" />
    </svg>
  );
}
