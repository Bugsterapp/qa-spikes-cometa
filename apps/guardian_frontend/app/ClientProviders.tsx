'use client';

import * as React from 'react';
import { hotjar } from 'react-hotjar';
import { useSearchParams } from 'next/navigation';
import { api } from '~/utils/api';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { Toaster } from '~/components/Toast/Toaster';
import { AlertProvider } from '~/contexts/AlertContext';
import AlertPopup from '~/components/atoms/common/AlertPopup';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TrpcProvider } from './trpc/TrpcProvider';
import { sendIdentifyEvent } from '~/utils/events';
import {
  useSelectedSchool,
  useSetSchools,
  useSetSelectedSchool,
  useGetWebview,
  useSelectedSchoolId,
} from '~/stores/globalStore';

function NotificationHandler() {
  const searchParams = useSearchParams();

  const notificationId = searchParams?.get('notification_id') ?? '';
  const { mutate } = api.guardian.openNotification.useMutation();

  React.useEffect(() => {
    if (notificationId) {
      mutate({ notificationId: notificationId as string });
    }
  }, [notificationId]);

  return <> </>;
}

const IdentifyUser = ({ session }: { session: Session | null }) => {
  const selectedSchool = useSelectedSchool();

  React.useEffect(() => {
    if (session) {
      sendIdentifyEvent(session.user.id, session.user, {
        onboardingUpdateAug2024: true,
        current_school: selectedSchool?.id ?? '',
      });
    }
  }, [session]);
  return <></>;
};

function ClientProviders({ session, children }: { session: Session | null; children: React.ReactNode }) {
  const hjid = Number(process.env.NEXT_PUBLIC_HJID ?? '0');
  const hjsv = Number(process.env.NEXT_PUBLIC_HJSV ?? '0');
  const setSchools = useSetSchools();
  const selectedSchool = useSelectedSchool();
  const selectedSchoolId = useSelectedSchoolId();
  const setSelectedSchool = useSetSelectedSchool();
  const webview = useGetWebview();

  React.useEffect(() => {
    hotjar.initialize(hjid, hjsv);
  }, []);

  React.useEffect(() => {
    const schools = session?.user?.schools ?? [];
    setSchools(schools);

    // Don't override if in webview mode and a valid selectedSchoolId exists
    const isWebviewWithSelectedSchool = webview && selectedSchoolId;

    if (!isWebviewWithSelectedSchool) {
      if (!selectedSchool || !schools.some((school) => school.id === selectedSchool.id)) {
        setSelectedSchool(schools[0]?.id ?? '');
      }
    }
  }, []);

  return (
    <TrpcProvider>
      <NotificationHandler />
      <SessionProvider session={session}>
        <Toaster />
        <IdentifyUser session={session} />
        <AlertProvider>
          <AlertPopup />
          {children}
          <div className="z-50">
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </div>
        </AlertProvider>
      </SessionProvider>
    </TrpcProvider>
  );
}

export default ClientProviders;
