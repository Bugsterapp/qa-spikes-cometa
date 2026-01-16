import Layout from '/src/components/layouts';
import { ClassroomDetail } from '/src/components/academic/classrooms/classroom-detail';
import { ReactNode } from 'react';

ClassroomDetailPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de clase">
      {page}
    </Layout>
  );
};

function ClassroomDetailPage() {
  return <ClassroomDetail />;
}

ClassroomDetailPage.auth = true;

export default ClassroomDetailPage;
