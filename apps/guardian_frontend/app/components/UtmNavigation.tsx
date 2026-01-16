'use client';

import Link, { LinkProps } from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UrlObject } from 'url';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const utmParamsList = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

const getUTMParamsFromSearchParams = (searchParams: URLSearchParams | null): { [key: string]: string } => {
  const utmQuery: { [key: string]: string } = {};

  if (searchParams) {
    utmParamsList.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        utmQuery[param] = value;
      }
    });
  }

  return utmQuery;
};

type Url = string | UrlObject;

const enhanceUrlWithUTM = (url: Url, utmQuery: { [key: string]: string }): Url => {
  if (typeof url === 'string') {
    const [path, queryString] = url.split('?');
    const hrefQuery = new URLSearchParams(queryString || '');

    Object.entries(utmQuery).forEach(([key, value]) => {
      hrefQuery.set(key, value);
    });

    const queryParamsString = hrefQuery.toString();
    return queryParamsString ? `${path}?${queryParamsString}` : path;
  } else {
    const { query, ...rest } = url as UrlObject;
    const queryObject = typeof query === 'object' && query !== null ? query : {};
    return {
      ...rest,
      query: {
        ...queryObject,
        ...utmQuery,
      },
    };
  }
};

const enhanceHrefWithUTM = (href: LinkProps['href'], utmQuery: { [key: string]: string }): LinkProps['href'] =>
  enhanceUrlWithUTM(href, utmQuery);

type UTMLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, keyof LinkProps> & LinkProps;

export const UTMLink = (props: UTMLinkProps) => {
  const { href, ...rest } = props;
  const searchParams = useSearchParams();
  const utmQuery = getUTMParamsFromSearchParams(searchParams);

  const hrefWithUTM = enhanceHrefWithUTM(href, utmQuery);

  return <Link href={hrefWithUTM} {...rest} />;
};

interface UTMAppRouter extends Omit<AppRouterInstance, 'push' | 'replace' | 'prefetch'> {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
  prefetch: (href: string, options?: { kind?: 'auto' | 'full' | 'viewport' }) => void;
}

export const useUTMRouter = (): UTMAppRouter => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utmQuery = getUTMParamsFromSearchParams(searchParams);

  const enhanceRouterMethod = (methodName: 'push' | 'replace') => (href: string, options?: any) => {
    const enhancedUrl = enhanceUrlWithUTM(href, utmQuery);
    return router[methodName](enhancedUrl as string, options);
  };

  const enhancePrefetchMethod = (href: string, options?: any) => {
    const enhancedUrl = enhanceUrlWithUTM(href, utmQuery);
    return router.prefetch(enhancedUrl as string, options);
  };

  return {
    ...router,
    push: enhanceRouterMethod('push'),
    replace: enhanceRouterMethod('replace'),
    prefetch: enhancePrefetchMethod,
  };
};
