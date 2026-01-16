import { useRef, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

interface TableConfigHookOptions {
  tableName?: string;
}

interface TableConfigHookResult<T extends Record<string, any>> {
  shouldUseApi: boolean;
  userId: string | undefined;
  schoolId: string | undefined;
  tableConfig: any;
  isLoading: boolean;
  initializedRef: React.MutableRefObject<boolean>;
  previousSchoolIdRef: React.MutableRefObject<string | null>;
  upsertConfig: (filtersConfig: T) => void;
  processTableConfig: <R>(processor: (config: any) => R | null) => R | null;
}

export function useTableConfig<T extends Record<string, any> = Record<string, any>>({
  tableName,
}: TableConfigHookOptions): TableConfigHookResult<T> {
  const initializedRef = useRef(false);
  const previousSchoolIdRef = useRef<string | null>(null);

  const session = useSession();
  const userId = session.data?.user.id;

  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id;

  const shouldUseApi = useMemo(() => !!userId && !!tableName && !!schoolId, [userId, tableName, schoolId]);

  const tableConfigQuery = api.students.getTableConfig.useQuery(
    {
      userId: userId as string,
      tableName: tableName as string,
      schoolId: schoolId as string,
    },
    {
      enabled: shouldUseApi,
    }
  );

  const { data: tableConfig, isPending: isLoading } = tableConfigQuery;

  const upsertTableConfig = api.students.upsertTableConfig.useMutation();

  const upsertConfig = (filtersConfig: T) => {
    if (shouldUseApi) {
      upsertTableConfig.mutate({
        userId: userId as string,
        tableName: tableName as string,
        schoolId: schoolId as string,
        filtersConfig,
      });
    }
  };

  const processTableConfig = <R,>(processor: (config: any) => R | null): R | null => {
    if (shouldUseApi && tableConfig && tableConfig.length > 0) {
      const filtersConfig = tableConfig[0].filters_config;
      return processor(filtersConfig);
    }
    return null;
  };

  useEffect(() => {
    if (previousSchoolIdRef.current && previousSchoolIdRef.current !== schoolId) {
      initializedRef.current = false;
    }
    previousSchoolIdRef.current = schoolId as string | null;
  }, [schoolId]);

  return {
    shouldUseApi,
    userId,
    schoolId,
    tableConfig,
    isLoading,
    initializedRef,
    previousSchoolIdRef,
    upsertConfig,
    processTableConfig,
  };
}
