import { useMemo } from 'react';
import { HistoryDrawerContent, type HistoryDrawerConfig } from '@cometa/recreo';
import { HistoryTypeEnum, type BankAccountHistory, type HistoryChange, type HistoryUser } from '@cometa/trpc/src/types';
import { DrawerView, useBankAccount } from '../../../hooks/bank_accounts';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import { api } from '../../../utils/api';
import { keepPreviousData } from '@tanstack/react-query';

const HISTORY_PAGE_SIZE = 20;

type HistoryUserInput =
  | BankAccountHistory['history_user']
  | {
      id?: unknown;
      first_name?: string | null;
      last_name?: string | null;
    }
  | null
  | undefined;

type ChangeReasonPattern = { test: RegExp; label: string | ((match: RegExpExecArray) => string) };

export function BankAccountHistoryDrawer() {
  const { drawerView, closeDrawer } = useBankAccount();
  const isHistoryOpen = drawerView === DrawerView.History;
  const selectedSchool = useSelectedSchool();
  const {
    data: historyResponse,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError: isHistoryError,
    error: historyError,
  } = api.schools.bankAccountsHistoryList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id ?? '',
      page_size: HISTORY_PAGE_SIZE,
      ordering: ['-id'],
    },
    {
      enabled: !!selectedSchool?.id && isHistoryOpen,
      initialCursor: 1,
      placeholderData: keepPreviousData,
      getNextPageParam: (lastPage, pages) => (lastPage?.next ? pages.length + 1 : undefined),
    }
  );

  const mappedHistory: HistoryChange[] = useMemo(() => {
    const pages = historyResponse?.pages ?? [];
    const seen = new Set<string>();
    const entries: HistoryChange[] = [];

    pages.forEach((page) => {
      (page?.results ?? []).forEach((entry) => {
        const change = buildHistoryChange(entry);
        if (!seen.has(change.id)) {
          seen.add(change.id);
          entries.push(change);
        }
      });
    });

    return entries;
  }, [historyResponse]);

  const hasMoreHistoryPages = Boolean(hasNextPage);
  const isHistoryLoading = isLoading || isFetchingNextPage || isFetching;

  const historyConfig: HistoryDrawerConfig = {
    formatValue: formatBankAccountHistoryValue,
    texts: {
      entityName: 'Cuenta bancaria',
      loading: 'Cargando historial...',
      empty: 'No hay cambios registrados',
      loadMore: 'Cargar más',
      loadingMore: 'Cargando...',
    },
    normalFontWeight: true,
  };

  return (
    <>
      <SidebarHeader
        title="Historial de cambios"
        onClose={() => {
          closeDrawer();
        }}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isHistoryError ? (
          <div className="bg-[#FFE7D9] text-[#7A0C2E] flex flex-col gap-1 p-4 rounded-lg text-sm font-normal">
            <h3 className="font-semibold text-[#7A0C2E]">Ocurrió un error al cargar el historial</h3>
            <p>{historyError instanceof Error ? historyError.message : 'Inténtalo nuevamente recargando la página.'}</p>
          </div>
        ) : (
          <HistoryDrawerContent
            data={mappedHistory}
            isLoading={isHistoryLoading}
            hasMore={hasMoreHistoryPages}
            onLoadMore={() => fetchNextPage()}
            config={historyConfig}
          />
        )}
      </div>
    </>
  );
}

function buildHistoryChange(entry: BankAccountHistory): HistoryChange {
  const type = resolveHistoryType(entry.history_type);
  const parsedUser = parseHistoryUser(entry.history_user);
  const accountLabel = getAccountLabel(entry);
  const actionKey = `${accountLabel} - Acción`;

  const changedFields = {
    [actionKey]: toHistoryFieldChange(entry.history_change_reason || 'Actualización de cuenta'),
  } as Record<string, ReturnType<typeof toHistoryFieldChange>>;

  return {
    id: String(entry.history_id),
    timestamp: entry.history_date,
    changed_fields: changedFields,
    model_name: 'bank_account',
    object_id: entry.bank_account_id,
    history_type: type,
    user: parsedUser,
  };
}

function formatBankAccountHistoryValue(field: string, value: unknown): string {
  const resolved = formatPrimitive(value);
  if (!resolved) return 'No especificado';

  const lowerField = field.toLowerCase();

  if (lowerField.includes('estado') || lowerField === 'status') {
    return formatStatusValue(resolved);
  }

  if (lowerField.includes('acción') || lowerField === 'change_reason') {
    return formatChangeReason(resolved);
  }

  if (lowerField === 'bank_name') {
    return formatBankNameValue(resolved);
  }

  if (lowerField === 'account_number') {
    return formatAccountNumberValue(resolved);
  }

  return resolved;
}

