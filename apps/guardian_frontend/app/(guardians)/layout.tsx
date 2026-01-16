'use client';

import Navbar from '~/components/Navbar';
import AppMenu from '../components/Menu';
import { Toaster } from '~/components/Toast/Toaster';
import { useSendPageEvent } from '~/hooks/useSendEvent';
import { useEffect } from 'react';
import { PageViewedCategory, TrackEvents } from '~/constants/events';

export default function GuardiansLayout({ children }: { children: React.ReactNode }) {
  const sendPageEvent = useSendPageEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.announcements.pageViewed, PageViewedCategory);
  }, []);

  return (
    <div className="bg-[#F8F9FB] flex flex-col min-h-screen">
      <div className="sticky top-0 z-20">
        <Navbar MenuComponent={AppMenu} />
      </div>
      <div className="mx-auto max-w-md w-full">
        <Toaster />
        {children}
      </div>
    </div>
  );
}
