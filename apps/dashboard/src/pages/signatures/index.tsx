import Layout from '/src/components/layouts';
import { SignaturesPage } from '/src/components/signatures/views/signatures-list';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';

export default function SignaturesIndexPage() {
  const selectedSchool = useSelectedSchool();
  useSendPageViewedEvent('Contratos y documentos', selectedSchool);

  return <SignaturesPage />;
}

SignaturesIndexPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Contratos y documentos" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

SignaturesIndexPage.auth = true;
