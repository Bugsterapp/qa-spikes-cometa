import { useState, useMemo, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Layout from '../../components/layouts';
import { PageStateHandler } from '../../components/school_config';
import { useGetMembership, useSelectedSchool } from '../../guards/AuthGuard';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import useAlert from '../../hooks/useAlert';
import { api } from '../../utils/api';
import { OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { Status2B3Enum } from '@cometa/trpc/src/types';
import IcCircleError from 'public/assets/icons/ic_circle_error.svg';
import { Skeleton } from '../../components/atoms/Skeleton';
import { OnboardingTaskList, OnboardingTaskItem } from '../../components/onboarding';
import {
  ArticlesOfIncorporationForm,
  ProofOfAddressForm,
  LegalRepresentativeForm,
  ArticlesOfIncorporationDetailsDrawer,
  ProofOfAddressDetailsDrawer,
  LegalRepresentativeDetailsDrawer,
  type LegalRepresentative,
} from '../../components/school_config/legal_documents';
import { FormDrawerSheet } from '../../components/school_config/CustomSheets';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import Sheet from '../../components/atoms/Sheet';
import { useLegalDocumentsMutations } from '../../hooks/useLegalDocumentsMutations';
import {
  ALLOWED_MEMBERSHIPS,
  DocumentSection,
  DOCUMENT_CONFIG,
  DOCUMENT_SECTIONS_ORDER,
} from '../../constants/legalDocuments';
import {
  deleteExistingFiles,
  uploadFiles,
  getDocumentStatus,
  getStatusProps,
  HAS_DATA_FUNCTIONS,
  getErrorMessage,
  formatDateForInput,
} from '../../utils/legal-documents-utils';

export default function LegalDocumentsPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const enableLegalDocumentsFlag = useFlagWithVariableMatching('enable_legal_documents');

  const [activeDrawer, setActiveDrawer] = useState<DocumentSection | null>(null);
  const [activeDetailsDrawer, setActiveDetailsDrawer] = useState<DocumentSection | null>(null);

  const {
    data: legalDocuments,
    isPending: isLoading,
    isError,
  } = api.bot.getLegalDocuments.useQuery(
    { schoolId: selectedSchool?.id ?? '' },
    {
      enabled: !!selectedSchool?.id && enableLegalDocumentsFlag.isEnabled,
      retry: false,
    }
  );

  const {
    createLegalDocumentsMutation,
    updateLegalDocumentsMutation,
    uploadFileMutation,
    deleteFileMutation,
    isSaving,
    setIsUploadingFiles,
  } = useLegalDocumentsMutations();

  useEffect(() => {
    if (!isLoading && !isError && legalDocuments === null && selectedSchool?.id) {
      createLegalDocumentsMutation
        .mutateAsync({
          schoolId: selectedSchool.id,
          data: {
            legal_representative_name: null,
            legal_representative_last_name: null,
            legal_representative_curp: null,
            legal_representative_birth_date: null,
            web_url: null,
            proof_of_address_issued_at: null,
          },
        })
        .catch((error) => {
          Sentry.captureException(error, {
            tags: { feature: 'legal_documents' },
            extra: { schoolId: selectedSchool.id, context: 'auto_create_legal_documents' },
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isError, legalDocuments, selectedSchool?.id]);

  const ensureLegalDocumentsExists = async () => {
    if (!selectedSchool?.id) return null;

    let legalDocumentsId = legalDocuments?.id;

    if (!legalDocumentsId) {
      const created = await createLegalDocumentsMutation.mutateAsync({
        schoolId: selectedSchool.id,
        data: {
          legal_representative_name: null,
          legal_representative_last_name: null,
          legal_representative_curp: null,
          legal_representative_birth_date: null,
          web_url: null,
          proof_of_address_issued_at: null,
        },
      });
      legalDocumentsId = created?.id;
    }

    return legalDocumentsId;
  };

  const updateStatusToPending = (statusKey: string) => ({
    ...legalDocuments?.status,
    [statusKey]: OnboardingStatus.Pending,
  });

  const handleSaveDocuments = async (
    section: DocumentSection,
    files: File[],
    additionalData?: Record<string, unknown>,
    errorContext?: string
  ) => {
    try {
      const legalDocumentsId = await ensureLegalDocumentsExists();
      if (!legalDocumentsId) return;

      const config = DOCUMENT_CONFIG[section];

      if (files.length > 0) {
        await deleteExistingFiles(
          legalDocuments,
          legalDocumentsId,
          config.documentType,
          config.filesKey,
          deleteFileMutation
        );

        await uploadFiles(files, legalDocumentsId, config.documentType, uploadFileMutation, setIsUploadingFiles);
      }

      const updatePayload: Record<string, unknown> = {
        ...additionalData,
      };

      if (files.length > 0) {
        updatePayload.status = updateStatusToPending(config.statusKey);
      }

      await updateLegalDocumentsMutation.mutateAsync({
        legalDocumentsId,
        data: updatePayload,
      });

      setAlertState({
        open: true,
        severity: 'success',
        message: config.successMessage,
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: getErrorMessage(error, errorContext),
      });
    }
  };

  const handleSaveArticles = async (files: File[]) => {
    await handleSaveDocuments(DocumentSection.Articles, files, undefined, 'el acta constitutiva');
  };

  const handleSaveProofOfAddress = async (data: { files: File[]; issuedAt: string }) => {
    await handleSaveDocuments(
      DocumentSection.ProofOfAddress,
      data.files,
      { proof_of_address_issued_at: data.issuedAt || null },
      'el comprobante de domicilio'
    );
  };

  const handleSaveLegalRepresentative = async (representative: LegalRepresentative) => {
    await handleSaveDocuments(
      DocumentSection.LegalRepresentative,
      representative.files,
      {
        legal_representative_name: representative.legal_representative_name || null,
        legal_representative_last_name: representative.legal_representative_last_name || null,
        legal_representative_curp: representative.legal_representative_curp || null,
        legal_representative_birth_date: representative.legal_representative_birth_date || null,
      },
      'el representante legal'
    );
  };

  const handleTaskClick = (section: DocumentSection, status: OnboardingStatus | null, hasData?: boolean) => {
    if (hasData && (status === OnboardingStatus.Pending || status === OnboardingStatus.Approved)) {
      setActiveDetailsDrawer(section);
    } else {
      setActiveDrawer(section);
    }
  };

  const isSchoolInOnboarding = selectedSchool?.status === Status2B3Enum.Onboarding;
  const canViewPage =
    ALLOWED_MEMBERSHIPS.includes(membership ?? '') && enableLegalDocumentsFlag.isEnabled && isSchoolInOnboarding;

  useSendPageViewedEvent('Documentos legales', selectedSchool);

  const taskItems = useMemo(
    () =>
      DOCUMENT_SECTIONS_ORDER.map((section) => {
        const config = DOCUMENT_CONFIG[section];
        const hasDataFn = HAS_DATA_FUNCTIONS[section];
        const hasData = hasDataFn(legalDocuments);
        const status = getDocumentStatus(legalDocuments, config.statusKey);
        const statusProps = getStatusProps(status);
        return { section, config, hasData, status, statusProps };
      }),
    [legalDocuments]
  );

  if (isError) {
    return (
      <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
        <div className="bg-[#FFE7D9] text-[#7A0C2E] flex flex-row items-start p-4 rounded-lg text-sm font-normal gap-3 w-full">
          <IcCircleError className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold font-lota text-sm leading-5">
              Ocurrió un error al cargar los documentos legales
            </h3>
            <p className="font-normal font-lota text-sm leading-5">
              Comunícate con el equipo o inténtalo nuevamente recargando la página.
            </p>
          </div>
        </div>
      </PageStateHandler>
    );
  }

  return (
    <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="flex flex-col items-start px-8 sm:px-0 pt-6 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[612px] mx-auto">
            <div className="content-stretch flex flex-col gap-8 items-start justify-start relative w-full">
              <div className="content-stretch flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0 w-full">
                <div className="font-lota font-semibold relative shrink-0 text-[#22283a] text-[24px] w-full">
                  <p className="leading-[32px]">Documentos legales de la institución</p>
                </div>
                <div className="flex flex-col font-lota justify-center relative shrink-0 text-[#444c60] text-[16px] w-full">
                  <p className="leading-[24px]">
                    Registra aquí los documentos legales necesarios para la operación de tu institución
                  </p>
                </div>
              </div>

              <div className="content-stretch flex flex-col gap-8 items-start justify-start relative shrink-0 w-full">
                {isLoading ? (
                  <div className="flex flex-col gap-4 w-full">
                    <Skeleton className="w-full h-20" variant="card" />
                    <Skeleton className="w-full h-20" variant="card" />
                    <Skeleton className="w-full h-20" variant="card" />
                  </div>
                ) : (
                  <OnboardingTaskList>
                    {taskItems.map((item, index) => {
                      const isLast = index === taskItems.length - 1;

                      return (
                        <OnboardingTaskItem
                          key={item.section}
                          title={item.config.title}
                          description={item.config.description}
                          statusBadge={item.statusProps.badge}
                          chipVariant={item.statusProps.chip?.variant}
                          chipText={item.statusProps.chip?.text}
                          onClick={() => handleTaskClick(item.section, item.status, item.hasData)}
                          isLast={isLast}
                        />
                      );
                    })}
                  </OnboardingTaskList>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FormDrawerSheet
        open={activeDrawer === DocumentSection.Articles}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
      >
        <ArticlesOfIncorporationForm
          onClose={() => setActiveDrawer(null)}
          onSave={handleSaveArticles}
          isLoading={isSaving}
        />
      </FormDrawerSheet>

      <FormDrawerSheet
        open={activeDrawer === DocumentSection.ProofOfAddress}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
      >
        <ProofOfAddressForm
          onClose={() => setActiveDrawer(null)}
          onSave={handleSaveProofOfAddress}
          isLoading={isSaving}
          initialDate={formatDateForInput(legalDocuments?.proof_of_address_issued_at)}
        />
      </FormDrawerSheet>

      <FormDrawerSheet
        open={activeDrawer === DocumentSection.LegalRepresentative}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
      >
        <LegalRepresentativeForm
          onClose={() => setActiveDrawer(null)}
          onSave={handleSaveLegalRepresentative}
          isLoading={isSaving}
          initialData={{
            legal_representative_name: legalDocuments?.legal_representative_name || '',
            legal_representative_last_name: legalDocuments?.legal_representative_last_name || '',
            legal_representative_curp: legalDocuments?.legal_representative_curp || '',
            legal_representative_birth_date: formatDateForInput(legalDocuments?.legal_representative_birth_date),
          }}
        />
      </FormDrawerSheet>

      <DetailsDrawerSheet
        open={activeDetailsDrawer === DocumentSection.Articles}
        onOpenChange={(open) => !open && setActiveDetailsDrawer(null)}
      >
        <ArticlesOfIncorporationDetailsDrawer
          legalDocuments={legalDocuments}
          onClose={() => setActiveDetailsDrawer(null)}
        />
      </DetailsDrawerSheet>

      <DetailsDrawerSheet
        open={activeDetailsDrawer === DocumentSection.ProofOfAddress}
        onOpenChange={(open) => !open && setActiveDetailsDrawer(null)}
      >
        <ProofOfAddressDetailsDrawer legalDocuments={legalDocuments} onClose={() => setActiveDetailsDrawer(null)} />
      </DetailsDrawerSheet>

      <DetailsDrawerSheet
        open={activeDetailsDrawer === DocumentSection.LegalRepresentative}
        onOpenChange={(open) => !open && setActiveDetailsDrawer(null)}
      >
        <LegalRepresentativeDetailsDrawer
          legalDocuments={legalDocuments}
          onClose={() => setActiveDetailsDrawer(null)}
        />
      </DetailsDrawerSheet>
    </PageStateHandler>
  );
}

type DetailsDrawerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function DetailsDrawerSheet({ open, onOpenChange, children }: Readonly<DetailsDrawerSheetProps>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        {children}
      </Sheet.Content>
    </Sheet>
  );
}

LegalDocumentsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Documentos legales" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

LegalDocumentsPage.auth = true;
