import type { DashboardSchool, School } from '@cometa/trpc/src/types';

type Properties = Record<string, unknown>;

const shouldLog = process.env.NEXT_PUBLIC_SEGMENT_ACTIVE === 'active' && typeof window !== 'undefined';

export const sendTrackEvent = (eventName: string, properties: Properties, options?: SegmentAnalytics.SegmentOpts) => {
  if (shouldLog) window?.analytics?.track(eventName, properties, options);
};

export const sendIdentifyEvent = (userId: string, properties: Properties) => {
  if (shouldLog) window?.analytics?.identify(userId, { ...properties, distinct_id: userId });
};

export const sendIntercomUserEvent = (userId: string, properties: Properties) => {
  if (shouldLog) window?.analytics?.identify(`${userId}`, { ...properties, userId });
};

export const sendPageViewedEvent = (pageName: string, user?: Properties, school?: School | DashboardSchool) => {
  if (typeof window !== 'undefined') {
    const properties = {
      pageName,
      screenWidth: window?.innerWidth,
      screenHeight: window?.innerHeight,
      url: window?.location?.href,
      plataform: window?.navigator.userAgent,
      schoolId: school?.id,
      schoolName: school?.name,
      job_title: school && 'job_title' in school ? school.job_title : undefined,
      ...user,
    };

    if (shouldLog) window?.analytics?.track('dashboard: Page viewed', properties);
  }
};

export const sendPageEvent = (
  pageName: string,
  category?: string,
  properties?: Record<string, any>,
  options?: SegmentAnalytics.SegmentOpts
) => {
  if (shouldLog) window?.analytics?.page(category, pageName, properties, options);
};
