import { useState, useEffect } from 'react';
import { Button } from '@cometa/recreo/v2';
import { SchoolStepResourceEntity } from '@cometa/trpc/src/admissions/types';
import { PlayIcon } from 'lucide-react';

export function VideoCard({ resource }: { resource: SchoolStepResourceEntity }) {
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (isYouTubeUrl(resource.source)) {
      const videoId = getYouTubeId(resource.source);
      if (videoId) {
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }
    } else if (isVimeoUrl(resource.source)) {
      const videoId = getVimeoId(resource.source);
      if (videoId) {
        fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data[0] && data[0].thumbnail_large) {
              setThumbnailUrl(data[0].thumbnail_large);
            }
          });
      }
    }
  }, [resource.source]);

  function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  function isVimeoUrl(url: string): boolean {
    return url.includes('vimeo.com');
  }

  function getVimeoId(url: string): string | null {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex">
      <div className="flex-1 max-w-32 break-words">
        <h2 className="text-xs font-semibold">{resource.name}</h2>
        {resource?.description ? (
          <p className="text-neutral-700 text-[10px] mt-1 mb-2">{resource.description}</p>
        ) : null}
        <Button variant="outline" size="sm">
          Abrir
        </Button>
      </div>
      <div className="ml-4 w-16 h-24 relative cursor-pointer rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <div className="w-12 h-12 flex items-center justify-center">
            <PlayIcon className="h-4 w-4 text-white" fill="white" />
          </div>
        </div>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={resource.name || ''}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}
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
