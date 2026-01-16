import { ParsedUrlQuery } from 'querystring';

export function appendUtmParameters(url: string, query: ParsedUrlQuery): string {
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = query;

  const paramsToAppend: Record<string, string> = {};

  if (typeof utm_source === 'string') paramsToAppend['utm_source'] = utm_source;
  if (typeof utm_medium === 'string') paramsToAppend['utm_medium'] = utm_medium;
  if (typeof utm_campaign === 'string') paramsToAppend['utm_campaign'] = utm_campaign;
  if (typeof utm_term === 'string') paramsToAppend['utm_term'] = utm_term;
  if (typeof utm_content === 'string') paramsToAppend['utm_content'] = utm_content;

  const urlHasQuery = url.includes('?');
  const utmSearchParams = new URLSearchParams(paramsToAppend);
  const utmQueryString = utmSearchParams.toString();

  if (utmQueryString) {
    return url + (urlHasQuery ? '&' : '?') + utmQueryString;
  } else {
    return url;
  }
}
