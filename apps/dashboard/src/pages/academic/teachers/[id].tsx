import Layout from '/src/components/layouts';
import { TeacherDetail } from '/src/components/academic/teachers/teacher-detail';
import { ReactNode } from 'react';

TeacherDetailPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de maestro">
      {page}
    </Layout>
  );
};

function TeacherDetailPage() {
  return <TeacherDetail />;
}

TeacherDetailPage.auth = true;

export default TeacherDetailPage;
