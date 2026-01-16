import { api } from '~/utils/api';
import { useMemo, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface UseCheckoutPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  redirectOnSuccess?: boolean;
  validateApprovedStatus?: boolean;
  onTimeout?: () => void;
}

const MAX_POLLING_TIME = parseInt(process.env.NEXT_PUBLIC_PAYMENT_MAX_POLLING_TIME ?? '10000');

export function useCheckoutPayment(options: UseCheckoutPaymentOptions = {}) {
  const checkoutMutation = api.checkout.checkoutPayment.useMutation({
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
  const markPaymentAsBlockedMutation = api.checkout.markPaymentAsBlocked.useMutation({
    onSuccess: () => undefined,
    onError: () => undefined,
  });

  const optimizelyMutation = api.optimizely.archiveFlag.useMutation();

  const { payment_id: paymentId, trace_id: traceId, span_id: spanId } = checkoutMutation.data ?? {};
  const startTimeRef = useRef<number | null>(null);
  const paymentInitiationTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shouldPoll = (query: any) => {
    // Check if the status meets condition to keep polling
    const shouldContinuePolling =
      (query.state.data?.status === 'pending' && options.validateApprovedStatus) ||
      query.state.data?.status === 'in_process';

    // Check if we've been polling for more than 10 seconds
    const currentTime = Date.now();
    const hasTimedOut = startTimeRef.current && currentTime - startTimeRef.current > MAX_POLLING_TIME;

    // Return polling interval or undefined to stop
    return shouldContinuePolling && !hasTimedOut ? 500 : undefined;
  };

  const pollPaymentStatus = api.checkout.paymentStatus.useQuery(
    { paymentId: paymentId ?? '' },
    {
      refetchInterval: shouldPoll,
      enabled: !!paymentId && !!checkoutMutation.data,
      refetchIntervalInBackground: true,
    }
  );

  // Initialize timer when polling begins
  useEffect(() => {
    const data = pollPaymentStatus.data;
    if (
      data &&
      startTimeRef.current === null &&
      (data.status === 'in_process' || (data.status === 'pending' && options.validateApprovedStatus))
    ) {
      startTimeRef.current = Date.now();

      // Setup timeout to call onTimeout after 10 seconds
      if (options.onTimeout && !timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (options.onTimeout) {
            markPaymentAsBlockedMutation.mutate({
              paymentId: paymentId ?? '',
              traceId: traceId ?? '',
              spanId: spanId ?? '',
            });
            Sentry.captureMessage(`[payments]: payment timed out — ${paymentId}`, {
              extra: {
                paymentId,
                traceId,
                spanId,
                startTime: startTimeRef.current,
              },
              level: 'warning',
            });
            optimizelyMutation.mutate({
              flag_name: 'new-checkout-method',
              project_id: process.env.OPTIMIZELY_PROJECT_ID ?? '',
            });
            options.onTimeout();
          }
        }, MAX_POLLING_TIME);
      }
    }
  }, [pollPaymentStatus.data, options.validateApprovedStatus, options.onTimeout]);

  // Cleanup timeout on unmount or when done polling
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  // Reset timer if payment is complete
  useEffect(() => {
    const status = pollPaymentStatus.data?.status;
    if (status && status !== 'in_process' && status !== 'approved') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      startTimeRef.current = null;
      paymentInitiationTimeRef.current = null;
    }
  }, [pollPaymentStatus.data?.status]);

  // Determine if the payment is still being processed
  const isProcessing = useMemo(
    () => checkoutMutation.isPending || pollPaymentStatus.isLoading || pollPaymentStatus?.data?.status === 'in_process',
    [checkoutMutation.isPending, pollPaymentStatus.isLoading, pollPaymentStatus.data]
  );

  const getTimeToComplete = () => {
    if (paymentInitiationTimeRef.current) {
      return Math.round((Date.now() - paymentInitiationTimeRef.current) / 1000);
    }
    return 0;
  };

  const setPaymentInitiationTime = () => {
    paymentInitiationTimeRef.current = Date.now();
  };

  return {
    checkoutMutation,
    pollPaymentStatus,
    isProcessing,
    getTimeToComplete,
    setPaymentInitiationTime,
  };
}
