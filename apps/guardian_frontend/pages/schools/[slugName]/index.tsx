/**
 * Deprecated page. Redirects to the new page.
 * Never delete this page, because it is used by the old links.
 * 27/04/2023
 */

import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useEffect } from 'react';
import useSendTrackEvent from '~/hooks/useSendEvent';

export default function Login() {
  const router = useRouter();
  const sendTrackEvent = useSendTrackEvent();

  useEffect(() => {
    const { slugName } = router.query;
    sendTrackEvent('QR School', { slugName });
    router.push('/');
  }, [router]);

  return (
    <Head>
      <title>Cometa</title>
    </Head>
  );
}
