import { useEffect } from 'react';
import { sendPageViewedEvent } from '../utils/events';
import { useSession } from 'next-auth/react';

const useSendPageViewedEvent = (pageName: string) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      sendPageViewedEvent(pageName, session?.user);
    }
  }, [session]);
};

export default useSendPageViewedEvent;
