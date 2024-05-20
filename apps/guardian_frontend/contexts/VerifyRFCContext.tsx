import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useStudentStore } from '@cometa/hooks';
import { BillingGuardian, BillingStudent, Guardian, RetrieveGuardian } from '@cometa/trpc/src/types';
import { api } from '~/utils/api';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const initialState = {
  billingGuardiansIds: [],
  dependentsWithErrors: [],
  isFetchingVerifyRfc: false,
  user: undefined,
  refetchUser: () => void 0,
  refetchDependentsWithErrors: () => void 0,
  isFetchingUser: false,
};
export interface DependantErrorRFC extends PartialBy<BillingStudent, 'billing_guardian'> {
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
}

export const VerifyRFCProvider = ({ children }: VerifyRFCProviderProps) => {
  const { studentIds } = useStudentStore();

  const [dependentsWithErrors, setDependentsWithErrors] = useState<DependantErrorRFC[]>([]);

  const { data: user, refetch: refetchUser, isFetching: isFetchingUser } = api.guardian.me.useQuery();

  const dependents = useMemo(() => {
    const newDependents = user?.dependents?.filter((dependent) => studentIds.has(dependent.id)) ?? [];
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
  } = api.guardian.verifyGuardians.useQuery(
    { guardianIds: billingGuardiansIds },
    { refetchOnWindowFocus: false, enabled: Boolean(billingGuardiansIds.length), initialData: [] }
  );

  useEffect(() => {
    if (verifiedGuardians && !verifiedGuardians.length)
      return setDependentsWithErrors(dependents?.map((dependent) => ({ ...dependent, errorRFC: false })));

    const newDependentsWithErrors =
      dependents?.map<DependantErrorRFC>((dependent) => {
        const guardiansWithValidRFC = dependent.guardians.map((guardian) => {
          const verifiedGuardian = verifiedGuardians?.find(({ guardian_id }) => guardian_id === guardian?.id);
          return { ...guardian, validRFC: verifiedGuardian?.valid };
        });
        const verifiedGuardian = verifiedGuardians?.find(
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
