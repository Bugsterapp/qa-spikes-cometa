import React, { useEffect } from 'react';
import { sendPageViewedEvent } from '../utils/events';
import { useSession } from 'next-auth/react';
import type { School } from '@cometa/trpc/src/types';

const useSendPageViewedEvent = (pageName: string, school?: School) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (school && session) {
      sendPageViewedEvent(
        pageName,
        {
          firstName: (session as any)?.user?.first_name,
          lastName: (session as any)?.user?.last_name,
          email: session?.user?.email,
          staf: session?.user?.is_staff,
          created_date: session?.user?.date_joined,
          user_id: session?.user?.id,
        },
        school
      );
    }
  }, [school, session]);
};

export default useSendPageViewedEvent;
