import { Chip } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { BaseConcept } from '@cometa/trpc/src/types';
import { Loader2, Trash2 } from 'lucide-react';
import IcInfoCircleOutlineGray from 'public/assets/icons/ic_info_circle_outline_gray.svg';
import IcPause from 'public/assets/icons/ic_pause.svg';
import IcPlay from 'public/assets/icons/ic_play_2.svg';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelectedSchoolId } from '../../../../guards/AuthGuard';
import { BankAccountAction, BankAccountTab, useBankAccount, useBankAccounts } from '../../../../hooks/bank_accounts';
import { api } from '../../../../utils/api';
import { getBankLabel } from '../../../../utils/bank-helpers';
import { getConceptTypeLabel } from '../../../../utils/concept-helpers';
import { EntityType, getStatusDisplay, getStatusTooltip, getStatusVariant } from '../../../../utils/onboarding-status';
import SidebarActions from '../../../atoms/SidebarActions';
import { Skeleton } from '../../../atoms/Skeleton';
import { Tooltip } from '../../../atoms/Tooltip';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { BankLogo } from '../BankLogo';
import { BankAccountConfirmAction, BankAccountConfirmView } from './BankAccountConfirmView';
import { BankAccountReassignView } from './BankAccountReassignView';
import { ConceptCategoryItem, type ConceptCategory } from './ConceptCategoryItem';

type ConceptsResponse = BaseConcept[] | { results: BaseConcept[] } | { count: number };

enum ReassignmentView {
  Details = 'details',
  Reassignment = 'reassignment',
  DeactivationConfirm = 'deactivation_confirm',
  DeletionConfirm = 'deletion_confirm',
}

type BankAccountDetailsDrawerProps = {
  onClose: () => void;
};

