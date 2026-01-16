import Layout from '/src/components/layouts';
import { TeachersList } from '/src/components/academic/teachers/teachers-list';
import { ReactNode } from 'react';

export default function TeachersPage() {
  return <TeachersList />;
}

TeachersPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout title="Maestros" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

TeachersPage.auth = true;
