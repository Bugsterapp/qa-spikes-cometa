import { sendTrackEvent } from '../utils/events';
import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '../guards/AuthGuard';
import { useCallback } from 'react';

const useSendTrackEventWithUserName = () => {
  const { data: session } = useSession();
  const school = useSelectedSchool();

  const sendTrackEventWithUserName = useCallback(
    (eventName: string, properties?: object) => {
      const first_name = session?.user?.first_name;
      const last_name = session?.user?.last_name;
      sendTrackEvent(eventName, {
        user: `${first_name} ${last_name}`,
        school: school?.name,
        job_title: school?.job_title,
        email: session?.user?.email,
        staf: session?.user?.is_staff,
        created_date: session?.user?.date_joined,
        user_id: session?.user?.id,
        ...properties,
      });
    },
    [session, school]
  );
  return sendTrackEventWithUserName;
};

export default useSendTrackEventWithUserName;
