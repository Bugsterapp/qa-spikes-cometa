import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';
import { Loader2 } from 'lucide-react';
import IcCircleError from 'public/assets/icons/ic_circle_error.svg';
import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';
import { useEffect, useRef, useState } from 'react';
import Sheet from '../../components/atoms/Sheet';
import { Skeleton } from '../../components/atoms/Skeleton';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import Layout from '../../components/layouts';
import { PageStateHandler } from '../../components/school_config';
import { BankAccountActivationDialog } from '../../components/school_config/bank_accounts/BankAccountActivationDialog';
import { BankAccountCard } from '../../components/school_config/bank_accounts/BankAccountCard';
import { BankAccountDetailsDrawer } from '../../components/school_config/bank_accounts/BankAccountDetailsDrawer';
import { BankAccountForm } from '../../components/school_config/bank_accounts/BankAccountForm';
import { BankAccountHistoryDrawer } from '../../components/school_config/bank_accounts/BankAccountHistoryDrawer';
import {
  BankAccountStateVariant,
  EmptyBankAccountState,
} from '../../components/school_config/bank_accounts/EmptyBankAccountState';
import { FormDrawerSheet } from '../../components/school_config/CustomSheets';
import { PillTabs, PillTabsList, PillTabsTrigger } from '../../components/ui/PillTabs';
import { useGetMembership, useSelectedSchool } from '../../guards/AuthGuard';
import {
  BankAccountAction,
  BankAccountTab,
  DialogState,
  DrawerView,
  ExtendedBankAccountEntity,
  useBankAccount,
  useBankAccounts,
} from '../../hooks/bank_accounts';
import { useBankAccountMutations } from '../../hooks/bank_accounts/useBankAccountMutations';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';

const allowedMemberships = new Set(['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR']);

