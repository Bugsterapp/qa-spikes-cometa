import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/nextjs';
import { constants } from 'node:http2';

const HTTP_TO_TRPC: Record<number, string> = {
  [constants.HTTP_STATUS_BAD_REQUEST]: 'BAD_REQUEST',
  [constants.HTTP_STATUS_UNAUTHORIZED]: 'UNAUTHORIZED',
  [constants.HTTP_STATUS_FORBIDDEN]: 'FORBIDDEN',
  [constants.HTTP_STATUS_NOT_FOUND]: 'NOT_FOUND',
  [constants.HTTP_STATUS_CONFLICT]: 'CONFLICT',
  [constants.HTTP_STATUS_UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_CONTENT',
  [constants.HTTP_STATUS_TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
} as const;

function handleHttpErrorWithConstants(status: number, message: string): void {
  const trpcCode = HTTP_TO_TRPC[status];

  if (trpcCode) {
    throw new TRPCError({
      code: trpcCode as
        | 'BAD_REQUEST'
        | 'UNAUTHORIZED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CONFLICT'
        | 'UNPROCESSABLE_CONTENT'
        | 'TOO_MANY_REQUESTS',
      message: message || 'An error occurred',
    });
  }

  if (status >= constants.HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: message || 'An error occurred',
    });
  }
}

export const getUrlfromHeadersArray = (headersArray: any) => {
  const refererIndex = headersArray.indexOf('Referer');
  const url = headersArray[refererIndex + 1];
  return url;
};

export const logErrorToSentry = (error: any) => {
  Sentry.withScope((scope) => {
    scope.setTag('error', error.code);
    scope.setTag('message', error.cause?.message);
    Sentry.captureException(error);
  });
};

const handleTRPCError = (error: any) => {
  if (isHTMLResponse(error)) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'HTML Error Response, may be caused directly by the server',
    });
  }

  if (isConceptsError(error)) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.error.detail,
      cause: error.error.type,
    });
  }

  if (isHTTPError(error)) {
    const status = error.status;
    let message =
      error.error?.detail ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'An error occurred';

    // Handle error arrays
    if (Array.isArray(message)) {
      message = message[0];
    }

    // If message is still not a string, try to get it from response data
    if (typeof message !== 'string') {
      if (error.response?.data?.error && Array.isArray(error.response.data.error)) {
        message = error.response.data.error[0];
      } else if (error.response?.data?.error && typeof error.response.data.error === 'string') {
        message = error.response.data.error;
      }
    }

    // Ensure message is a string
    if (typeof message !== 'string') {
      message = 'An error occurred';
    }

    handleHttpErrorWithConstants(status, message);
  }

  if (isChangeCycleError(error)) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.error.error,
      cause: 'ChangeCycleError',
    });
  }
  if (error instanceof TRPCError) {
    return new TRPCError({
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      cause: error.cause,
    });
  }
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An unexpected error occurred',
    cause: JSON.stringify(error),
  });
};

function isHTTPError(error: any): boolean {
  return error?.status !== undefined;
}

function isHTMLResponse(error: unknown): boolean {
  if (typeof error === 'string') {
    // Check if the error is a string
    return error.startsWith('<html>') || error.startsWith('<!DOCTYPE html>');
  }
  if (error instanceof Error) {
    // Check if the error is an instance of the Error class
    return error.message.startsWith('<html>') || error.message.startsWith('<!DOCTYPE html>');
  }
  if (error instanceof TRPCError) {
    // Check if the error is an instance of the TRPCError class
    return error.message.startsWith('<html>') || error.message.startsWith('<!DOCTYPE html>');
  }
  return false;
}

function isConceptsError(error: any): boolean {
  if ('error' in error) {
    if ('detail' in error.error && typeof error.error.detail === 'string') {
      return true;
    }
  }
  return false;
}

function isChangeCycleError(error: any): boolean {
  if ('error' in error) {
    if (
      'error' in error.error &&
      typeof error.error.error === 'string' &&
      error.error.error.includes('ChangeCycleError')
    ) {
      return true;
    }
  }
  return false;
}

export default handleTRPCError;
