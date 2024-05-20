import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const useUpdateSession = () => useSWR('/api/auth/session?update', fetcher);

export default useUpdateSession;
