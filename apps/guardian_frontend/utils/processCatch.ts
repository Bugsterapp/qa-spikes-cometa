import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';

export const catchPaymentPage = (err: unknown, context: GetServerSidePropsContext, titleContext = 'error') => {
  Sentry.withScope((scope) => {
    if (axios.isAxiosError(err)) {
      scope.setExtra('axiosError', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      scope.setContext('axiosError', {
        status: err.response?.status,
        data: JSON.stringify(err.response?.data),
        headers: err.response?.headers,
      });
    } else {
      scope.setContext(titleContext, context);
    }
    Sentry.captureException(err);
  });
};
