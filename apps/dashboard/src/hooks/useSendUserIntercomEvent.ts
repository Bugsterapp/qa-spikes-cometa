import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { DashboardSchool } from '@cometa/trpc/src/types';
import { sendIntercomUserEvent } from '../utils/events';

const useSendUserIntercomEvent = (school: DashboardSchool) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (school && session) {
      sendIntercomUserEvent(session?.user?.id, {
        name: session?.user?.name,
        cometa_first_name: session?.user?.first_name,
        cometa_last_name: session?.user?.last_name,
        email: session?.user?.email,
        schoolId: school?.id,
        school_name: school?.name,
        staff: session?.user?.is_staff,
        active: (session as any)?.user?.is_active,
        superuser: (session as any)?.user?.is_superuser,
        job_title: school.job_title,
        school_status: school.status,
      });
    }
  }, [school, session]);
};

export default useSendUserIntercomEvent;