export default function BankAccountsPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { isEnabled: enableBankAccountsFlag } = useFlagWithVariableMatching('enable_bank_accounts');

  const {
    drawerView,
    bankAccountAction,
    selectedBankAccount,
    dialogState,
    isCreating,
    isDeleting,
    isReassigning,
    isArchiving,
    setDrawerView,
    setBankAccountAction,
    handleAddNew,
    handleCloseDetails,
    closeDrawer,
    closeDialog,
  } = useBankAccount();

  const [activeTab, setActiveTab] = useState<BankAccountTab>(BankAccountTab.ACTIVE);

  const { accounts, isLoading, isBankAccountsError, isFetchingNextPage, hasNextPage, fetchNextPage } = useBankAccounts(
    selectedSchool?.id,
    activeTab,
    enableBankAccountsFlag
  );

  const { confirmOnboardingDelete } = useBankAccountMutations();

  const isMutating = isCreating || isDeleting || isReassigning || isArchiving;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    const should_skip_next_page_fetch = !loadMoreElement || !hasNextPage || activeTab !== BankAccountTab.ACTIVE;

    if (should_skip_next_page_fetch) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  const handleConfirmDelete = () => {
    if (selectedBankAccount && bankAccountAction === BankAccountAction.Deleting) {
      confirmOnboardingDelete(selectedBankAccount.id);
    }

    closeDrawer();
    closeDialog();
  };

  const handleCancelDelete = () => {
    closeDialog();
    if (selectedBankAccount) {
      setBankAccountAction(BankAccountAction.Viewing, selectedBankAccount);
    }
  };

  const handleCloseDetailsLocal = () => {
    if (dialogState !== DialogState.None) {
      return;
    }
    handleCloseDetails();
  };

  const isEmpty = !isLoading && !isMutating && accounts.length === 0;
  const showInitialSkeleton = isLoading;
  const showMutationLoading = isMutating && !isLoading;
  useSendPageViewedEvent('Cuentas bancarias', selectedSchool);

  const canViewPage = allowedMemberships.has(membership ?? '') && enableBankAccountsFlag;

  if (isBankAccountsError) {
    return (
      <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
        <BankAccountsStatus
          isInitialLoading={false}
          isError={isBankAccountsError}
          isEmpty={false}
          onAddNew={handleAddNew}
        />
      </PageStateHandler>
    );
  }

  return (
    <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="flex flex-col items-start px-8 sm:px-0 pt-6 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[540px] mx-auto">
            <div className="content-stretch flex flex-col gap-8 items-start justify-start relative w-full">
              <div className="content-stretch flex flex-col gap-6 items-start justify-start leading-[0] not-italic relative shrink-0 w-full">
                <div className="flex flex-row items-start justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <div className="font-['Lota_Grotesque',_sans-serif] font-semibold relative shrink-0 text-[#22283a] text-[24px]">
                      <p className="leading-[32px]">Cuentas bancarias</p>
                    </div>
                    <div className="flex flex-col font-['Lota_Grotesque',_sans-serif] justify-center relative shrink-0 text-[#444c60] text-[16px]">
                      <p className="leading-[24px]">Añade todas las cuentas bancarias que usarás en Cometa</p>
                    </div>
                  </div>
                  <Button variant="light" size="sm" onClick={() => setDrawerView(DrawerView.History)}>
                    Ver historial
                  </Button>
                </div>

                <PillTabs
                  value={activeTab}
                  onValueChange={(value) => {
                    if (value === BankAccountTab.ACTIVE || value === BankAccountTab.DEACTIVATED) {
                      setActiveTab(value);
                    }
                  }}
                >
                  <PillTabsList>
                    <PillTabsTrigger value={BankAccountTab.ACTIVE}>Tus cuentas</PillTabsTrigger>
                    <PillTabsTrigger value={BankAccountTab.DEACTIVATED}>Cuentas desactivadas</PillTabsTrigger>
                  </PillTabsList>
                </PillTabs>
              </div>

              <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0 w-full">
                {activeTab === BankAccountTab.ACTIVE ? (
                  <>
                    {isEmpty || showInitialSkeleton || showMutationLoading ? (
                      <BankAccountsStatus
                        isInitialLoading={showInitialSkeleton || showMutationLoading}
                        isError={false}
                        isEmpty={isEmpty && !showInitialSkeleton && !showMutationLoading}
                        onAddNew={handleAddNew}
                      />
                    ) : (
                      <>
                        {accounts.map((bankAccount) => (
                          <BankAccountCard key={bankAccount.id} bankAccount={bankAccount} />
                        ))}
                        {hasNextPage && <div ref={loadMoreRef} className="h-4 w-full" />}

                        {isFetchingNextPage && <Skeleton className="w-full h-20" variant="card" />}

                        <div className="sticky bottom-0 w-full -mt-4">
                          <div className="absolute bottom-full left-0 right-0 h-20  pointer-events-none" />
                          <div className="bg-white pt-4 pb-6">
                            <Button variant="ghost" className="gap-1" onClick={handleAddNew}>
                              <div className="overflow-clip relative shrink-0 size-4">
                                <IcPlus width="16" height="16" className="text-[#22283a]" />
                              </div>
                              <div className="flex flex-col font-['Lota_Grotesque',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#22283a] text-[14px] text-nowrap">
                                <p className="leading-[20px] whitespace-pre">Agregar cuenta</p>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <DeactivatedBankAccountsContent
                    showLoading={showInitialSkeleton || showMutationLoading}
                    isEmpty={isEmpty}
                    accounts={accounts}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet
        open={drawerView === DrawerView.Details}
        onOpenChange={(open) => {
          if (!open) handleCloseDetailsLocal();
        }}
      >
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <BankAccountDetailsDrawer onClose={handleCloseDetailsLocal} />
        </Sheet.Content>
      </Sheet>

      <Sheet
        open={drawerView === DrawerView.History}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      >
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <BankAccountHistoryDrawer />
        </Sheet.Content>
      </Sheet>

      <FormDrawerSheet
        open={drawerView === DrawerView.BankAccountForm}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      >
        <BankAccountForm />
      </FormDrawerSheet>

      <Dialog.Root
        open={dialogState === DialogState.Delete}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <Dialog.Title>¿Quieres eliminar esta cuenta bancaria?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close onClick={handleCancelDelete} asChild>
            <Button className="w-full" variant="ghost">
              No, volver
            </Button>
          </Dialog.Close>
          <Button
            className="w-full bg-[#FF4842] hover:bg-[#c73833] text-white"
            onClick={handleConfirmDelete}
            disabled={isMutating}
          >
            {isMutating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Sí, eliminar'
            )}
          </Button>
        </div>
      </Dialog.Root>

      <BankAccountActivationDialog />
    </PageStateHandler>
  );
}

type DeactivatedBankAccountsContentProps = {
  showLoading: boolean;
  isEmpty: boolean;
  accounts: ExtendedBankAccountEntity[];
};

function DeactivatedBankAccountsContent({
  showLoading,
  isEmpty,
  accounts,
}: Readonly<DeactivatedBankAccountsContentProps>) {
  if (showLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto">
        <Skeleton className="w-full h-20" variant="card" />
        <Skeleton className="w-full h-20" variant="card" />
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyBankAccountState variant={BankAccountStateVariant.NoDeactivated} />;
  }

  return (
    <>
      {accounts.map((bankAccount) => (
        <BankAccountCard key={bankAccount.id} bankAccount={bankAccount} />
      ))}
    </>
  );
}

type BankAccountsStatusProps = {
  isInitialLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onAddNew: () => void;
};

function BankAccountsStatus({ isInitialLoading, isError, isEmpty, onAddNew }: Readonly<BankAccountsStatusProps>) {
  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto">
        <Skeleton className="w-full h-20" variant="card" />
        <Skeleton className="w-full h-20" variant="card" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-[#FFE7D9] text-[#7A0C2E] flex flex-row items-start p-4 rounded-lg text-sm font-normal gap-3 w-full">
        <IcCircleError className="shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold font-lota text-sm leading-5">
            Ocurrió un error al cargar las cuentas bancarias
          </h3>
          <p className="font-normal font-lota text-sm leading-5">
            Comunícate con el equipo o inténtalo nuevamente recargando la página.
          </p>
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return <EmptyBankAccountState variant={BankAccountStateVariant.NoAccounts} onAddNew={onAddNew} />;
  }
  return null;
}

BankAccountsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Cuentas bancarias" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

BankAccountsPage.auth = true;