function formatStatusValue(value: string): string {
  const lowerStatus = value.toLowerCase();
  if (lowerStatus === 'archived' || lowerStatus === 'deactivated') return 'Desactivada';
  if (lowerStatus === 'active' || lowerStatus === 'approved') return 'Activa';
  return humanizeText(value) || 'No especificado';
}

function formatBankNameValue(value: string): string {
  return value.toUpperCase();
}

function formatAccountNumberValue(value: string): string {
  const digits = value.replaceAll(/\s+/g, '');
  return digits.replaceAll(/(\d{4})(?=\d)/g, '$1 ');
}

const CHANGE_REASON_PATTERNS: ChangeReasonPattern[] = [
  {
    test: /reassigned\s+(\d+)\s+concepts\s+from\s+another\s+bank\s+account/i,
    label: (match) => `Reasignados ${match[1]} conceptos desde otra cuenta bancaria`,
  },
  { test: /bank\s+account\s+reactivated/i, label: 'Cuenta bancaria reactivada' },
  { test: /bank\s+account\s+deleted/i, label: 'Cuenta bancaria eliminada' },
  { test: /bank\s+account\s+deactivated/i, label: 'Cuenta bancaria desactivada' },
  { test: /reassigned/i, label: (match) => humanizeText(match[0]).replace(/^Reassigned/, 'Reasignado') },
  { test: /created/i, label: 'Cuenta creada' },
];

function formatChangeReason(reason: string): string {
  const trimmed = reason.trim();
  for (const { test, label } of CHANGE_REASON_PATTERNS) {
    const match = test.exec(trimmed);
    if (match) return typeof label === 'function' ? label(match) : label;
  }
  return humanizeText(trimmed);
}

function humanizeText(text: string): string {
  const cleaned = text.replaceAll('_', ' ').trim();
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function toHistoryFieldChange(newValue: unknown, oldValue?: unknown) {
  return {
    old: wrapHistoryValue(oldValue),
    new: wrapHistoryValue(newValue),
  };
}

function getAccountLabel(entry: BankAccountHistory): string {
  const nickname = (entry.nickname || '').trim();
  const last4 = entry.account_number ? entry.account_number.slice(-4) : '';
  const bank = entry.bank_name || 'Cuenta';

  if (nickname) return nickname;
  if (bank && last4) return `${bank} • •••• ${last4}`;
  if (bank) return bank;
  return 'Cuenta';
}

function parseHistoryUser(rawUser: HistoryUserInput): HistoryUser {
  if (!rawUser) {
    return { id: 'unknown-user', first_name: 'Usuario', last_name: 'desconocido' };
  }

  if (typeof rawUser === 'string') {
    const cleaned = rawUser.trim();
    const displayName = cleaned || 'Usuario desconocido';
    return buildSimpleUser(displayName, cleaned || 'unknown-user');
  }

  const id = rawUser.id == null ? '' : String(rawUser.id).trim();
  const firstName = (rawUser.first_name || '').trim();
  const lastName = (rawUser.last_name || '').trim();
  const fullName = `${firstName} ${lastName}`.trim() || 'Usuario desconocido';
  const safeId = id || fullName || 'unknown-user';
  return buildSimpleUser(fullName, safeId);
}

function buildSimpleUser(fullName: string, fallbackId: string): HistoryUser {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const first_name = parts[0] || 'Usuario';
  const last_name = parts.slice(1).join(' ') || 'desconocido';

  return {
    id: fallbackId || `${first_name}-${last_name}`,
    first_name,
    last_name,
  };
}

function wrapHistoryValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return { value: value ?? null };
}

function resolveHistoryType(rawType?: string | null): HistoryTypeEnum {
  const type = (rawType || '').toLowerCase();
  if (type.includes('delete')) return HistoryTypeEnum.Deleted;
  if (type.includes('create')) return HistoryTypeEnum.Created;
  return HistoryTypeEnum.Changed;
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) {
    const parts = value.map(formatPrimitive).filter(Boolean);
    return parts.join(', ');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 1 && keys[0] === 'value') {
      return formatPrimitive(record.value);
    }
    try {
      const json = JSON.stringify(value);
      return json === '{}' || json === '[]' ? '' : json;
    } catch {
      return '';
    }
  }
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  return '';
}
