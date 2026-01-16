import Layout from '/src/components/layouts';
import { useRouter } from 'next/router';
import { api } from '/src/utils/api';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { AssignedConcepts, PaidOrders } from '/src/components/admissions/detail/admission-tables';
import { ReactNode } from 'react';
import Link from 'next/link';
import { TabsWrapper } from '/src/components/ui/Tabs';
import { HeaderSection } from '/src/components/organisms/dashboard/AdmissionSections/HeaderSection';
import { InfoSection } from '/src/components/organisms/dashboard/AdmissionSections/InfoSection';
import { AdditionalSection } from '/src/components/organisms/dashboard/AdmissionSections/AdditionalSection';
import { DocumentsSection } from '../../components/admissions/detail/documents';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';

AdmissionPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de Admisión">
      {page}
    </Layout>
  );
};

function AdmissionPage() {
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const admissionId = router.query.admissionId as string;

  const { tab, handleTabChange } = useTab({ admissionId });
  const { data: studentLead } = api.admissions.getAdmissionDetail.useQuery(
    {
      admissionId: admissionId,
    },
    {
      enabled: !!admissionId && !!selectedSchool,
    }
  );
  const admissionStep = studentLead?.admission_steps?.find(
    (admissionStep) => (admissionStep?.school_step?.tag as string) === SchoolStepTags.Documents
  );
  const schoolStepId = admissionStep?.school_step?.id as string;
  const { data: schoolStepDocs, isPending: isSchoolStepDocsLoading } = api.admissions.getSchoolStepDocs.useQuery(
    {
      school_step_id: schoolStepId,
      active: true,
    },
    {
      enabled: !!schoolStepId,
    }
  );
  const levelId = studentLead?.level_id;
  const documentDefinitions = (schoolStepDocs || [])
    .filter((d) => (levelId && d.level_ids ? d.level_ids.split(',').includes(levelId) : true))
    .map((document) => ({
      id: document.id as string,
      name: document.name as string,
      tag: document.tag as string,
    }));

  const schoolCycle = {
    id: studentLead?.school_cycle_id as string,
    name: studentLead?.school_cycle_name as string,
  };

  const disabledActions = ['dropped_out', 'not_admitted'].includes(studentLead?.status as string);

  const permissions = useGetPermissions();
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  const tabComponents: Record<string, ReactNode> = {
    info: <InfoSection studentLead={studentLead} />,
    account: shouldShowAccountSections ? <PaidOrders studentId={studentLead?.external_id} /> : null,
    concept: shouldShowAccountSections ? (
      <AssignedConcepts
        studentId={studentLead?.external_id}
        schoolCycle={schoolCycle}
        disabledActions={disabledActions}
      />
    ) : null,
    additional: (
      <AdditionalSection
        studentLeadId={studentLead?.id as string}
        schoolId={studentLead?.school_id as string}
        levelId={studentLead?.level_id}
        guardians={studentLead?.guardian_leads || []}
      />
    ),
    documents: (
      <DocumentsSection
        isLoading={isSchoolStepDocsLoading && !!schoolStepId}
        entityId={studentLead?.id as string}
        documentDefinitions={documentDefinitions}
      />
    ),
  };

  return (
    <div className="min-h-screen antialiased font-lota">
      <Nav />

      <HeaderSection studentLead={studentLead} />

      <Tabs tab={tab} handleTabChange={handleTabChange}>
        <section className="h-[calc(100vh-214px)] p-8 bg-[#8B93A00A]">{tabComponents[tab]}</section>
      </Tabs>
    </div>
  );
}

function Nav() {
  const router = useRouter();
  const prevPath = router.query.prev as string;

  return (
    <nav className="h-14 flex justify-between items-center px-8">
      <Link href={prevPath || '/admissions'} className="flex items-center gap-1">
        <BackArrow />
        <span className="text-[#6E7480] font-semibold text-xs uppercase">Volver</span>
      </Link>
    </nav>
  );
}

function BackArrow() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.8333 4.16671H2.5L5.24167 1.42505C5.31977 1.34758 5.38177 1.25541 5.42408 1.15386C5.46638 1.05231 5.48816 0.943392 5.48816 0.833382C5.48816 0.723373 5.46638 0.614451 5.42408 0.512902C5.38177 0.411353 5.31977 0.319185 5.24167 0.241716C5.08553 0.0865075 4.87432 -0.000610352 4.65417 -0.000610352C4.43401 -0.000610352 4.2228 0.0865075 4.06667 0.241716L0.491667 3.82505C0.178677 4.13617 0.00186066 4.55873 0 5.00004C0.00405549 5.43846 0.180704 5.85763 0.491667 6.16671L4.06667 9.75004C4.14437 9.82719 4.2365 9.88828 4.33781 9.92983C4.43912 9.97137 4.54762 9.99256 4.65711 9.99217C4.76661 9.99178 4.87496 9.96983 4.97597 9.92757C5.07698 9.88531 5.16868 9.82357 5.24583 9.74587C5.32298 9.66817 5.38408 9.57604 5.42562 9.47473C5.46717 9.37342 5.48835 9.26492 5.48796 9.15543C5.48758 9.04593 5.46563 8.93758 5.42337 8.83657C5.38111 8.73556 5.31937 8.64386 5.24167 8.56671L2.5 5.83338H10.8333C11.0543 5.83338 11.2663 5.74558 11.4226 5.5893C11.5789 5.43302 11.6667 5.22106 11.6667 5.00004C11.6667 4.77903 11.5789 4.56707 11.4226 4.41079C11.2663 4.25451 11.0543 4.16671 10.8333 4.16671Z"
        fill="#6E7480"
      />
    </svg>
  );
}

function Tabs({
  tab,
  handleTabChange,
  children,
}: {
  tab: string;
  handleTabChange: (tab: string) => void;
  children: ReactNode | ReactNode[];
}) {
  const permissions = useGetPermissions();
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  const tabs = [
    {
      value: 'info',
      label: 'Información general',
    },
    {
      value: 'account',
      label: 'Estado de cuenta',
      isVisible: shouldShowAccountSections,
    },
    {
      value: 'concept',
      label: 'Conceptos y becas',
      isVisible: shouldShowAccountSections,
    },
    {
      value: 'additional',
      label: 'Información adicional',
    },
    {
      value: 'documents',
      label: 'Documentos',
    },
  ];

  return (
    <>
      <TabsWrapper
        tab={tab}
        tabs={tabs}
        handleChangeTab={handleTabChange}
        defaultValue={tab}
        tabsListClassName="pl-0 px-8 border-b border-b-[#D5DEED]"
        tabsTriggerClassName="text-sm text-[#8B93A0] py-3"
      />
      {children}
    </>
  );
}

function useTab({ admissionId }: { admissionId: string }) {
  const router = useRouter();

  const tabQuery = router.query.tab as string;
  const tab = tabQuery || 'info';

  function handleTabChange(tab: string) {
    if (tab === 'info') {
      return router.push(`/admissions/${admissionId}`);
    }

    return router.push(`/admissions/${admissionId}?tab=${tab}`);
  }

  return { tab, handleTabChange };
}

AdmissionPage.auth = true;

export default AdmissionPage;
