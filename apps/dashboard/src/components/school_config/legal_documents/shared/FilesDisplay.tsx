import { ReactNode } from 'react';
import { FileResponse } from '@cometa/trpc/src/bot/types';
import { FilePreview } from './FilePreview';

type FilesDisplayProps = {
  files: FileResponse[];
  title?: string;
  renderFile?: (file: FileResponse) => ReactNode;
  gridCols?: '1' | '2';
};

export function FilesDisplay({ files, title = 'Archivos', renderFile, gridCols = '1' }: Readonly<FilesDisplayProps>) {
  if (files.length === 0) return null;

  const defaultRenderFile = (file: FileResponse) => <FilePreview key={file.id} file={file} />;
  const fileRenderer = renderFile || defaultRenderFile;

  const gridClass = gridCols === '2' ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[#22283a] text-base font-semibold font-lota">
        {title} ({files.length})
      </h3>
      <div className={`grid ${gridClass} gap-4`}>{files.map(fileRenderer)}</div>
    </div>
  );
}
