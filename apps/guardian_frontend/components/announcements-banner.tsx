import { cn } from '@cometa/utils';
import { Mail } from 'lucide-react';

interface AnnouncementsBannerProps {
  pendingCount: number;
  className?: string;
}

export default function AnnouncementsBanner({ pendingCount, className }: AnnouncementsBannerProps) {
  const plural = pendingCount > 1;
  return (
    <div className={cn('bg-gradient-35 from-[#7b35e8] via-white to-[#FE62B0] p-0.5 rounded-lg', className)}>
      <div className="bg-white text-[#444c60] font-semibold rounded-md px-3.5 py-4 flex gap-2.5 items-center">
        <Mail className="w-4" />
        <p>{`Tienes ${pendingCount} comunicado${plural ? 's' : ''} pendiente${plural ? 's' : ''}`}</p>
      </div>
    </div>
  );
}
