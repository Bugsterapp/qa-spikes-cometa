import { useSearchParams, useRouter } from 'next/navigation';
import { UrlObject } from 'url';

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

export const useUTMAppRouter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utmQuery = getUTMParamsFromSearchParams(searchParams);

  const enhanceRouterMethod = (methodName: 'push' | 'replace' | 'prefetch') => (url: Url, as?: Url, options?: any) => {
    const enhancedUrl = enhanceUrlWithUTM(url, utmQuery);
    const enhancedAs = as ? enhanceUrlWithUTM(as, utmQuery) : undefined;
    return (router[methodName] as any)(enhancedUrl, enhancedAs, options);
  };

  return {
    ...router,
    push: enhanceRouterMethod('push'),
    replace: enhanceRouterMethod('replace'),
    prefetch: enhanceRouterMethod('prefetch'),
  };
};
