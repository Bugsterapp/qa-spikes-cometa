import { useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import AuthGlobal from '~/components/molecules/common/AuthGlobal';
import { AlertProvider } from '~/contexts/AlertContext';
import AlertPopup from '~/components/atoms/common/AlertPopup';
import { hotjar } from 'react-hotjar';
import { Fragment, ReactNode, useEffect } from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '~/components/Toast/Toaster';
import { Session } from 'next-auth';
import { api } from '~/utils/api';
import type { Page } from '~/types/page';
import { useSelectionStore } from '@cometa/hooks';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { FraudStatusEnum } from '@cometa/trpc';
import { useUTMRouter } from '~/components/UtmNavigation';

const StoreWrapper = ({ children }: { children: ReactNode }) => {
  useSelectionStore();
  return <>{children}</>;
};

const ValidateGuardianProfile = () => {
  const router = useUTMRouter();
  const session = useSession();
  const { guardianHash } = router.query;
  const doesHasHighRiskProfile = session?.data?.user.fraud_status === FraudStatusEnum.HighRisk;
  const blackListPages = [
    '/guardians/[guardianHash]/students',
    '/guardians/[guardianHash]/subscriptions',
    '/guardians/[guardianHash]/payments/history',
  ];
  if (doesHasHighRiskProfile && blackListPages.includes(router.pathname)) {
    router.push(`/guardians/${guardianHash}`);
  }
  return null;
};

function MyApp({ Component, pageProps }: { Component: Page; pageProps: AppProps['pageProps'] & { session: Session } }) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const Layout = Component.layout ?? Fragment;
  const Auth = Component.auth ? AuthGlobal : Fragment;
  const hjid = parseInt(process.env.NEXT_PUBLIC_HJID ?? '0');
  const hjsv = parseInt(process.env.NEXT_PUBLIC_HJSV ?? '0');
  const _router = useUTMRouter();
  const { notification_id: notificationId } = _router.query;
  const { mutate } = api.guardian.openNotification.useMutation();

  useEffect(() => {
    hotjar.initialize(hjid, hjsv);
  }, []);

  useEffect(() => {
    try {
      if (!localStorage) _router.push('/404');
    } catch {
      _router.push('/cookies-error');
    }
  }, []);

  useEffect(() => {
    if (notificationId) {
      mutate({ notificationId: notificationId as string });
    }
  }, [notificationId]);

  return (
    <SessionProvider session={pageProps.session}>
      <StoreWrapper>
        <Toaster />
        <AlertProvider>
          <AlertPopup />
          <Layout>
            <Auth>
              <ValidateGuardianProfile />
              {getLayout(<Component {...pageProps} />)}
            </Auth>
          </Layout>
          <div className="z-50">
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </div>
        </AlertProvider>
        <SpeedInsights />
      </StoreWrapper>
    </SessionProvider>
  );
}

export default api.withTRPC(MyApp);
