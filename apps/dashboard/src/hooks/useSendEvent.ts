import * as React from 'react';
import { sendPageEvent, sendTrackEvent } from '../utils/events';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { UAParser } from 'ua-parser-js';
import { useSelectedSchool } from '../guards/AuthGuard';

export const useSendEvent = () => {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const duration = React.useRef(new Date().getTime());
  const { device, os } = UAParser(typeof window !== 'undefined' ? window.navigator.userAgent : '');

  const _calculateDuration = () => {
    const start = duration.current;
    const end = new Date().getTime();
    const durationInSeconds = (end - start) / 1000;
    return durationInSeconds;
  };

  const _sendTrackEvent = (eventName: string, properties?: object) => {
    sendTrackEvent(
      eventName,
      {
        schoolID: selectedSchool?.id ?? undefined,
        schoolName: selectedSchool?.name ?? undefined,
        email: session?.user?.email,
        first_name: session?.user?.first_name,
        last_name: session?.user?.last_name,
        created_date: new Date().toLocaleDateString('es-MX', { dateStyle: 'short' }),
        user_id: session?.user?.id,
        path: pathname,
        utm_source: searchParams?.get('utm_source'),
        utm_campaign: searchParams?.get('utm_campaign'),
        ...properties,
        duration: _calculateDuration(),
      },
      {
        context: {
          device: {
            ...device,
            os,
          },
        },
      }
    );
  };
  return _sendTrackEvent;
};

export const useSendPageEvent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { device, os } = UAParser(typeof window !== 'undefined' ? window.navigator.userAgent : '');
  return (
    pageName: string,
    category?: string,
    properties?: Record<string, any>,
    options?: SegmentAnalytics.SegmentOpts
  ) =>
    sendPageEvent(
      pageName,
      category,
      {
        utm_source: searchParams?.get('utm_source'),
        utm_campaign: searchParams?.get('utm_campaign'),
        path: pathname,
        ...properties,
      },
      {
        context: {
          device: {
            ...device,
            os,
          },
        },
        ...options,
      }
    );
};
