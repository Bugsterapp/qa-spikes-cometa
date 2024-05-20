import { Session } from 'next-auth';

type Properties = Record<string, unknown>;

export const sendTrackEvent = (eventName: string, properties?: Properties) => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined')
    global.analytics.track(eventName, properties);
};

export const sendIdentifyEvent = (userId: string, user: Session['user']) => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active')
    window.analytics.identify(userId, { ...user, distinct_id: userId });
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
    window.analytics.track('portal: Page viewed', properties);
};
