import { Session } from 'next-auth';
import { analytics } from '~/lib/segment';

type Properties = Record<string, unknown>;

export const sendTrackEvent = (eventName: string, properties?: Properties, options?: SegmentAnalytics.SegmentOpts) => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined')
    analytics.track(eventName, properties, options);
};

export const sendIdentifyEvent = (
  userId: string,
  user: Session['user'],
  profileProperties: Record<string, string | number | boolean> = {}
) => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined')
    analytics.identify(userId, { ...user, ...profileProperties, distinct_id: userId });
};

export const sendPageViewedEvent = (pageName: string, user?: Session['user']) => {
  const properties = {
    pageName,
    screenWidth: window?.innerWidth,
    screenHeight: window?.innerHeight,
    url: window?.location?.href,
    plataform: window?.navigator.userAgent,
    firstName: user?.first_name,
    lastName: user?.last_name,
    gender: user?.gender,
    email: user?.email,
    state: user?.state,
    user_id: user?.id,
    schools: user?.schools?.map((school) => ({ id: school.id, name: school.name })),
  };

  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined')
    analytics.track('portal: Page viewed', properties);
};

export const sendPageViewed = (
  pageName: string,
  category?: string,
  properties?: Record<string, any>,
  options?: SegmentAnalytics.SegmentOpts
) => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined')
    analytics.page(category, pageName, properties, options);
};
