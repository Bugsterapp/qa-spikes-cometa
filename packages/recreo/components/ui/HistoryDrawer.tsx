import { useMemo, useState } from 'react';
import { Button } from '../../v2/components/ui/button';
import { HistoryChange, HistoryFieldChange, HistoryTypeEnum } from '@cometa/trpc/src/types';
import { getUserNameInitials, formatHistoryDate, formatHistoryTime } from '@cometa/utils';

type FieldChangeEntry = {
  field: string;
  old_value: unknown;
  new_value: unknown;
};

export type HistoryDrawerTexts = {
  setTo: string;
  created: string;
  deleted: string;
  entityName: string;
  formatCreatedMessage?: (changed_fields: Record<string, HistoryFieldChange>, entry?: HistoryChange) => string;
  formatDeletedMessage?: (changed_fields: Record<string, HistoryFieldChange>, entry?: HistoryChange) => string;
  loading: string;
  empty: string;
  viewMore: (count: number) => string;
  viewLess: string;
  loadMore: string;
  loadingMore: string;
};

export type HistoryDrawerConfig = {
  fieldNameMap?: Record<string, string>;
  formatValue?: (field: string, value: unknown) => string;
  jsonFieldsToExpand?: string[];
  texts?: Partial<HistoryDrawerTexts>;
  avatarColor?: string;
  collapseThreshold?: number;
  normalFontWeight?: boolean;
};

type FullHistoryDrawerConfig = {
  fieldNameMap: Record<string, string>;
  formatValue: (field: string, value: unknown) => string;
  jsonFieldsToExpand: string[];
  texts: HistoryDrawerTexts;
  avatarColor: string;
  collapseThreshold: number;
  normalFontWeight: boolean;
};

type HistoryDrawerContentProps = {
  data: HistoryChange[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  config?: HistoryDrawerConfig;
};

const defaultFormatValue = (_field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'No especificado';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  return String(value);
};

const defaultTexts = {
  setTo: 'establecido en',
  created: 'creado',
  deleted: 'eliminado',
  entityName: 'Registro',
  loading: 'Cargando historial...',
  empty: 'No hay cambios registrados',
  viewMore: (count: number) => `Ver ${count} cambio${count > 1 ? 's' : ''} más`,
  viewLess: 'Ver menos',
  loadMore: 'Cargar más',
  loadingMore: 'Cargando...',
};

const createExpandJSONChanges =
  (jsonFieldsToExpand: string[] = []) =>
  ([field, change]: [string, HistoryFieldChange]): FieldChangeEntry[] => {
    if (jsonFieldsToExpand.includes(field)) {
      const oldObj =
        typeof change.old === 'object' && change.old !== null ? (change.old as Record<string, unknown>) : {};
      const newObj =
        typeof change.new === 'object' && change.new !== null ? (change.new as Record<string, unknown>) : {};

      const changes: FieldChangeEntry[] = [];

      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

      allKeys.forEach((key) => {
        const oldVal = oldObj[key];
        const newVal = newObj[key];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            field: `${field}.${key}`,
            old_value: oldVal,
            new_value: newVal,
          });
        }
      });

      return changes.length > 0
        ? changes
        : [
            {
              field,
              old_value: change.old,
              new_value: change.new,
            },
          ];
    }

    return [
      {
        field,
        old_value: change.old,
        new_value: change.new,
      },
    ];
  };

const formatDate = (timestamp: string): string => formatHistoryDate(timestamp, true);
const formatTime = (timestamp: string): string => formatHistoryTime(timestamp);

