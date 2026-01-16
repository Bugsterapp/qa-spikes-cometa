import { useBankAccountStore } from '../../stores/bankAccountStore';

/**
 * Hook that provides actions for managing bank account UI state
 * This hook encapsulates all bank account-related actions without state
 */
export function useBankAccountActions() {
  const {
    closeDrawer,
    setDrawerView,
    openDeleteDialog,
    openActivationDialog,
    closeDialog,
    setBankAccountAction,
    setPendingReassignmentData,
    handleEdit,
    handleView,
    handleDelete,
    handleAddNew,
    handleCloseDetails,
    setIsCreating,
    setIsDeleting,
    setIsReassigning,
    setIsArchiving,
  } = useBankAccountStore();

  return {
    // Drawer actions
    closeDrawer,
    setDrawerView,

    // Dialog actions
    openDeleteDialog,
    openActivationDialog,
    closeDialog,

    // State setters
    setBankAccountAction,
    setPendingReassignmentData,
    setIsCreating,
    setIsDeleting,
    setIsReassigning,
    setIsArchiving,

    // Complex operations
    handleEdit,
    handleView,
    handleDelete,
    handleAddNew,
    handleCloseDetails,
  };
}

/**
 * Combined hook that provides both state and actions
 * Use this when you need both in a component
 */
export function useBankAccount() {
  const {
    drawerView,
    bankAccountAction,
    selectedBankAccount,
    dialogState,
    pendingReassignmentData,
    isCreating,
    isDeleting,
    isReassigning,
    isArchiving,
  } = useBankAccountStore();

  const actions = useBankAccountActions();

  return {
    drawerView,
    bankAccountAction,
    selectedBankAccount,
    dialogState,
    pendingReassignmentData,
    isCreating,
    isDeleting,
    isReassigning,
    isArchiving,
    ...actions,
  };
}
