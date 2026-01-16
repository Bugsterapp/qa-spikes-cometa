import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@cometa/recreo/v2/components/ui/alert-dialog';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2/components/ui/select';
import type { BaseConcept } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { Loader2 } from 'lucide-react';
import IcChevronRight from 'public/assets/icons/ic_chevron_right.svg';
import { useEffect, useMemo, useState } from 'react';
import { useSelectedSchoolId } from '../../../../guards/AuthGuard';
import {
  BankAccountTab,
  useBankAccount,
  useBankAccountActions,
  useBankAccounts,
  type ExtendedBankAccountEntity,
} from '../../../../hooks/bank_accounts';
import { useBankAccountMutations } from '../../../../hooks/bank_accounts/useBankAccountMutations';
import { getBankLabel } from '../../../../utils/bank-helpers';
import { getConceptTypeLabel } from '../../../../utils/concept-helpers';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { BankLogo } from '../BankLogo';
import { ConceptCategoryItem, type ConceptCategory } from './ConceptCategoryItem';

enum ReassignmentMode {
  Masive = 'masive',
  ByCategory = 'by_category',
}

type BankAccountReassignViewProps = {
  conceptsData: BaseConcept[];
  onCancel: () => void;
  onSuccess: () => void;
};

export function BankAccountReassignView({ conceptsData, onCancel, onSuccess }: Readonly<BankAccountReassignViewProps>) {
  const { selectedBankAccount, isReassigning } = useBankAccount();
  const [mode, setMode] = useState<ReassignmentMode>(ReassignmentMode.Masive);
  const [selectedMasivaAccount, setSelectedMasivaAccount] = useState<string | null>(null);
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const schoolId = useSelectedSchoolId() ?? '';

  const bankAccount = selectedBankAccount;
  const { approvedAccounts } = useBankAccounts(schoolId, BankAccountTab.ACTIVE, true);
  const { handleCloseDetails } = useBankAccountActions();
  const { executeReassignment } = useBankAccountMutations();

  const conceptCategories: ConceptCategory[] = useMemo(() => {
    if (!conceptsData) return [];

    const categoryMap = new Map<string, { concepts: Array<{ id: string; name: string }>; count: number }>();

    conceptsData.forEach((concept) => {
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
  }, [conceptsData]);

  const otherAccounts = approvedAccounts.filter((acc) => acc.id !== bankAccount?.id);

  const hasMultipleCategories = conceptCategories.length > 1;
  const hasSingleCategory = conceptCategories.length === 1;
  const hasOnlyOneAccount = otherAccounts.length === 1;
  const shouldShowSimpleView = hasSingleCategory || hasOnlyOneAccount;

  // Auto-select the only account when there's only one available
  useEffect(() => {
    if (hasOnlyOneAccount && !selectedMasivaAccount && otherAccounts.length > 0) {
      setSelectedMasivaAccount(otherAccounts[0].id);
    }
  }, [hasOnlyOneAccount, selectedMasivaAccount, otherAccounts]);

  if (!bankAccount) return null;

  const displayName = bankAccount.nickname ?? `Cuenta ${getBankLabel(bankAccount.bank_name)}`;

  const handleCategoryAssignment = (categoryId: string, targetAccountId: string) => {
    setCategoryAssignments((prev) => ({
      ...prev,
      [categoryId]: targetAccountId,
    }));
  };

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

  const handleMigrateClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmReassignment = async () => {
    if (!bankAccount || !schoolId) return;

    setIsConfirmDialogOpen(false);

    let reassignmentData: Record<string, string> = {};

    if ((shouldShowSimpleView || mode === ReassignmentMode.Masive) && selectedMasivaAccount) {
      conceptCategories.forEach((category) => {
        reassignmentData[category.id] = selectedMasivaAccount;
      });
    } else if (mode === ReassignmentMode.ByCategory) {
      reassignmentData = categoryAssignments;
    }

    try {
      await executeReassignment(bankAccount.id, schoolId, reassignmentData);
      onSuccess();
    } catch {
      // Error is handled by the mutation, stay on current screen
    }
  };

  const isConfirmDisabled = shouldShowSimpleView
    ? !selectedMasivaAccount
    : (mode === ReassignmentMode.Masive && !selectedMasivaAccount) ||
      (mode === ReassignmentMode.ByCategory && Object.keys(categoryAssignments).length < conceptCategories.length);

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Paso 1 de 2: Migrar conceptos a cuenta de reemplazo"
        onClose={handleCloseDetails}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />

      <div className="bg-[#f3ebff] px-8 py-3 rounded-lg flex items-center justify-between shrink-0">
        <p className="text-sm text-[#22283a]">Cuenta a desactivar:</p>
        <div className="bg-white border border-[#d0d8e9] rounded-lg px-3 py-3 flex items-center gap-2 w-[338px]">
          <BankLogo bankName={bankAccount.bank_name} size={24} />
          <p className="text-sm text-[#22283a] truncate overflow-hidden">{displayName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="flex flex-col gap-6">
          {!shouldShowSimpleView && hasMultipleCategories && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#eceff6] rounded-full p-1 flex h-[36px]">
                <button
                  type="button"
                  className={`flex-1 px-2 py-1 text-sm font-semibold rounded-full transition-all ${
                    mode === ReassignmentMode.Masive
                      ? 'bg-[#22283a] text-white shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]'
                      : 'bg-transparent text-[#22283a] hover:bg-[#d0d8e9]'
                  }`}
                  onClick={() => setMode(ReassignmentMode.Masive)}
                >
                  Migración masiva
                </button>
                <button
                  type="button"
                  className={`flex-1 px-2 py-1 text-sm font-semibold rounded-full transition-all ${
                    mode === ReassignmentMode.ByCategory
                      ? 'bg-[#22283a] text-white shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]'
                      : 'bg-transparent text-[#22283a] hover:bg-[#d0d8e9]'
                  }`}
                  onClick={() => setMode(ReassignmentMode.ByCategory)}
                >
                  Migración por categoria
                </button>
              </div>

              <p className="text-base text-[#697086] leading-6">
                {mode === ReassignmentMode.Masive
                  ? 'Migra todos los conceptos seleccionados a una sola cuenta. Útil si deseas centralizar todos los pagos en una sola cuenta.'
                  : 'Asigna cuentas diferentes a cada tipo de concepto, permitiéndote tener más control sobre qué se paga en cada cuenta.'}
              </p>
            </div>
          )}

          {(shouldShowSimpleView || mode === ReassignmentMode.Masive) && (
            <>
              {/* Scenario 1: Only one account available - show it without radio buttons */}
              {hasOnlyOneAccount ? (
                <div className="flex flex-col gap-4">
                  <p className="text-base text-[#697086] leading-6">
                    Los conceptos se migrarán a la única cuenta que tienes disponible:
                  </p>
                  <div className="border border-[#d0d8e9] rounded-lg p-3 flex items-center gap-3">
                    <div
                      className="rounded-full border border-[#d0d8e9] flex items-center justify-center overflow-hidden shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    >
                      <BankLogo bankName={otherAccounts[0]?.bank_name} size={48} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-[#22283a] truncate">
                        {otherAccounts[0]?.nickname || `Cuenta ${getBankLabel(otherAccounts[0]?.bank_name)}`}
                      </p>
                      <p className="text-sm text-[#697086] truncate">{otherAccounts[0]?.account_number}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Scenario 2: Single category - show multiple accounts with radio buttons */
                <div className="flex flex-col gap-4">
                  {shouldShowSimpleView && (
                    <p className="text-base text-[#697086] leading-6">
                      Migra todos los conceptos seleccionados a una sola cuenta.
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    {otherAccounts.map((account) => (
                      <AccountSelectionButton
                        key={account.id}
                        account={account}
                        isSelected={selectedMasivaAccount === account.id}
                        onSelect={setSelectedMasivaAccount}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Concepts section */}
              <div className="flex flex-col gap-4">
                <p className="text-base text-[#697086]">Estos son todos los conceptos que migrarán a la nueva cuenta</p>
                <div className="flex flex-col gap-3">
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
                </div>
              </div>
            </>
          )}

          {!shouldShowSimpleView && hasMultipleCategories && mode === ReassignmentMode.ByCategory && (
            <div className="flex flex-col gap-3">
              {conceptCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const selectedAccountId = categoryAssignments[category.id];
                const hasSelection = !!selectedAccountId;

                return (
                  <div key={category.id} className="border border-[#d0d8e9] rounded-lg">
                    <div className="h-[52px] flex items-center justify-between gap-4 px-4 py-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 flex-shrink-0"
                        onClick={() => toggleCategoryExpansion(category.id)}
                      >
                        <IcChevronRight
                          className={`w-4 h-4 text-[#697086] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <div className="flex items-center gap-1 text-sm text-[#22283a] whitespace-nowrap">
                          <span>{category.name}</span>
                          <span className="text-[#697086]">({category.count})</span>
                        </div>
                      </button>
                      <Select
                        value={selectedAccountId || ''}
                        onValueChange={(value) => handleCategoryAssignment(category.id, value)}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-[225px] h-9 rounded-full px-4 py-2 text-sm flex-shrink-0',
                            hasSelection
                              ? 'bg-[#f3ebff] border-[#873aff] shadow-[0_0_0_1px_#873aff] hover:shadow-[0_0_0_1px_#873aff] data-[state=open]:border-[#873aff]'
                              : 'shadow-[0_0_0_1px_hsl(var(--border))]'
                          )}
                        >
                          <SelectValue placeholder="Selecciona una cuenta" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {otherAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.nickname || `Cuenta ${getBankLabel(account.bank_name)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isExpanded && category.concepts && category.concepts.length > 0 && (
                      <div className="border-t border-[#d0d8e9] px-3 py-3">
                        <ul className="list-disc list-inside text-sm text-[#697086] space-y-1">
                          {category.concepts.map((concept) => (
                            <li key={concept.id}>{concept.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#d0d8e9] px-8 py-4 flex justify-end gap-4 flex-shrink-0">
        <Button variant="outline" onClick={onCancel} disabled={isReassigning}>
          Cancelar
        </Button>
        <Button variant="neutral" onClick={handleMigrateClick} disabled={isConfirmDisabled || isReassigning}>
          {isReassigning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Migrando...
            </>
          ) : (
            'Migrar'
          )}
        </Button>
      </div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar migración de conceptos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción migrará todos los conceptos seleccionados a la nueva cuenta. Esta operación no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className="w-full"
              variant="light"
              disabled={isReassigning}
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="w-full" variant="neutral" onClick={handleConfirmReassignment} disabled={isReassigning}>
              {isReassigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Migrando...
                </>
              ) : (
                'Confirmar migración'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type AccountSelectionButtonProps = {
  account: ExtendedBankAccountEntity;
  isSelected: boolean;
  onSelect: (accountId: string) => void;
};

function AccountSelectionButton({ account, isSelected, onSelect }: Readonly<AccountSelectionButtonProps>) {
  const logoSize = 48;
  const textSize = 'text-base';
  const subtextSize = 'text-sm';

  return (
    <button
      type="button"
      className={`rounded-lg p-3 flex items-center gap-3 transition-all ${
        isSelected ? 'border-2 border-[#873aff]' : 'border border-[#d0d8e9] hover:border-[#697086]'
      }`}
      style={
        isSelected
          ? {
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgb(135, 58, 255) 0%, rgb(135, 58, 255) 100%)',
            }
          : undefined
      }
      onClick={() => onSelect(account.id)}
    >
      <div className="w-4 h-4 rounded-full border flex items-center justify-center border-[#d0d8e9]">
        {isSelected && <div className="w-2 h-2 rounded-full bg-[#873aff]" />}
      </div>
      <div
        className="rounded-full border border-[#d0d8e9] flex items-center justify-center overflow-hidden"
        style={{
          width: logoSize,
          height: logoSize,
        }}
      >
        <BankLogo bankName={account.bank_name} size={logoSize} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`${textSize} font-semibold text-[#22283a] truncate`}>
          {account.nickname || `Cuenta ${getBankLabel(account.bank_name)}`}
        </p>
        <p className={`${subtextSize} text-[#697086] truncate`}>{account.account_number}</p>
      </div>
    </button>
  );
}
