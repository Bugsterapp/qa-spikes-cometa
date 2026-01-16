import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import {
  ConfigurationLayout,
  AudienceSelector,
  CredentialMockup,
  DrawerLayout,
  IncompleteInfoPanel,
} from '../../components/credentials/shared';
import { CredentialCard } from '../../components/credentials/shared/credential-card';
import { CredentialModal } from '../../components/credentials/credential-modal';
import { CredentialProvider } from '../../components/credentials/credential-provider';
import { useCredential } from '../../components/credentials/credential-context';
import { LoadingScreen } from '../../components/credentials/loading-screen';
import {
  getCredentialColumns,
  transformStudentsToTree,
  extractStudentsFromTree,
} from '../../components/credentials/audience-utils';
import { SAMPLE_STUDENT_DATA } from '../../components/credentials/types';
import { extractRequiredFields } from '../../components/credentials/utils/required-fields-extractor';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import type { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { mapFromBackendConfig } from '../../components/credentials/utils/backend-mapper';
import { getEntityLabels, DEFAULT_ENTITY_LABELS } from '../../components/credentials/shared/audience-selector';

type SelectedStudent = {
  id: string;
  firstName: string;
  lastName: string;
  hasCompletedInfo: boolean;
  level: string;
  grade: string;
};

GenerateCredentialPage.auth = true;

export default function GenerateCredentialPage() {
  return (
    <CredentialProvider initialStudentData={SAMPLE_STUDENT_DATA}>
      <GenerateCredential />
    </CredentialProvider>
  );
}

export function GenerateCredential() {
  const router = useRouter();
  const { templateId } = router.query;
  const selectedSchool = useSelectedSchool();
  const [studentsSelected, setStudentsSelected] = useState<SelectedStudent[]>([]);
  const [search, setSearch] = useState('');
  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const { setConfig, config } = useCredential();

  const requiredFields = useMemo(
    () =>
      extractRequiredFields(config, {
        credentialType: config?.type,
      }),
    [config]
  );

  const entityLabels = useMemo(() => (config?.type ? getEntityLabels(config.type) : undefined), [config?.type]);

  const { data: template, isLoading: isLoadingTemplate } = api.credentials.getTemplate.useQuery(
    {
      templateId: templateId as string,
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!templateId && !!selectedSchool?.id,
    }
  );

  const generateCredentialsMutation = api.credentials.generateFilteredCredentialsZip.useMutation({
    onSuccess: () => {
      setIsGeneratingModalOpen(true);
    },
  });

  const { data: schoolCycles, isPending: isLoadingSchoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: selectedSchool?.id || '',
  });

  const activeSchoolCycle = schoolCycles?.find((item) => item.is_active);

  const { data: studentsData, isLoading: isLoadingStudents } =
    api.schools.schoolsStudentsByLevelListWithoutConcept.useQuery(
      {
        school_id: selectedSchool?.id || '',
        query: {
          school_cycle: schoolCycle?.id || activeSchoolCycle?.id,
          search: search,
          required_fields: requiredFields,
        },
      },
      {
        enabled: !!selectedSchool?.id && !isLoadingSchoolCycles,
      }
    );

  const studentsTree = useMemo(() => transformStudentsToTree(studentsData, entityLabels), [studentsData, entityLabels]);

  const columns = useMemo(() => getCredentialColumns(studentsSelected.map((s) => s.id)), [studentsSelected]);

  // Update credential config when template loads
  useEffect(() => {
    if (template) {
      const credentialConfig = mapFromBackendConfig(template);
      setConfig(credentialConfig);
    }
  }, [template, setConfig]);

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      if (!studentsTree || studentsTree.length === 0) {
        setStudentsSelected([]);
        return;
      }

      const students = extractStudentsFromTree(studentsTree, selectedIds);
      setStudentsSelected(students);
    },
    [studentsTree]
  );

  const executeGeneration = async (excludeIncomplete: boolean) => {
    const studentsToGenerate = excludeIncomplete
      ? studentsSelected.filter((s) => s.hasCompletedInfo)
      : studentsSelected;

    setIsPanelOpen(false);

    await generateCredentialsMutation.mutateAsync({
      templateId: templateId as string,
      data: {
        school_id: selectedSchool?.id as string,
        student_ids: studentsToGenerate.map((s) => s.id),
        school_cycle_id: schoolCycle?.id || activeSchoolCycle?.id,
      },
    });
  };

  const handleGenerateCredentials = async () => {
    if (hasIncompleteInfo) {
      setIsPanelOpen(true);
      return;
    }

    await executeGeneration(false);
  };

  const handleClose = () => {
    router.push('/credentials');
  };

  const handleModalDismiss = () => {
    setIsGeneratingModalOpen(false);
    setIsPanelOpen(false);

    // Clean up pointer-events when modal is dismissed
    document.body.style.pointerEvents = '';

    // Clean again after modal unmounts to ensure it's removed
    requestAnimationFrame(() => {
      document.body.style.pointerEvents = '';
    });
  };

  const handleModalConfirm = () => {
    setIsGeneratingModalOpen(false);
    setIsPanelOpen(false);

    // Clean up pointer-events that Dialog/Sheet set on body to prevent blocking the destination page
    document.body.style.pointerEvents = '';

    setTimeout(() => {
      handleClose();
      // Clean again after navigation starts
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    }, 100);
  };

  if (isLoadingTemplate) {
    return (
      <DrawerLayout title="Generar credenciales" onClose={handleClose}>
        <LoadingScreen
          title="Cargando..."
          description="Estamos cargando la información de los alumnos. En unos segundos estará lista."
        />
      </DrawerLayout>
    );
  }

  if (!template) {
    return (
      <DrawerLayout title="Generar credenciales" onClose={handleClose}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Plantilla no encontrada</div>
        </div>
      </DrawerLayout>
    );
  }

  const hasIncompleteInfo = studentsSelected.some((student) => !student.hasCompletedInfo);
  const warningMessage =
    hasIncompleteInfo && entityLabels ? `Algunos ${entityLabels.plural} tienen información incompleta` : undefined;
  const buttonLabel = hasIncompleteInfo ? 'Revisar y confirmar' : 'Generar credenciales';

  const incompleteStudents = studentsSelected.filter((s) => !s.hasCompletedInfo);

  const schoolData = selectedSchool
    ? {
        name: selectedSchool.name,
        logo: selectedSchool.logo || '',
      }
    : undefined;

  return (
    <>
      <DrawerLayout title="Generar credenciales" onClose={handleClose}>
        <ConfigurationLayout
          leftContent={
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-neutral-900">Elige tu audiencia</h2>
                <p className="text-sm text-neutral-700">
                  Selecciona los {(entityLabels || DEFAULT_ENTITY_LABELS).plural} para generar sus credenciales
                </p>
              </div>

              <div className="flex items-center gap-4 w-full">
                <div className="flex-1">
                  <GlobalSearch
                    search={search}
                    setSearch={setSearch}
                    placeholder="Buscar"
                    isLegacy={false}
                    className="!min-w-0 w-full"
                  />
                </div>
                {schoolCycles && schoolCycles.length > 0 && (
                  <div className="flex-shrink-0">
                    <SchoolCycleSelector
                      selected={schoolCycle || activeSchoolCycle || null}
                      setFn={setSchoolCycle}
                      cycles={schoolCycles || []}
                      hideTodos
                    />
                  </div>
                )}
              </div>

              <AudienceSelector
                data={studentsTree}
                columns={columns}
                selectedIds={studentsSelected.map((s) => s.id)}
                onSelectionChange={handleSelectionChange}
                isLoading={isLoadingStudents}
                showMetadataCount
                showFooter
                entityLabels={entityLabels}
              />
            </div>
          }
          rightContent={
            <CredentialMockup orientation={config.orientation}>
              <CredentialCard studentData={SAMPLE_STUDENT_DATA} schoolData={schoolData} />
            </CredentialMockup>
          }
          leftColumnWidth="w-[60%] min-w-[600px]"
          footer={{
            buttonLabel,
            buttonAction: handleGenerateCredentials,
            disabled: studentsSelected.length === 0,
            warningMessage,
          }}
        />
      </DrawerLayout>

      <IncompleteInfoPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onGenerate={executeGeneration}
        students={incompleteStudents}
        entityLabels={entityLabels}
      />

      {isGeneratingModalOpen && (
        <CredentialModal
          open={isGeneratingModalOpen}
          onClose={handleModalDismiss}
          onConfirm={handleModalConfirm}
          variant="generating"
        />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  if (!isMobile) {
    return { props: {} };
  }

  return {
    redirect: {
      permanent: false,
      destination: '/only-desktop',
    },
  };
};
