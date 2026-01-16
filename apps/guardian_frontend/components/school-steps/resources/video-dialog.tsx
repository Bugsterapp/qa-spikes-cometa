import { Dialog } from '@cometa/recreo';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/lazy';

type VideoDialogProps = {
  title: string;
  url: string;
  isOpen: boolean;
  onClose: () => void;
};
export function VideoDialog({ title, url, isOpen, onClose }: VideoDialogProps) {
  const [isGoogleDrive, setIsGoogleDrive] = useState(false);
  const [processedUrl, setProcessedUrl] = useState('');

  useEffect(() => {
    const isGDrive = url.includes('drive.google.com');
    setIsGoogleDrive(isGDrive);

    if (isGDrive) {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch && fileIdMatch[0]) {
        const fileId = fileIdMatch[0];
        setProcessedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
      } else {
        setProcessedUrl(url);
      }
    } else {
      setProcessedUrl(url);
    }
  }, [url]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()} className="p-0 bg-black rounded-none">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
        <Dialog.Title className="text-white mb-0">{title}</Dialog.Title>
        <Dialog.Close className="bg-black text-white rounded-full outline-none">
          <X />
        </Dialog.Close>
      </div>

      <div className="h-[calc(100vh-40px)] flex-1 bg-black">
        {isGoogleDrive ? (
          <iframe
            src={processedUrl}
            className="w-full h-full"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={processedUrl}
              width="100%"
              height="100%"
              controls
              playing
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    disablePictureInPicture: true,
                  },
                },
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                  },
                },
                vimeo: {
                  playerOptions: {
                    byline: false,
                    portrait: false,
                    title: false,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </Dialog.Root>
  );
}
