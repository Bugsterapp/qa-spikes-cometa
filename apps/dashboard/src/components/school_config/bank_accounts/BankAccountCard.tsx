import { OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { ReviewCard } from '../ReviewCard';
import { BankLogo } from './BankLogo';
import { getBankLabel } from '../../../utils/bank-helpers';
import { EntityType, getStatusTooltip } from '../../../utils/onboarding-status';
import { useBankAccount, type ExtendedBankAccountEntity } from '../../../hooks/bank_accounts';

type BankAccountCardProps = {
  bankAccount: ExtendedBankAccountEntity;
};

export function BankAccountCard({ bankAccount }: Readonly<BankAccountCardProps>) {
  const { handleView, handleEdit } = useBankAccount();
  const displayName = bankAccount.nickname ?? `Cuenta ${getBankLabel(bankAccount.bank_name)}`;

  const displayStatus: OnboardingStatus | 'archived' = bankAccount.isArchived ? 'archived' : bankAccount.status;

  return (
    <ReviewCard
      entity={bankAccount}
      title={displayName}
      subtitle={bankAccount.account_number}
      status={displayStatus}
      icon={<BankLogo bankName={bankAccount.bank_name} size={48} className="bg-center bg-cover bg-no-repeat" />}
      onView={handleView}
      onEdit={handleEdit}
      getStatusTooltip={(status) =>
        bankAccount.isArchived
          ? 'Esta cuenta ha sido desactivada temporalmente'
          : getStatusTooltip(status, EntityType.BankAccount)
      }
    />
  );
}
