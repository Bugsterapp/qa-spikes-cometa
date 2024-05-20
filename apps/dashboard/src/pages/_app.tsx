import '../global_styles.css';
import { SessionProvider } from 'next-auth/react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import React, { useEffect, useLayoutEffect } from 'react';
import { CollapseDrawerProvider } from '../contexts/CollapseDrawerContext';
import ThemeProvider from '../theme';
import ProgressBar from '../components/ProgressBar';
import AuthGuard from '../guards/AuthGuard';
import { LicenseInfo } from '@mui/x-license-pro';
import { hotjar } from 'react-hotjar';
import { AlertProvider } from '../contexts/AlertContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { api } from '../utils/api';
import type { AppProps } from 'next/app';
import { Session } from 'next-auth';
import { SheetProvider } from '../components/atoms/Sheet';
import { useSendTrackEvent } from '@cometa/utils';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
// eslint-disable-next-line
import { Analytics } from '@vercel/analytics/react';

LicenseInfo.setLicenseKey(
  'b5a7fc53eaade0e5941df724b2289710Tz00ODYzMyxFPTE2OTEzNDcyMDc3MDgsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI='
);

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
    getLayout(component: JSX.Element): React.ReactNode;
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
    hotjar.initialize(parseInt(hjid), parseInt(hjsv));
  }, []);

  const trackSupportButtonClicked = () => {
    sendTrackEvent('dashboard: Support Requested');
  };

  useLayoutEffect(() => {
    window?.document?.querySelector('.intercom-launcher')?.addEventListener('click', trackSupportButtonClicked);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider session={pageProps.session} refetchOnWindowFocus={false}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <CollapseDrawerProvider>
          <ThemeProvider>
            <AlertProvider>
              <ProgressBar />
              <SheetProvider>
                {Component.auth ? (
                  <AuthGuard>{getLayout(<Component {...pageProps} />)}</AuthGuard>
                ) : (
                  getLayout(<Component {...pageProps} />)
                )}
              </SheetProvider>
              <Analytics />
            </AlertProvider>
          </ThemeProvider>
        </CollapseDrawerProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </CacheProvider>
  );
}
export default api.withTRPC(MyApp);
