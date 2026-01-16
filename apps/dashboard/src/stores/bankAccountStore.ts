import { create } from 'zustand';
import { BotBankAccountEntity } from '@cometa/trpc/src/bot/types';

export type ExtendedBankAccountEntity = BotBankAccountEntity & { isArchived?: boolean };

export enum DrawerView {
  BankAccountForm = 'BANK_ACCOUNT_FORM',
  Details = 'DETAILS',
  History = 'HISTORY',
}

export enum BankAccountAction {
  None = 'NONE',
  Editing = 'EDITING',
  Viewing = 'VIEWING',
  Deleting = 'DELETING',
  Activation = 'ACTIVATION',
}

export enum DialogState {
  None = 'NONE',
  Delete = 'DELETE',
  Activation = 'ACTIVATION',
}

interface BankAccountState {
  // UI State
  drawerView: DrawerView | null;
  bankAccountAction: BankAccountAction;
  selectedBankAccount: ExtendedBankAccountEntity | null;
  dialogState: DialogState;
  pendingReassignmentData: Record<string, string> | null;

  // Mutation State
  isCreating: boolean;
  isDeleting: boolean;
  isReassigning: boolean;
  isArchiving: boolean;

  // Actions - Mutation State Setters
  setIsCreating: (value: boolean) => void;
  setIsDeleting: (value: boolean) => void;
  setIsReassigning: (value: boolean) => void;
  setIsArchiving: (value: boolean) => void;

  // Actions - Drawer Management
  closeDrawer: () => void;
  setDrawerView: (view: DrawerView | null) => void;

  // Actions - Dialog Management
  openDeleteDialog: (bankAccount: ExtendedBankAccountEntity) => void;
  openActivationDialog: (bankAccount: ExtendedBankAccountEntity) => void;
  closeDialog: () => void;

  // Actions - State Management
  setBankAccountAction: (action: BankAccountAction, account?: ExtendedBankAccountEntity | null) => void;
  setPendingReassignmentData: (data: Record<string, string> | null) => void;

  // Actions - Complex Operations
  handleEdit: (bankAccount: ExtendedBankAccountEntity) => void;
  handleView: (bankAccount: ExtendedBankAccountEntity) => void;
  handleDelete: (bankAccount: ExtendedBankAccountEntity) => void;
  handleAddNew: () => void;
  handleCloseDetails: () => void;
}

const initialState = {
  drawerView: null,
  bankAccountAction: BankAccountAction.None,
  selectedBankAccount: null,
  dialogState: DialogState.None,
  pendingReassignmentData: null,
  isCreating: false,
  isDeleting: false,
  isReassigning: false,
  isArchiving: false,
};

export const useBankAccountStore = create<BankAccountState>((set) => ({
  ...initialState,

  // Mutation State Setters
  setIsCreating: (value: boolean) => set({ isCreating: value }),
  setIsDeleting: (value: boolean) => set({ isDeleting: value }),
  setIsReassigning: (value: boolean) => set({ isReassigning: value }),
  setIsArchiving: (value: boolean) => set({ isArchiving: value }),

  // Drawer Management
  closeDrawer: () => {
    set({
      drawerView: null,
      selectedBankAccount: null,
      bankAccountAction: BankAccountAction.None,
    });
  },

  setDrawerView: (view) => {
    set({
      drawerView: view,
    });
  },

  // Dialog Management
  openDeleteDialog: (bankAccount) => {
    set({
      dialogState: DialogState.Delete,
      selectedBankAccount: bankAccount,
      bankAccountAction: BankAccountAction.Deleting,
    });
  },

  openActivationDialog: (bankAccount) => {
    set({
      dialogState: DialogState.Activation,
      selectedBankAccount: bankAccount,
      bankAccountAction: BankAccountAction.Activation,
    });
  },

  closeDialog: () => {
    set({
      dialogState: DialogState.None,
    });
  },

  // State Management
  setBankAccountAction: (action, account = null) => {
    set({
      bankAccountAction: action,
      selectedBankAccount: account,
    });
  },

  setPendingReassignmentData: (data) => {
    set({ pendingReassignmentData: data });
  },

  // Complex Operations
  handleEdit: (bankAccount) => {
    set({
      drawerView: DrawerView.BankAccountForm,
      selectedBankAccount: bankAccount,
      bankAccountAction: BankAccountAction.Editing,
    });
  },

  handleView: (bankAccount) => {
    set({
      drawerView: DrawerView.Details,
      selectedBankAccount: bankAccount,
      bankAccountAction: BankAccountAction.Viewing,
    });
  },

  handleDelete: (bankAccount) => {
    set({
      dialogState: DialogState.Delete,
      selectedBankAccount: bankAccount,
      bankAccountAction: BankAccountAction.Deleting,
    });
  },

  handleAddNew: () => {
    set({
      drawerView: DrawerView.BankAccountForm,
      selectedBankAccount: null,
      bankAccountAction: BankAccountAction.None,
    });
  },

  handleCloseDetails: () => {
    set({
      drawerView: null,
      selectedBankAccount: null,
      bankAccountAction: BankAccountAction.None,
      dialogState: DialogState.None,
      pendingReassignmentData: null,
    });
  },
}));
