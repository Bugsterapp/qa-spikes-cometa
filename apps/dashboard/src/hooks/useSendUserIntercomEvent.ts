import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { School } from '@cometa/trpc/src/types';
import { sendIntercomUserEvent } from '../utils/events';

const useSendUserIntercomEvent = (school: School) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (school && session) {
      sendIntercomUserEvent((session as any)?.user?.id, {
        name: (session as any)?.user?.name,
        cometa_first_name: (session as any)?.user?.first_name,
        cometa_last_name: (session as any)?.user?.last_name,
        email: (session as any)?.user?.email,
        schoolId: school?.id,
        school_name: school?.name,
        staff: (session as any)?.user?.is_staff,
        active: (session as any)?.user?.is_active,
        superuser: (session as any)?.user?.is_superuser,
      });
    }
  }, [school, session]);
};

export default useSendUserIntercomEvent;
