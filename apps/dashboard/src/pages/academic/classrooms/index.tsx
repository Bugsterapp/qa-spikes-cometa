import Layout from '/src/components/layouts';
import { ClassroomsList } from '/src/components/academic/classrooms/classrooms-list';
import { ReactNode } from 'react';

export default function ClassroomsPage() {
  return <ClassroomsList />;
}

ClassroomsPage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout title="Clases" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

ClassroomsPage.auth = true;
