import Layout from '/src/components/layouts';
import { AttendanceSessionsList } from 'src/components/attendance/views/attendance-sessions-list';
import { ReactNode } from 'react';

export default function AttendancePage() {
  return <AttendanceSessionsList />;
}

AttendancePage.getLayout = function getLayout(page: ReactNode) {
  return (
    <Layout title="Asistencia" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

AttendancePage.auth = true;
