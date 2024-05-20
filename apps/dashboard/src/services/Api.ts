import { signOut } from 'next-auth/react';
import { PATH_AUTH } from '../routes/paths';
import * as Sentry from '@sentry/nextjs';
import { deepmerge } from 'deepmerge-ts';

const isServer = typeof window === 'undefined';
const API_URL = isServer ? process.env.NEXT_PUBLIC_SERVER_API_BASE_URL : process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL;
// const SECRET = process.env.NEXT_PUBLIC_API_SECRET;
const PATH_API = '/api/v1';

/**
 * @param route The route to point for the request
 * @param config Config for the `fetch` function
 * @param configModifiers Modifiers to the config, useful for adding authorization headers dynamically
 * @returns
 */
const http = (
  route: string,
  config?: Omit<RequestInit, 'method'>,
  configModifiers?: Partial<Omit<RequestInit, 'method'>>[]
) => {
  if (!API_URL) {
    throw Error('No NEXT_PUBLIC_CLIENT_API_BASE_URL env was defined');
  }
  let configCopy = structuredClone(config);

  if (configModifiers?.length) {
    configModifiers.forEach((modifier) => {
      configCopy = deepmerge(configCopy, modifier) as Omit<RequestInit, 'method'>;
    });
  }

  const constructedURL = `${API_URL}${PATH_API}/${route}`;
  const request = (parsedConfig: RequestInit) => fetch(constructedURL, parsedConfig);

  return {
    get: () => request({ method: 'GET', ...configCopy }),
    post: () => request({ method: 'POST', ...configCopy }),
    put: () => request({ method: 'PUT', ...configCopy }),
    patch: () => request({ method: 'PATCH', ...configCopy }),
    delete: () => request({ method: 'DELETE', ...configCopy }),
    options: () => request({ method: 'OPTIONS', ...configCopy }),
  };
};

/**
 * @description Config modifier to add authorization header dynamically
 * @param token user's authorization token
 * @returns
 */
const headerWithAuthorization = (token: string) => ({ headers: { Authorization: `Token ${token}` } });

/**
 * @description Middleware to intercept unauthorized requests
 * @param httpRequest http function
 * @returns
 */
const UnauthorizedMiddleware = (httpRequest: Promise<Response>) =>
  httpRequest.then((response) => {
    if (response.status === 401) {
      localStorage.clear();
      signOut({ redirect: true, callbackUrl: PATH_AUTH.login });
      return;
    }

    if (!response.ok) {
      Sentry.captureException(response);
    }

    return response;
  });

// Request already wrapped in Atuhorization Middleware, to simplify this kind of calls
const AuthorizedRequest = (method: keyof ReturnType<typeof http>, ...args: Parameters<typeof http>) =>
  UnauthorizedMiddleware(http(...args)[method]());

export const AssignGuardianAPI = {
  createAndAssignGuardian: (
    token: string,
    schoolId: string,
    studentId: string,
    guardianInfo: { first_name: string; last_name: string; phone: string; gender: string; email: string }
  ): Promise<'GUARDIAN_CREATED' | Guardian.Guardian> =>
    AuthorizedRequest(
      'post',
      `dashboard/schools/${schoolId}/guardians/`,
      {
        body: JSON.stringify({ ...guardianInfo, student_id: studentId }),
        headers: { 'Content-Type': 'application/json' },
      },
      [headerWithAuthorization(token)]
    )
      .then((res) => {
        if (res?.status === 409) {
          return res.json();
        }
        if (!res?.ok) {
          throw Error(`schools/${schoolId}/guardians/ error ${JSON.stringify(res?.body)}`);
        }

        return 'GUARDIAN_CREATED';
      })
      .catch((err) => {
        throw Error(err);
      }),
};
