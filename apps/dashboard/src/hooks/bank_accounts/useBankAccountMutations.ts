import { api } from '../../utils/api';
import useAlert from '../useAlert';
import { useBankAccount } from './useBankAccountActions';
import { BankAccountFormData } from '../../components/school_config/bank_accounts/BankAccountForm';
import { Currency, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { BankAccountAction } from '../../stores/bankAccountStore';
import { useRef } from 'react';

export function useBankAccountMutations() {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const {
    selectedBankAccount,
    closeDrawer,
    closeDialog,
    setIsCreating,
    setIsDeleting,
    setIsReassigning,
    setIsArchiving,
  } = useBankAccount();

  const pendingDeleteIdRef = useRef<string | null>(null);

  const deleteOnboardingBankAccountMutation = api.bot.deleteBankAccount.useMutation({
    onSuccess: () => {
      void Promise.all([utils.bot.getBankAccounts.invalidate(), utils.schools.bankAccountList.invalidate()]).then(
        () => {
          setIsCreating(false);
          setAlertState({
            open: true,
            severity: 'success',
            message: 'Cuenta bancaria eliminada correctamente',
          });
        }
      );
    },
    onError: (error) => {
      setIsCreating(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: handleErrorMessage(error.message ?? 'Error al eliminar la cuenta bancaria'),
      });
    },
  });

  const createBankAccountMutation = api.bot.createBankAccount.useMutation({
    onSuccess: () => {
      const bankAccountToDelete = pendingDeleteIdRef.current;

      if (bankAccountToDelete) {
        deleteOnboardingBankAccountMutation.mutate({ bankAccountId: bankAccountToDelete });
      } else {
        void Promise.all([utils.bot.getBankAccounts.invalidate(), utils.schools.bankAccountList.invalidate()]).then(
          () => {
            setIsCreating(false);
            setAlertState({
              open: true,
              severity: 'success',
              message: 'Cuenta bancaria creada correctamente',
            });
          }
        );
      }
    },
    onError: (error) => {
      setIsCreating(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: handleErrorMessage(error.message ?? 'Error al crear la cuenta bancaria'),
      });
    },
  });

  const bankAccountReassignMutation = api.schools.bankAccountReassign.useMutation();

  const bankAccountArchiveMutation = api.schools.bankAccountPartialUpdate.useMutation();

  const bankAccountDeleteMutation = api.schools.bankAccountDelete.useMutation();

  const createBankAccount = async (schoolId: string, formValues: BankAccountFormData) => {
    const bankAccount = {
      ...formValues,
      nickname: formValues.nickname ?? '',
      owner: formValues.owner ?? '',
      account_currency: Currency.MXN,
    };

    const isDeclinedBankAccount = selectedBankAccount && selectedBankAccount.status === OnboardingStatus.Declined;
    const bankAccountToDelete = isDeclinedBankAccount && selectedBankAccount ? selectedBankAccount.id : null;

    // Store the pending delete ID in the ref so the onSuccess callback can access it
    pendingDeleteIdRef.current = bankAccountToDelete;

    setIsCreating(true);
    closeDrawer();

    const formData = new FormData();
    formData.append('schoolId', schoolId);
    formData.append('owner', bankAccount.owner);
    formData.append('nickname', bankAccount.nickname);
    formData.append('bank_name', bankAccount.bank_name);
    formData.append('account_number', bankAccount.account_number);
    formData.append('account_currency', bankAccount.account_currency);
    formData.append('document_type', bankAccount.document_type);
    formData.append('document_number', bankAccount.document_number);

    if (bankAccount.file instanceof File) {
      formData.append('file', bankAccount.file);
    }

    createBankAccountMutation.mutate(formData);
  };

  const confirmDeactivation = async (
    bankAccountId: string,
    schoolId: string,
    reassignmentData: Record<string, string>,
    onArchiveError?: (error: string) => void
  ) => {
    setIsReassigning(true);
    closeDrawer();

    // Transform reassignment data into API format
    const reassignments = Array.from(
      new Map(
        Object.entries(reassignmentData).map(([, targetId]) => [
          targetId,
          Object.entries(reassignmentData)
            .filter(([, id]) => id === targetId)
            .map(([type]) => type),
        ])
      )
    ).map(([targetId, conceptTypes]) => ({
      target_bank_account_id: targetId,
      concept_types: conceptTypes,
    }));

    // Step 1: Reassign concepts
    bankAccountReassignMutation.mutate(
      {
        id: bankAccountId,
        school_id: schoolId,
        data: { reassignments },
      },
      {
        onSuccess: () => {
          // Invalidate concepts list after successful reassignment
          void utils.schools.schoolsConceptsList.invalidate();
          setIsReassigning(false);
          setIsArchiving(true);

          // Step 2: Archive the account
          bankAccountArchiveMutation.mutate(
            {
              id: bankAccountId,
              school_id: schoolId,
              data: { archived: true },
            },
            {
              onSuccess: () => {
                void Promise.all([
                  utils.bot.getBankAccounts.invalidate(),
                  utils.schools.bankAccountList.invalidate(),
                ]).then(() => {
                  setIsArchiving(false);
                  closeDialog();
                  setAlertState({
                    open: true,
                    severity: 'success',
                    message: 'Cuenta desactivada y conceptos reasignados correctamente',
                  });
                });
              },
              onError: () => {
                setIsArchiving(false);
                // Partial success scenario: reassignment succeeded but archive failed
                if (onArchiveError) {
                  onArchiveError(
                    'Los conceptos fueron reasignados exitosamente, pero no se pudo completar la desactivación de la cuenta.\n\n' +
                      'Los conceptos están seguros en sus nuevas cuentas.\n\n' +
                      'Puedes reintentar en cualquier momento.'
                  );
                }
              },
            }
          );
        },
        onError: (error) => {
          setIsReassigning(false);
          setAlertState({
            open: true,
            severity: 'error',
            message: handleErrorMessage(error.message ?? 'Error al desactivar la cuenta bancaria'),
          });
        },
      }
    );
  };

  const confirmActivation = async (
    bankAccountId: string,
    schoolId: string,
    isArchived: boolean,
    bankAccountAction: BankAccountAction
  ) => {
    setIsArchiving(true);
    closeDrawer();

    const shouldArchive = !isArchived; // If currently archived, we're reactivating (archived: false)

    bankAccountArchiveMutation.mutate(
      {
        id: bankAccountId,
        school_id: schoolId,
        data: { archived: shouldArchive },
      },
      {
        onSuccess: () => {
          void Promise.all([utils.bot.getBankAccounts.invalidate(), utils.schools.bankAccountList.invalidate()]).then(
            () => {
              setIsArchiving(false);

              let message: string;
              if (bankAccountAction === BankAccountAction.Activation) {
                message = shouldArchive ? 'Cuenta desactivada correctamente' : 'Cuenta reactivada correctamente';
              } else {
                message = shouldArchive ? 'Cuenta desactivada correctamente' : 'Cuenta actualizada correctamente';
              }

              setAlertState({
                open: true,
                severity: 'success',
                message,
              });
            }
          );
        },
        onError: (error) => {
          setIsArchiving(false);
          setAlertState({
            open: true,
            severity: 'error',
            message: handleErrorMessage(error.message ?? 'Error al actualizar la cuenta bancaria'),
          });
        },
      }
    );
  };

  const confirmOnboardingDelete = async (bankAccountId: string) => {
    setIsDeleting(true);
    closeDrawer();

    deleteOnboardingBankAccountMutation.mutate(
      { bankAccountId },
      {
        onSuccess: () => {
          void utils.bot.getBankAccounts.invalidate().then(() => {
            setIsDeleting(false);
            setAlertState({
              open: true,
              severity: 'success',
              message: 'Cuenta bancaria eliminada correctamente',
            });
          });
        },
        onError: (error) => {
          setIsDeleting(false);
          setAlertState({
            open: true,
            severity: 'error',
            message: handleErrorMessage(error.message ?? 'Error al eliminar la cuenta bancaria'),
          });
        },
      }
    );
  };

  const executeReassignment = async (
    bankAccountId: string,
    schoolId: string,
    reassignmentData: Record<string, string>
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      setIsReassigning(true);

      // Transform reassignment data into API format
      const reassignments = Array.from(
        new Map(
          Object.entries(reassignmentData).map(([, targetId]) => [
            targetId,
            Object.entries(reassignmentData)
              .filter(([, id]) => id === targetId)
              .map(([type]) => type),
          ])
        )
      ).map(([targetId, conceptTypes]) => ({
        target_bank_account_id: targetId,
        concept_types: conceptTypes,
      }));

      bankAccountReassignMutation.mutate(
        {
          id: bankAccountId,
          school_id: schoolId,
          data: { reassignments },
        },
        {
          onSuccess: () => {
            void utils.schools.schoolsConceptsList.invalidate().then(() => {
              setIsReassigning(false);
              setAlertState({
                open: true,
                severity: 'success',
                message: 'Conceptos reasignados exitosamente',
              });
              resolve();
            });
          },
          onError: (error) => {
            setIsReassigning(false);
            setAlertState({
              open: true,
              severity: 'error',
              message: handleErrorMessage(error.message ?? 'Error al reasignar conceptos'),
            });
            reject(error);
          },
        }
      );
    });

  const executeDeactivation = async (bankAccountId: string, schoolId: string): Promise<void> =>
    new Promise((resolve, reject) => {
      setIsArchiving(true);

      bankAccountArchiveMutation.mutate(
        {
          id: bankAccountId,
          school_id: schoolId,
          data: { archived: true },
        },
        {
          onSuccess: () => {
            void Promise.all([utils.bot.getBankAccounts.invalidate(), utils.schools.bankAccountList.invalidate()]).then(
              () => {
                setIsArchiving(false);
                setAlertState({
                  open: true,
                  severity: 'success',
                  message: 'Cuenta desactivada correctamente',
                });
                resolve();
              }
            );
          },
          onError: (error) => {
            setIsArchiving(false);
            setAlertState({
              open: true,
              severity: 'error',
              message: handleErrorMessage(error.message ?? 'Error al desactivar la cuenta bancaria'),
            });
            reject(error);
          },
        }
      );
    });

  const executeDeletion = async (bankAccountId: string, schoolId: string): Promise<void> =>
    new Promise((resolve, reject) => {
      setIsDeleting(true);

      bankAccountDeleteMutation.mutate(
        {
          id: bankAccountId,
          school_id: schoolId,
        },
        {
          onSuccess: () => {
            void Promise.all([utils.bot.getBankAccounts.invalidate(), utils.schools.bankAccountList.invalidate()]).then(
              () => {
                setIsDeleting(false);
                setAlertState({
                  open: true,
                  severity: 'success',
                  message: 'Cuenta eliminada correctamente',
                });
                resolve();
              }
            );
          },
          onError: (error) => {
            setIsDeleting(false);
            setAlertState({
              open: true,
              severity: 'error',
              message: handleErrorMessage(error.message ?? 'Error al eliminar la cuenta bancaria'),
            });
            reject(error);
          },
        }
      );
    });

  return {
    createBankAccount,
    confirmDeactivation,
    confirmActivation,
    confirmOnboardingDelete,
    executeReassignment,
    executeDeactivation,
    executeDeletion,
  };
}

