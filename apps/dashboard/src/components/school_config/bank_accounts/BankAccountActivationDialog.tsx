import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';
import { Loader2 } from 'lucide-react';
import { useBankAccount, BankAccountAction, DialogState } from '../../../hooks/bank_accounts';
import { useBankAccountMutations } from '../../../hooks/bank_accounts/useBankAccountMutations';
import { useSelectedSchool } from '../../../guards/AuthGuard';

export function BankAccountActivationDialog() {
  const selectedSchool = useSelectedSchool();
  const { bankAccountAction, selectedBankAccount, dialogState, isArchiving, closeDrawer, closeDialog, handleView } =
    useBankAccount();
  const { confirmActivation } = useBankAccountMutations();

  const isMutating = isArchiving;

  const bankAccount = bankAccountAction === BankAccountAction.Activation ? selectedBankAccount : null;
  const open = dialogState === DialogState.Activation;

  if (!bankAccount || !selectedBankAccount?.isArchived) return null;

  const handleConfirm = () => {
    if (!selectedBankAccount || !selectedSchool?.id) {
      return;
    }

    closeDrawer();
    closeDialog();

    confirmActivation(
      selectedBankAccount.id,
      selectedSchool.id,
      selectedBankAccount.isArchived ?? false,
      bankAccountAction
    );
  };

  const handleClose = () => {
    closeDialog();
    if (selectedBankAccount) {
      handleView(selectedBankAccount);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Title>Reactivar cuenta</Dialog.Title>
      <div className="flex flex-col gap-6 max-w-[calc(433px_-_(48px_*_2))] mx-auto">
        <p className="text-sm text-[#697086] font-lota leading-5">
          Esta acción reactivará la cuenta seleccionada. La cuenta volverá a estar disponible para ser utilizada en
          transacciones.
        </p>

        <div className="flex justify-between gap-2">
          <Dialog.Close asChild>
            <Button className="w-full" variant="light" disabled={isMutating} onClick={handleClose}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button className="w-full" onClick={handleConfirm} disabled={isMutating}>
            {isMutating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reactivando...
              </>
            ) : (
              'Reactivar cuenta'
            )}
          </Button>
        </div>
      </div>
    </Dialog.Root>
  );
}
