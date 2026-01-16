import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { ParsedUrlQuery } from 'querystring';

export const useUrlState = () => {
  const router = useRouter();
  const setUrlState = (newState: Record<string, string | number | boolean>) => {
    router.push(
      {
        query: {
          ...router.query,
          ...newState,
        },
      },
      undefined,
      {
        shallow: true,
      }
    );
  };
  const urlState = router.query;
  return [urlState, setUrlState] as [ParsedUrlQuery, (newState: Record<string, string | number | boolean>) => void];
};
