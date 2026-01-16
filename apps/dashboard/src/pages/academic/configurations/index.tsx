import Layout from '/src/components/layouts';
import { Configurations } from '/src/components/academic/configurations/configurations';
import { ReactNode } from 'react';

export default function ConfigurationsPage() {
  return <Configurations />;
}

ConfigurationsPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout title="Configuraciones" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

ConfigurationsPage.auth = true;
