export const useSendTrackEvent = () => {
  if (process.env.NEXT_PUBLIC_SEGMENT_ACTIVE !== 'active' || typeof window === 'undefined') {
    return () => void 0;
  }
  const sendTrackEventWithUserName = (eventName: string, session?: any, properties?: object) => {
    const user_name = `${session?.user?.first_name} ${session?.user?.last_name}`;

    const payload = session
      ? {
          user: user_name,
          ...properties,
        }
      : {
          ...properties,
        };

    // @ts-ignore: window.analytics is defined in the segment snippet
    window?.analytics?.track(eventName, payload);
  };
  return sendTrackEventWithUserName;
};
