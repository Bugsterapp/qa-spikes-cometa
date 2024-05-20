import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useQuery } from '@tanstack/react-query';
import { useSelectionStore } from '@cometa/hooks';
import { BillingGuardian, BillingStudent, Guardian, RetrieveGuardian } from '@cometa/trpc/src/types';

const initialState = {
  billingGuardiansIds: [],
  dependentsWithErrors: [],
  isFetchingVerifyRfc: false,
  user: undefined,
  refetchUser: () => void 0,
  refetchDependentsWithErrors: () => void 0,
  isFetchingUser: false,
};
export interface DependantErrorRFC extends BillingStudent {
  errorRFC?: boolean;
  guardians: (Guardian & { validRFC?: boolean })[];
}

export interface IVerifyRFCContext {
  billingGuardiansIds: BillingGuardian['id'][];
  dependentsWithErrors: DependantErrorRFC[];
  isFetchingVerifyRfc: boolean;
  user: RetrieveGuardian | undefined;
  refetchUser: () => void;
  refetchDependentsWithErrors: () => void;
  isFetchingUser: boolean;
}
export interface VerifiedGuardian {
  valid: boolean;
  guardian_id: string;
}

const VerifyRFCContext = createContext<IVerifyRFCContext>({
  ...initialState,
});

interface VerifyRFCProviderProps {
  children: ReactNode;
  useGetGuardian: (guardianId?: string) => {
    user: RetrieveGuardian | undefined;
    refetchUser: <TPageData>(
      options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
    ) => Promise<QueryObserverResult<RetrieveGuardian | undefined, unknown>>;
    isFetchingUser: boolean;
  };
  verifyGuardianIds: (guardianIds: string[], dependents: BillingStudent[]) => Promise<VerifiedGuardian[]>;
}

export const VerifyRFCProvider = ({ children, useGetGuardian, verifyGuardianIds }: VerifyRFCProviderProps) => {
  const { studentIds } = useSelectionStore();

  const [dependentsWithErrors, setDependentsWithErrors] = useState<DependantErrorRFC[]>([]);

  const { user, refetchUser, isFetchingUser } = useGetGuardian();

  const dependents = useMemo(() => {
    const newDependents = user?.dependents?.filter((dependent) => studentIds.has(dependent.id)) || [];
    return newDependents;
  }, [studentIds, user]);

  const billingGuardiansIds = useMemo(() => {
    const ids = dependents.flatMap((dependent) =>
      dependent.guardians
        .filter((guardian) => guardian.id && guardian.billing_name && guardian.tax_id)
        .map((guardian) => guardian.id)
    );

    return Array.from(new Set(ids));
  }, [dependents]);

  const {
    data: verifiedGuardians,
    isFetching: isFetchingVerifyRfc,
    refetch: refetchDependentsWithErrors,
  } = useQuery<VerifiedGuardian[]>(
    ['verifiedGuardians', billingGuardiansIds],
    () => verifyGuardianIds(billingGuardiansIds, dependents),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(dependents.length),
      initialData: [],
    }
  );

  useEffect(() => {
    if (verifiedGuardians && !verifiedGuardians.length)
      return setDependentsWithErrors(dependents?.map((dependent) => ({ ...dependent, errorRFC: false })));

    const newDependentsWithErrors =
      dependents?.map<DependantErrorRFC>((dependent) => {
        const guardiansWithValidRFC = dependent.guardians.map((guardian) => {
          const verifiedGuardian = verifiedGuardians.find(({ guardian_id }) => guardian_id === guardian?.id);
          return { ...guardian, validRFC: verifiedGuardian?.valid };
        });
        const verifiedGuardian = verifiedGuardians.find(
          ({ guardian_id }) => guardian_id === dependent.billing_guardian?.id
        );
        const errorRFC = Boolean(dependent.billing_guardian) && !verifiedGuardian?.valid;

        return {
          ...dependent,
          guardians: guardiansWithValidRFC,
          errorRFC,
        };
      }) || [];
    setDependentsWithErrors(newDependentsWithErrors);
  }, [dependents, verifiedGuardians]);

  const valueContext = useMemo(
    () => ({
      billingGuardiansIds,
      dependentsWithErrors,
      isFetchingVerifyRfc,
      user,
      refetchUser,
      refetchDependentsWithErrors,
      isFetchingUser,
    }),
    [
      billingGuardiansIds,
      dependentsWithErrors,
      isFetchingVerifyRfc,
      refetchDependentsWithErrors,
      refetchUser,
      user,
      isFetchingUser,
    ]
  );

  return <VerifyRFCContext.Provider value={valueContext}>{children}</VerifyRFCContext.Provider>;
};

export default VerifyRFCContext;
