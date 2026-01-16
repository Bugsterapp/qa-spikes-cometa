import { useSendTrackEvent } from '@cometa/utils';
import { CacheProvider, type EmotionCache } from '@emotion/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { type ReactNode, useEffect, useLayoutEffect } from 'react';
import { hotjar } from 'react-hotjar';
import { SheetProvider } from '../components/atoms/Sheet';
import ProgressBar from '../components/ProgressBar';
import { AlertProvider } from '../contexts/AlertContext';
import { CollapseDrawerProvider } from '../contexts/CollapseDrawerContext';
import { RouteProvider } from '../contexts/RoutesProvider';
import SchoolSwitcherContextProvider from '../contexts/SchoolSwitcherProvider';
import '../global_styles.css';
import AuthGuard from '../guards/AuthGuard';
import { api } from '../utils/api';
import createEmotionCache from '../utils/createEmotionCache';

import { DownloadProvider } from '../components/DownloadManager';
import { Toaster } from '../components/molecules/dashboard/Toast/Toaster';
import TokenWatcher from '../components/TokenWatcher';
import { Events } from '../constants/events';

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
  settings: PropTypes.object,
};

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  Component: AppProps['Component'] & {
    auth: boolean;
    getLayout(component: JSX.Element): ReactNode;
  };
  pageProps: AppProps['pageProps'] & { session: Session };
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const hjid = process.env.NEXT_PUBLIC_HJID || '';
  const hjsv = process.env.NEXT_PUBLIC_HJSV || '';
  const sendTrackEvent = useSendTrackEvent();

  useEffect(() => {
    hotjar.initialize(Number.parseInt(hjid), Number.parseInt(hjsv));
  }, []);

  const trackSupportButtonClicked = () => {
    sendTrackEvent(Events.support_requested);
  };

  useLayoutEffect(() => {
    window?.document?.querySelector('.intercom-launcher')?.addEventListener('click', trackSupportButtonClicked);
  }, []);

  return (
    <SchoolSwitcherContextProvider>
      <CacheProvider value={emotionCache}>
        <SessionProvider session={pageProps.session} refetchOnWindowFocus>
          <TokenWatcher />
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>

          <DownloadProvider>
            <CollapseDrawerProvider>
              <RouteProvider>
                <AlertProvider>
                  <ProgressBar />
                  <SheetProvider>
                    {Component.auth ? (
                      <AuthGuard>{getLayout(<Component {...pageProps} />)}</AuthGuard>
                    ) : (
                      getLayout(<Component {...pageProps} />)
                    )}
                    <Toaster />
                  </SheetProvider>
                </AlertProvider>
              </RouteProvider>
            </CollapseDrawerProvider>
          </DownloadProvider>

          <SpeedInsights />
          <Analytics />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </SessionProvider>
      </CacheProvider>
    </SchoolSwitcherContextProvider>
  );
}
export default api.withTRPC(MyApp);
