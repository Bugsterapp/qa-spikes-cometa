import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@cometa/utils';

interface AnnouncementHeaderProps {
  coverImage?: string;
  title: string;
  studentName: string;
  date?: string;
  schoolLogo?: string;
  onClickBack: () => void;
}

export default function AnnouncementHeader({
  coverImage,
  title,
  studentName,
  date,
  schoolLogo,
  onClickBack,
}: AnnouncementHeaderProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="w-full">
      <div
        className={cn(
          'w-full bg-[#F4F6F8] min-h-[70px] flex items-center relative px-3 py-4 max-h-52 overflow-hidden',
          {
            'h-72': Boolean(coverImage),
          }
        )}
      >
        <button
          onClick={onClickBack}
          className={cn(
            'flex items-center gap-2 w-9 h-9 rounded-full justify-center bg-white absolute top-4 left-3 z-[2]',
            {
              'bottom-0': !coverImage,
            }
          )}
        >
          <ChevronLeft className="w-5 h-5 text-[#444c60]" />
        </button>

        {coverImage && (
          <img className="w-full h-full object-cover absolute top-0 left-0" src={coverImage} alt="Cover Image" />
        )}
      </div>
      <div className="relative w-full bg-white">
        <div className="flex flex-row items-center relative w-full">
          <div className="box-border flex flex-row items-center justify-between pb-4 pt-5 px-4 relative w-full">
            <div className="flex-1 flex flex-col gap-1 items-start justify-start p-0 relative">
              <h2 className="flex flex-row gap-1 items-center justify-start p-0 relative text-xl font-semibold">
                {title}
              </h2>

              <div className="flex flex-row gap-2.5 items-center justify-start p-0 relative w-full">
                <div className="flex flex-col gap-1 items-start justify-center p-0 relative">
                  <p className="block text-sm font-semibold leading-5">{studentName}</p>
                </div>

                <div className="relative w-1 h-1">
                  <div className="w-full h-full bg-[#535765] rounded-full" />
                </div>

                <div className=" leading-[0] not-italic relative text-[#444c60] text-[12px] text-left whitespace-nowrap tracking-[0.1px]">
                  <p className="block leading-normal">{formattedDate}</p>
                </div>
              </div>
            </div>

            {schoolLogo && <img className="w-8 h-8 rounded-full object-cover" src={schoolLogo} alt="School Logo" />}
          </div>
        </div>
        <div className="absolute border-[#bac1d8] border-b border-solid inset-x-0 bottom-0" />
      </div>
    </div>
  );
}
