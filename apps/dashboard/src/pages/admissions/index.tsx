import 'react-circular-progressbar/dist/styles.css';
import { Admissions } from '/src/components/admissions/admissions';
import { SelfSetup } from '/src/components/admissions/setup/self-setup';
import Layout from '/src/components/layouts';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { api } from '/src/utils/api';

export default function AdmissionsPage() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const permissions = useGetPermissions();
  const isSelfSetupEnabled = permissions?.can_view_admissions_page;

  const { data: schoolSteps, isPending: isLoading } = api.admissions.getSchoolSteps.useQuery(
    { schoolId },
    { enabled: !!schoolId }
  );
  const hasSchoolSteps = schoolSteps?.length && schoolSteps.length > 0;
  const isAdmissionsActive = schoolSteps?.some((step) => step.deleted_at === null && step.status === 'active');

  useSendPageViewedEvent('Admisiones', selectedSchool);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src="/assets/loading.svg" alt="Loading" />
      </div>
    );
  }

  if (isSelfSetupEnabled && (!hasSchoolSteps || !isAdmissionsActive)) {
    return <SelfSetup hasSchoolSteps={!!hasSchoolSteps} />;
  }

  return <Admissions />;
}

AdmissionsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Admisiones" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

AdmissionsPage.auth = true;
