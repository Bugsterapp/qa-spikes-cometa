import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/nextjs';

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
  } else if (error instanceof TRPCError) {
    return new TRPCError({
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      cause: error.cause,
    });
  } else {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      cause: JSON.stringify(error),
    });
  }
};

function isHTMLResponse(error: unknown): boolean {
  if (typeof error === 'string') {
    // Check if the error is a string
    return error.startsWith('<html>') || error.startsWith('<!DOCTYPE html>');
  } else if (error instanceof Error) {
    // Check if the error is an instance of the Error class
    return error.message.startsWith('<html>') || error.message.startsWith('<!DOCTYPE html>');
  } else if (error instanceof TRPCError) {
    // Check if the error is an instance of the TRPCError class
    return error.message.startsWith('<html>') || error.message.startsWith('<!DOCTYPE html>');
  } else {
    return false;
  }
}
export default handleTRPCError;
