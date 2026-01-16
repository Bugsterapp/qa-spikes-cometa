import { DocumentType, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { SlimBankAccount } from '@cometa/trpc/src/types';
import { keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from '../../utils/api';
import type { ExtendedBankAccountEntity } from './index';

export enum BankAccountTab {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
}

export function useBankAccounts(schoolId: string | undefined, activeTab: BankAccountTab, enabled: boolean) {
  const {
    data: activeBankAccounts,
    isPending: isLoadingActive,
    isError: isActiveBankAccountsError,
    isFetchingNextPage: isFetchingNextPageActive,
    hasNextPage: hasNextPageActive,
    fetchNextPage: fetchNextPageActive,
  } = api.bot.getBankAccounts.useInfiniteQuery(
    {
      schoolId: schoolId ?? '',
    },
    {
      enabled: !!schoolId && enabled && activeTab === BankAccountTab.ACTIVE,
      placeholderData: keepPreviousData,
      retry: false,
      getNextPageParam: (lastPage) => {
        if (lastPage?.next) {
          return (lastPage.page_number + 1).toString();
        }
        return undefined;
      },
    }
  );

  const { data: approvedBankAccountsData } = api.schools.bankAccountList.useQuery(
    {
      school_id: schoolId ?? '',
      archived: false,
    },
    {
      enabled: !!schoolId && enabled,
      retry: false,
    }
  );

  const {
    data: deactivatedBankAccountsData,
    isPending: isLoadingDeactivated,
    isError: isDeactivatedBankAccountsError,
  } = api.schools.bankAccountList.useQuery(
    {
      school_id: schoolId ?? '',
      archived: true,
    },
    {
      enabled: !!schoolId && enabled && activeTab === BankAccountTab.DEACTIVATED,
      placeholderData: keepPreviousData,
      retry: false,
    }
  );

  const activeAccounts = useMemo(
    () => activeBankAccounts?.pages.flatMap((page) => page?.results ?? []) ?? [],
    [activeBankAccounts]
  );

  const approvedAccounts = useMemo(() => {
    const results = approvedBankAccountsData?.results ?? [];
    return results.map((account) => slimToBotBankAccount(account, false));
  }, [approvedBankAccountsData]);

  const deactivatedAccounts = useMemo(() => {
    const results = deactivatedBankAccountsData?.results ?? [];
    return results.map((account) => slimToBotBankAccount(account, true));
  }, [deactivatedBankAccountsData]);

  const accounts = activeTab === BankAccountTab.ACTIVE ? activeAccounts : deactivatedAccounts;
  const isLoading = activeTab === BankAccountTab.ACTIVE ? isLoadingActive : isLoadingDeactivated;
  const isBankAccountsError =
    activeTab === BankAccountTab.ACTIVE ? isActiveBankAccountsError : isDeactivatedBankAccountsError;
  const isFetchingNextPage = activeTab === BankAccountTab.ACTIVE ? isFetchingNextPageActive : false;
  const hasNextPage = activeTab === BankAccountTab.ACTIVE ? hasNextPageActive : false;

  return {
    accounts,
    isLoading,
    isBankAccountsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageActive,
    approvedAccounts,
  };
}

function slimToBotBankAccount(slim: SlimBankAccount, isArchived = false): ExtendedBankAccountEntity {
  return {
    id: slim.id,
    school_id: '',
    owner: slim.owner,
    nickname: slim.nickname ?? '',
    bank_name: slim.bank_name,
    account_type: slim.account_type,
    account_number: slim.account_number,
    document_type: DocumentType.RFC,
    document_number: '',
    file_url: null,
    status: OnboardingStatus.Approved,
    reason: null,
    isArchived,
  };
}