export function BankAccountDetailsDrawer({ onClose }: Readonly<BankAccountDetailsDrawerProps>) {
  const [view, setView] = useState<ReassignmentView>(ReassignmentView.Details);
  const [shouldFetchConcepts, setShouldFetchConcepts] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [cameFromReassignment, setCameFromReassignment] = useState(false);
  const [isDeletionFlow, setIsDeletionFlow] = useState(false);
  const schoolId = useSelectedSchoolId() ?? '';

  const { bankAccountAction, selectedBankAccount, openActivationDialog, openDeleteDialog } = useBankAccount();

  const isViewing =
    bankAccountAction === BankAccountAction.Viewing ||
    bankAccountAction === BankAccountAction.Activation ||
    bankAccountAction === BankAccountAction.Deleting;
  const bankAccount = isViewing ? selectedBankAccount : null;

  const { approvedAccounts } = useBankAccounts(schoolId, BankAccountTab.ACTIVE, true);

  const bankAccountRef = useRef(bankAccount);

  useEffect(() => {
    bankAccountRef.current = bankAccount;
  });

  const {
    data: rawFetchedConcepts,
    isLoading: isLoadingConcepts,
    error: conceptsError,
  } = api.schools.schoolsConceptsList.useQuery(
    {
      school_id: schoolId,
      bank_account: bankAccount?.id ?? '',
    },
    {
      enabled:
        !!schoolId &&
        !!bankAccount?.id &&
        bankAccount?.status === OnboardingStatus.Approved &&
        !(bankAccount?.isArchived || (bankAccount?.status as string) === 'archived'),
      refetchOnMount: true,
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (!shouldFetchConcepts || isLoadingConcepts) {
      return;
    }

    if (conceptsError) {
      setShouldFetchConcepts(false);
      setIsProcessing(false);
      return;
    }

    if (rawFetchedConcepts && bankAccountRef.current) {
      setShouldFetchConcepts(false);
      setIsProcessing(false);

      const concepts = extractConcepts(rawFetchedConcepts);
      if (concepts.length === 0) {
        // No concepts, directly show confirmation view (deactivation or deletion)
        setView(isDeletionFlow ? ReassignmentView.DeletionConfirm : ReassignmentView.DeactivationConfirm);
      } else {
        setView(ReassignmentView.Reassignment);
      }
    }
  }, [shouldFetchConcepts, isLoadingConcepts, conceptsError, rawFetchedConcepts, isDeletionFlow]);

  // Group concepts by category
  const conceptCategories: ConceptCategory[] = useMemo(() => {
    const concepts = extractConcepts(rawFetchedConcepts);
    if (!concepts || concepts.length === 0) return [];

    const categoryMap = new Map<string, { concepts: Array<{ id: string; name: string }>; count: number }>();

    concepts.forEach((concept) => {
      const type = concept.type || 'Otros';
      if (!categoryMap.has(type)) {
        categoryMap.set(type, { concepts: [], count: 0 });
      }
      const category = categoryMap.get(type);
      if (category) {
        category.concepts.push({ id: concept.id, name: concept.name });
        category.count += 1;
      }
    });

    return Array.from(categoryMap.entries()).map(([type, data]) => ({
      id: type,
      name: getConceptTypeLabel(type),
      count: data.count,
      concepts: data.concepts,
    }));
  }, [rawFetchedConcepts]);

  if (!bankAccount) return null;

  const displayName = bankAccount.nickname ?? `Cuenta ${getBankLabel(bankAccount.bank_name)}`;
  const isPendingReview = bankAccount.status === OnboardingStatus.Pending;
  const isVerified = bankAccount.status === OnboardingStatus.Approved;
  const isArchived = bankAccount.isArchived || (bankAccount.status as string) === 'archived';

  const otherAccounts = approvedAccounts.filter((acc) => acc.id !== bankAccount.id);
  const isOnlyActiveBankAccount = otherAccounts.length === 0;

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleDeleteClick = () => {
    setIsDeletionFlow(true);
    setIsProcessing(true);
    setShouldFetchConcepts(true);
  };

  const handleOnboardingDeleteClick = () => {
    openDeleteDialog(bankAccount);
  };

  const handleDeactivate = () => {
    setIsDeletionFlow(false);
    setIsProcessing(true);
    setShouldFetchConcepts(true);
  };

  const handleReactivate = () => {
    openActivationDialog(bankAccount);
  };

  if (view === ReassignmentView.Reassignment) {
    return (
      <BankAccountReassignView
        conceptsData={extractConcepts(rawFetchedConcepts)}
        onCancel={() => setView(ReassignmentView.Details)}
        onSuccess={() => {
          setCameFromReassignment(true);
          setView(isDeletionFlow ? ReassignmentView.DeletionConfirm : ReassignmentView.DeactivationConfirm);
        }}
      />
    );
  }

  if (view === ReassignmentView.DeactivationConfirm) {
    return (
      <BankAccountConfirmView
        confirmAction={BankAccountConfirmAction.DEACTIVATE}
        onCancel={() => setView(ReassignmentView.Details)}
        showStepNumber={cameFromReassignment}
      />
    );
  }

  if (view === ReassignmentView.DeletionConfirm) {
    return (
      <BankAccountConfirmView
        confirmAction={BankAccountConfirmAction.DELETE}
        onCancel={() => setView(ReassignmentView.Details)}
        showStepNumber={cameFromReassignment}
      />
    );
  }

  let conceptsContent: JSX.Element | null = null;

  if (isLoadingConcepts) {
    conceptsContent = (
      <>
        <ConceptSkeleton />
        <ConceptSkeleton />
      </>
    );
  } else if (conceptsError) {
    conceptsContent = <div className="text-[#697086] text-[14px]">Error al cargar conceptos</div>;
  } else {
    conceptsContent = (
      <>
        {conceptCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          return (
            <ConceptCategoryItem
              key={category.id}
              category={category}
              isExpanded={isExpanded}
              onToggle={() => toggleCategoryExpansion(category.id)}
            />
          );
        })}
        {conceptCategories.length === 0 && (
          <div className="content-stretch flex gap-2 items-center relative shrink-0 w-full">
            <IcInfoCircleOutlineGray className="w-4 h-4 flex-shrink-0" />
            <p
              className="font-['Lota_Grotesque',_sans-serif] leading-6 not-italic relative shrink-0
                text-[#697086] text-base whitespace-pre"
            >
              Cuenta sin conceptos asociados
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Cuenta bancaria"
        onClose={onClose}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />
      <div className="flex-1 overflow-y-auto px-8">
        <div className="flex flex-col gap-8 mb-6 pt-8">
          <div
            className="bg-[#f8f9fb] border border-[#e6ebf5] box-border content-stretch
              flex gap-4 items-center justify-start p-4 relative rounded-lg shrink-0 w-full"
          >
            <BankLogo bankName={bankAccount.bank_name} size={48} />
            <div className="flex-1 content-stretch flex flex-col gap-2 items-start justify-center min-h-px min-w-px relative shrink-0">
              <Tooltip
                message={
                  isArchived
                    ? 'Esta cuenta ha sido desactivada temporalmente'
                    : getStatusTooltip(bankAccount.status, EntityType.BankAccount)
                }
              >
                <Chip variant={isArchived ? 'warning' : getStatusVariant(bankAccount.status) || 'blue'}>
                  {isArchived ? 'Desactivada' : getStatusDisplay(bankAccount.status)}
                </Chip>
              </Tooltip>
              <p
                className="font-['Lota_Grotesque',_sans-serif] leading-6 not-italic
                  text-[#22283a] text-base font-semibold w-full"
              >
                {displayName}
              </p>
            </div>
          </div>

          <div
            className="content-stretch flex flex-col gap-2 items-start justify-start relative
              shrink-0 w-full"
          >
            <p
              className="font-['Lota_Grotesque',_sans-serif] leading-6 not-italic
                relative shrink-0 text-[#22283a] text-base font-semibold w-full"
            >
              Detalles de la cuenta
            </p>
            <div className="border border-[#d0d8e9] rounded-lg overflow-clip shrink-0 w-full">
              <DetailsRow label="Titular" content={bankAccount.owner || 'No especificado'} />
              <DetailsRow label="Banco" content={bankAccount.bank_name} />
              <DetailsRow label="Número CLABE" content={bankAccount.account_number} />
              {bankAccount.document_type && (
                <DetailsRow label="Tipo de documento" content={bankAccount.document_type} />
              )}
              {bankAccount.document_number && (
                <DetailsRow label="No. de documento" content={bankAccount.document_number} />
              )}
            </div>
          </div>

          {/* Concepts Section - Only show for approved accounts */}
          {isVerified && !isArchived && (
            <div className="content-stretch flex flex-col gap-4 items-start relative shrink-0 w-full">
              {conceptCategories.length > 0 && (
                <p
                  className="font-['Lota_Grotesque',_sans-serif] leading-6 not-italic relative shrink-0
                    text-[#697086] text-base w-full"
                >
                  Conceptos asociados a la cuenta:
                </p>
              )}
              <div className="content-stretch flex flex-col gap-3 items-start relative shrink-0 w-full">
                {conceptsContent}
              </div>
            </div>
          )}
        </div>
      </div>

      <SidebarActions variant="form">
        {isPendingReview && (
          <Button variant="destructive" onClick={handleOnboardingDeleteClick} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Eliminar cuenta
          </Button>
        )}
        {isVerified && !isArchived && (
          <>
            <Tooltip
              message={
                isOnlyActiveBankAccount
                  ? 'No es posible eliminar esta cuenta porque es la única activa. Agrega una nueva primero.'
                  : undefined
              }
            >
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="flex items-center gap-2"
                disabled={isProcessing || !!conceptsError || isOnlyActiveBankAccount}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar cuenta
              </Button>
            </Tooltip>
            <Tooltip
              message={
                isOnlyActiveBankAccount
                  ? 'No es posible desactivar esta cuenta porque es la única activa. Agrega una nueva primero.'
                  : undefined
              }
            >
              <Button
                variant={isProcessing ? 'neutral' : 'light'}
                onClick={handleDeactivate}
                disabled={isProcessing || !!conceptsError || isOnlyActiveBankAccount}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando
                  </>
                ) : (
                  <>
                    <IcPause className="w-4 h-4" />
                    {conceptsError ? 'Error al cargar' : 'Desactivar temporalmente'}
                  </>
                )}
              </Button>
            </Tooltip>
          </>
        )}
        {isArchived && (
          <Button variant="light" onClick={handleReactivate} className="flex items-center gap-2">
            <IcPlay className="w-4 h-4" />
            Reactivar cuenta
          </Button>
        )}
      </SidebarActions>
    </div>
  );
}

type DetailsRowProps = {
  label: string;
  content: string;
};

function DetailsRow({ label, content }: Readonly<DetailsRowProps>) {
  return (
    <div
      className="bg-white box-border content-stretch flex gap-4 items-center px-6 py-4
    relative shrink-0 w-full border-b border-[#eceff6] last:border-b-0"
    >
      <p
        className="font-['Lota_Grotesque',_sans-serif] leading-5 not-italic relative shrink-0
      text-[#697086] text-sm w-[132px]"
      >
        {label}
      </p>
      <p
        className="font-['Lota_Grotesque',_sans-serif] leading-6 not-italic relative shrink-0
      text-[#22283a] text-base flex-1"
      >
        {content}
      </p>
    </div>
  );
}

function ConceptSkeleton() {
  return <Skeleton variant="card" className="h-[52px] w-full px-4 py-3" />;
}

function extractConcepts(data: ConceptsResponse | undefined): BaseConcept[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}
