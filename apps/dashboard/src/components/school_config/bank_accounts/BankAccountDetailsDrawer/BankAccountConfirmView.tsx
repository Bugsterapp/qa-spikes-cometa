import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Input } from '@cometa/recreo/v2/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSelectedSchoolId } from '../../../../guards/AuthGuard';
import { useBankAccount, useBankAccountActions } from '../../../../hooks/bank_accounts';
import { useBankAccountMutations } from '../../../../hooks/bank_accounts/useBankAccountMutations';
import { getBankLabel } from '../../../../utils/bank-helpers';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { BankLogo } from '../BankLogo';

export enum BankAccountConfirmAction {
  DELETE = 'delete',
  DEACTIVATE = 'deactivate',
}

type BankAccountConfirmViewProps = {
  confirmAction: BankAccountConfirmAction;
  onCancel: () => void;
  showStepNumber?: boolean;
};

const ACTION_CONFIG = {
  [BankAccountConfirmAction.DELETE]: {
    keyword: 'eliminar',
    title: 'Confirmar eliminación',
    titleWithStep: 'Paso 2/2:  Confirmar eliminación',
    headerText: 'Cuenta a eliminar:',
    description:
      "Para confirmar que deseas eliminar esta cuenta, escribe 'eliminar' en el campo de abajo. Esta acción eliminará permanentemente la cuenta seleccionada y no se puede deshacer.",
    placeholder: "Escribe 'eliminar' para confirmar",
    buttonText: 'Eliminar cuenta',
    buttonLoadingText: 'Eliminando...',
    buttonVariant: 'destructive' as const,
    loadingStateKey: 'isDeleting' as const,
    mutation: 'executeDeletion' as const,
  },
  [BankAccountConfirmAction.DEACTIVATE]: {
    keyword: 'desactivar',
    title: 'Confirmar desactivación',
    titleWithStep: 'Paso 2 de 2: Confirmar desactivación',
    headerText: 'Cuenta a desactivar:',
    description:
      "Para confirmar que deseas desactivar esta cuenta, escribe 'desactivar' en el campo de abajo. Recuerda que puedes reactivar esta cuenta en cualquier momento.",
    placeholder: "Escribe 'desactivar' para confirmar",
    buttonText: 'Desactivar cuenta',
    buttonLoadingText: 'Desactivando...',
    buttonVariant: 'neutral' as const,
    loadingStateKey: 'isArchiving' as const,
    mutation: 'executeDeactivation' as const,
  },
};

export function BankAccountConfirmView({
  confirmAction,
  onCancel,
  showStepNumber = false,
}: Readonly<BankAccountConfirmViewProps>) {
  const { selectedBankAccount, isDeleting, isArchiving } = useBankAccount();
  const { handleCloseDetails } = useBankAccountActions();
  const { executeDeletion, executeDeactivation } = useBankAccountMutations();
  const schoolId = useSelectedSchoolId() ?? '';
  const [confirmationText, setConfirmationText] = useState('');

  const bankAccount = selectedBankAccount;
  const config = ACTION_CONFIG[confirmAction];
  const isLoading = confirmAction === BankAccountConfirmAction.DELETE ? isDeleting : isArchiving;

  if (!bankAccount) return null;

  const displayName = bankAccount.nickname ?? `Cuenta ${getBankLabel(bankAccount.bank_name)}`;
  const isConfirmationValid = confirmationText.toLowerCase().trim() === config.keyword;

  const handleConfirm = async () => {
    if (!isConfirmationValid || !bankAccount || !schoolId) return;

    try {
      if (confirmAction === BankAccountConfirmAction.DELETE) {
        await executeDeletion(bankAccount.id, schoolId);
      } else {
        await executeDeactivation(bankAccount.id, schoolId);
      }
      handleCloseDetails();
    } catch {
      handleCloseDetails();
    }
  };

  const title = showStepNumber ? config.titleWithStep : config.title;

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title={title}
        onClose={handleCloseDetails}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />

      <div className="bg-[#f3ebff] px-8 py-3 flex items-center justify-between shrink-0">
        <p className="text-sm text-[#22283a]">{config.headerText}</p>
        <div className="bg-white border border-[#e6ebf5] rounded-lg px-3 py-3 flex items-center gap-2 w-[338px]">
          <BankLogo bankName={bankAccount.bank_name} size={24} />
          <p className="text-sm text-[#22283a] truncate overflow-hidden">{displayName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-4 max-w-[500px]">
          <p className="text-base text-[#697086] leading-6">{config.description}</p>
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder={config.placeholder}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="h-12"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#d0d8e9] px-8 py-4 flex justify-end gap-4 flex-shrink-0">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant={config.buttonVariant}
          onClick={handleConfirm}
          disabled={!isConfirmationValid || isLoading}
          className={isConfirmationValid ? '' : 'opacity-50'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {config.buttonLoadingText}
            </>
          ) : (
            config.buttonText
          )}
        </Button>
      </div>
    </div>
  );
}
