import { sendTrackEvent } from '../utils/events';
import { useSession } from 'next-auth/react';

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
