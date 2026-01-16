import { useMemo } from 'react';
import { api } from '../utils/api';
import { useSelectedSchool } from '../guards/AuthGuard';
import { Surface } from '@cometa/trpc/src/integrations/types';

export enum Action {
  Update = 'update',
  Delete = 'delete',
  View = 'view',
}

type BlockedFieldsHelpers = {
  isFieldBlocked: (fieldPath: string, action?: Action) => boolean;
  getTooltipMessage: (fieldPath: string, action?: Action, fallbackMessage?: string) => string;
  isActionBlocked: (fieldPaths: string[], action?: Action) => boolean;
  getBlockedTooltip: (isBlocked: boolean, blockedMessage?: string, fallbackMessage?: string) => string;
};

const DEFAULT_BLOCKED_MESSAGE = 'Esta acción está bloqueada por la integración activa.';

export function useIntegrationsBlockedFields() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id;

  const query = api.integrations.getBlockedFields.useQuery(
    {
      school_id: schoolId as string,
      surface: Surface.Dashboard,
    },
    {
      enabled: !!schoolId,
    }
  );

  const helpers: BlockedFieldsHelpers = useMemo(() => {
    const { data: blockedFields, error } = query;

    function isFieldBlocked(fieldPath: string, action: Action = Action.Update): boolean {
      if (error || !blockedFields?.data?.blocked_fields) {
        return false;
      }

      const actionBlockedFields = blockedFields.data.blocked_fields[action] || [];
      return actionBlockedFields.includes(fieldPath);
    }

    function getTooltipMessage(fieldPath: string, action: Action = Action.Update, fallbackMessage = '') {
      if (isFieldBlocked(fieldPath, action)) {
        return DEFAULT_BLOCKED_MESSAGE;
      }
      return fallbackMessage;
    }

    function isActionBlocked(fieldPaths: string[], action: Action = Action.Update): boolean {
      return fieldPaths.some((fieldPath) => isFieldBlocked(fieldPath, action));
    }

    function getBlockedTooltip(isBlocked: boolean, blockedMessage = DEFAULT_BLOCKED_MESSAGE, fallbackMessage = '') {
      return isBlocked ? blockedMessage : fallbackMessage;
    }

    return {
      isFieldBlocked,
      getTooltipMessage,
      isActionBlocked,
      getBlockedTooltip,
    };
  }, [query]);

  return {
    ...query,
    ...helpers,
  };
}
