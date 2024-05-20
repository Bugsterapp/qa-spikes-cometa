import { theme } from '~/theme';
import { ThemeProvider } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import AuthGlobal from '~/components/molecules/common/AuthGlobal';
import { AlertProvider } from '~/contexts/AlertContext';
import AlertPopup from '~/components/atoms/common/AlertPopup';
import { useRouter } from 'next/router';
import { hotjar } from 'react-hotjar';
import { Fragment, useEffect } from 'react';
import ApiClient from '~/services/ApiClient';
import { FeaturesProvider } from '~/contexts/FeaturesContext';
import { AppProps } from 'next/app';
import '../styles/globals.scss';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '~/components/Toast/Toaster';
import { Session } from 'next-auth';
import { api } from '~/utils/api';
import type { Page } from '~/types/page';
import { useAnalytics } from '@happykit/analytics';

function MyApp({ Component, pageProps }: { Component: Page; pageProps: AppProps['pageProps'] & { session: Session } }) {
  useAnalytics({ publicKey: 'analytics_pub_fc6c64e4c0' });
  const getLayout = Component.getLayout ?? ((page) => page);
  const Layout = Component.layout ?? Fragment;
  const Auth = Component.auth ? AuthGlobal : Fragment;
  const hjid = parseInt(process.env.NEXT_PUBLIC_HJID || '0');
  const hjsv = parseInt(process.env.NEXT_PUBLIC_HJSV || '0');
  const _router = useRouter();
  const { notification_id: notificationId } = _router.query;

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
      ApiClient.openNotification(notificationId as string);
    }
  }, [notificationId]);

  return (
    <SessionProvider session={pageProps.session}>
      <Toaster />
      <ThemeProvider theme={theme}>
        <AlertProvider>
          <FeaturesProvider>
            <AlertPopup />
            <Layout>
              <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
            </Layout>
            <div className="z-50">
              <ReactQueryDevtools
                panelPosition="bottom"
                panelProps={{
                  style: {
                    zIndex: 999999,
                  },
                }}
              />
            </div>
          </FeaturesProvider>
        </AlertProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default api.withTRPC(MyApp);
