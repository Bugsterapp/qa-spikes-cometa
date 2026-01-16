import { type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Layout from '/src/components/layouts';
import { TemplateEditView } from '/src/components/signatures/views/template-edit';

function TemplateEditPage() {
  const router = useRouter();
  const { templateId } = router.query;

  if (!templateId || typeof templateId !== 'string') {
    return null;
  }

  return <TemplateEditView templateId={templateId} />;
}

TemplateEditPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout dashboardVariant="stretch" title="Editar plantilla">
      {page}
    </Layout>
  );
};

TemplateEditPage.auth = true;

export default TemplateEditPage;