const HistoryItem = ({ entry, config }: { entry: HistoryChange; config: FullHistoryDrawerConfig }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandJSONChanges = useMemo(
    () => createExpandJSONChanges(config.jsonFieldsToExpand),
    [config.jsonFieldsToExpand]
  );

  const expandedChanges = useMemo(
    () => Object.entries(entry.changed_fields || {}).flatMap((fieldChange) => expandJSONChanges(fieldChange)),
    [entry.changed_fields, expandJSONChanges]
  );

  const userName = entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Usuario desconocido';
  const initials = entry.user ? getUserNameInitials(entry.user.first_name, entry.user.last_name) : 'UD';

  const shouldCollapse = expandedChanges.length > config.collapseThreshold;
  const visibleChanges =
    shouldCollapse && !isExpanded ? expandedChanges.slice(0, config.collapseThreshold) : expandedChanges;
  const remainingCount = expandedChanges.length - config.collapseThreshold;

  return (
    <div className="bg-[#f8f9fb] rounded-lg p-4 border border-[#e6ebf5]">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: config.avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#22283a] text-sm">{userName}</span>
            <span className="text-[#919EAB] text-xs">{formatTime(entry.timestamp)}</span>
          </div>
          <div className="flex flex-col gap-1">
            {entry.history_type === HistoryTypeEnum.Created ? (
              <div className="text-sm text-[#697086] flex items-start gap-2">
                <span className="text-[#22283a] mt-0.5">•</span>
                <div>
                  <span className={config.normalFontWeight ? 'text-[#22283a]' : 'font-semibold text-[#22283a]'}>
                    {config.texts.formatCreatedMessage
                      ? config.texts.formatCreatedMessage(entry.changed_fields, entry)
                      : `${config.texts.entityName} ${config.texts.created}`}
                  </span>
                </div>
              </div>
            ) : entry.history_type === HistoryTypeEnum.Deleted ? (
              <div className="text-sm text-[#697086] flex items-start gap-2">
                <span className="text-[#22283a] mt-0.5">•</span>
                <div>
                  <span className={config.normalFontWeight ? 'text-[#22283a]' : 'font-semibold text-[#22283a]'}>
                    {config.texts.formatDeletedMessage
                      ? config.texts.formatDeletedMessage(entry.changed_fields, entry)
                      : `${config.texts.entityName} ${config.texts.deleted}`}
                  </span>
                </div>
              </div>
            ) : (
              <>
                {visibleChanges.map((change, idx) => (
                  <div key={idx} className="text-sm text-[#697086] flex items-start gap-2">
                    <span className="text-[#22283a] mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-[#22283a]">
                        {config.fieldNameMap[change.field] || change.field}
                      </span>{' '}
                      {config.texts.setTo}{' '}
                      <span className="font-semibold text-[#22283a]">
                        {config.formatValue(change.field, change.new_value)}
                      </span>
                    </div>
                  </div>
                ))}
                {shouldCollapse && (
                  <Button
                    variant="link"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm font-semibold mt-1 self-start px-0"
                  >
                    {isExpanded ? config.texts.viewLess : config.texts.viewMore(remainingCount)}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function HistoryDrawerContent({ data, isLoading, hasMore, onLoadMore, config = {} }: HistoryDrawerContentProps) {
  const fullConfig: FullHistoryDrawerConfig = useMemo(
    () => ({
      fieldNameMap: config.fieldNameMap || {},
      formatValue: config.formatValue || defaultFormatValue,
      jsonFieldsToExpand: config.jsonFieldsToExpand || [],
      texts: { ...defaultTexts, ...config.texts },
      avatarColor: config.avatarColor || '#22283a',
      collapseThreshold: config.collapseThreshold || 2,
      normalFontWeight: config.normalFontWeight || false,
    }),
    [config]
  );

  const groupedEntries = useMemo(() => {
    const groups: Record<string, HistoryChange[]> = {};

    data.forEach((entry) => {
      const date = new Date(entry.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [data]);

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-[#697086]">{fullConfig.texts.loading}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-[#697086]">{fullConfig.texts.empty}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groupedEntries.map(([date, entries]) => (
        <div key={date} className="flex flex-col gap-4">
          <div className="text-xs font-semibold text-[#697086] tracking-wide">{formatDate(entries[0].timestamp)}</div>
          {entries.map((entry, entryIdx) => (
            <HistoryItem key={`${date}-${entryIdx}`} entry={entry} config={fullConfig} />
          ))}
        </div>
      ))}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button onClick={onLoadMore} variant="outline" size="default" disabled={isLoading}>
            {isLoading ? fullConfig.texts.loadingMore : fullConfig.texts.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
