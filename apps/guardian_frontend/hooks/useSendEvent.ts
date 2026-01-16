import * as React from 'react';
import { useSelectedSchool } from '~/stores/globalStore';
import { sendPageViewed, sendTrackEvent } from '../utils/events';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { UAParser } from 'ua-parser-js';

/**
 * @deprecated Do not use this hook, use useSendEvent instead
 */
const useSendTrackEvent = () => {
  const { data: session } = useSession();
  const sendTrackEventDefault = (eventName: string, properties?: object) => {
    sendTrackEvent(eventName, {
      schools: session?.user?.schools?.map((school) => ({ id: school.id, name: school.name })),
      gender: session?.user?.gender,
      email: session?.user?.email,
      state: session?.user?.state,
      user_id: session?.user?.id,
      ...properties,
    });
  };
  return sendTrackEventDefault;
};

export default useSendTrackEvent;

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
    sendPageViewed(
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