function handleErrorMessage(message: string): string {
  let parsedMessage = message;
  try {
    const parsed = JSON.parse(message);
    if (parsed.error && Array.isArray(parsed.error)) {
      parsedMessage = parsed.error[0];
    } else if (typeof parsed.error === 'string') {
      parsedMessage = parsed.error;
    }
  } catch {
    // If parsing fails, use the original message
  }

  const errorTranslations: Record<string, string> = {
    'An error occurred': 'Ocurrió un error',
    'An unexpected error occurred': 'Ocurrió un error inesperado',
    'Cannot modify bank account: it has pending payouts':
      'No se puede desactivar esta cuenta porque tiene transacciones pendientes. Por favor, intenta nuevamente o contacta a soporte técnico.',
    'payout configuration': 'configuración de pagos',
    'Validation failed': 'Error de validación',
  };

  if (errorTranslations[parsedMessage]) {
    return errorTranslations[parsedMessage];
  }

  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (parsedMessage.toLowerCase().includes(key.toLowerCase())) {
      if (key === 'payout configuration') {
        return 'No se puede completar la reasignación. Algunos conceptos requieren configuraciones de pago en la cuenta de destino. Por favor, contacta a soporte técnico.';
      }
      if (key === 'Validation failed') {
        return 'Error de validación al reasignar conceptos. Verifica que la cuenta de destino esté correctamente configurada.';
      }
      return translation;
    }
  }

  return 'Ocurrió un error al procesar la solicitud. Por favor, intenta nuevamente o contacta a soporte técnico.';
}
