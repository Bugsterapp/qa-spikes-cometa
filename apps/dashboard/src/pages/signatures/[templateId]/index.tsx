import { type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Layout from '/src/components/layouts';
import { TemplateDetailView } from '/src/components/signatures/views/template-detail';

function TemplateDetailPage() {
  const router = useRouter();
  const { templateId } = router.query;

  if (!templateId || typeof templateId !== 'string') {
    return null;
  }

  return <TemplateDetailView templateId={templateId} />;
}

TemplateDetailPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de plantilla">
      {page}
    </Layout>
  );
};

TemplateDetailPage.auth = true;

export default TemplateDetailPage;
