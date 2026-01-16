import { useMemo } from 'react';
import { api } from '~/utils/api';
import { useSelectedSchoolId } from '~/stores/globalStore';
import { Surface } from '@cometa/trpc/src/integrations/types';

const BLOCKED_ACTION_MESSAGE = 'Esta acción está bloqueada por la integración activa.';

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
  hasAnyBlockedFields: (fieldPaths: string[], action?: Action) => boolean;
  getIntegrationName: () => string | null;
};

export function useIntegrationsBlockedFields() {
  const schoolId = useSelectedSchoolId();

  const query = api.integrations.getBlockedFields.useQuery(
    {
      school_id: schoolId as string,
      surface: Surface.Portal,
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
      const isBlocked = actionBlockedFields.includes(fieldPath);

      return isBlocked;
    }

    function getTooltipMessage(fieldPath: string, action: Action = Action.Update, fallbackMessage = '') {
      if (isFieldBlocked(fieldPath, action)) {
        return BLOCKED_ACTION_MESSAGE;
      }
      return fallbackMessage;
    }

    function isActionBlocked(fieldPaths: string[], action: Action = Action.Update): boolean {
      return fieldPaths.some((fieldPath) => isFieldBlocked(fieldPath, action));
    }

    function getBlockedTooltip(isBlocked: boolean, blockedMessage = BLOCKED_ACTION_MESSAGE, fallbackMessage = '') {
      return isBlocked ? blockedMessage : fallbackMessage;
    }

    function hasAnyBlockedFields(fieldPaths: string[], action: Action = Action.Update): boolean {
      return fieldPaths.some((fieldPath) => isFieldBlocked(fieldPath, action));
    }

    function getIntegrationName(): string | null {
      if (error || !blockedFields?.data?.partner) {
        return null;
      }
      return blockedFields.data.partner;
    }

    return {
      isFieldBlocked,
      getTooltipMessage,
      isActionBlocked,
      getBlockedTooltip,
      hasAnyBlockedFields,
      getIntegrationName,
    };
  }, [query]);

  return {
    ...query,
    ...helpers,
  };
}
