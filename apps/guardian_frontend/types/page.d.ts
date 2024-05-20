import type { NextPage } from 'next';
import type { ComponentType, ReactElement, ReactNode } from 'react';

export type Page<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  layout?: ComponentType;
  auth: boolean;
};
