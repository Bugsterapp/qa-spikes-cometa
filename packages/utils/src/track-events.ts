export const useSendTrackEvent = () => {
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

    window?.analytics?.track(eventName, payload);
  };
  return sendTrackEventWithUserName;
};
