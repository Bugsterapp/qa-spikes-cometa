import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import Layout from 'src/components/layouts';
import { useSelectedSchool } from 'src/guards/AuthGuard';
import useSendPageViewedEvent from 'src/hooks/useSendPageViewedEvent';
import { DelinquencyTable } from '../components/delinquency/DelinquencyTable/DelinquencyTable';

export default function Delinquency() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <div>
        <DelinquencyTable />
      </div>
    </Sentry.ErrorBoundary>
  );
}

Delinquency.auth = true;
Delinquency.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Morosidad" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};
