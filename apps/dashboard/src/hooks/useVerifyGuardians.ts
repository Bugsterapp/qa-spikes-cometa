import { useStudentStore } from '@cometa/hooks';
import { BillingStudent, Guardian, RetrieveGuardian } from '@cometa/trpc/src/types';
import { useMemo } from 'react';
import { api } from '../utils/api';

export interface DependantErrorRFC extends BillingStudent {
  errorRFC?: boolean;
  guardians: (Guardian & { validRFC?: boolean })[];
}

export const useVerifyGuardians = (guardian?: RetrieveGuardian) => {
  const { studentIds } = useStudentStore();

  const dependents = useMemo(
    () => guardian?.dependents?.filter(({ id }) => studentIds.includes(id)) ?? [],
    [studentIds, guardian]
  );

  const billingGuardiansIds = useMemo(() => {
    const ids = dependents.flatMap((dependent) =>
      dependent.guardians.filter((item) => item.id && item.billing_name && item.tax_id).map(({ id }) => id)
    );
    const uniqueIds = Array.from(new Set(ids));

    return uniqueIds;
  }, [dependents]);

  const {
    data: verifiedGuardians,
    isFetching: isFetchingVerifyRfc,
    refetch: refetchDependentsWithErrors,
  } = api.guardian.verifyGuardians.useQuery(
    { guardianIds: billingGuardiansIds },
    { refetchOnWindowFocus: false, enabled: Boolean(billingGuardiansIds.length), initialData: [] }
  );

  const dependentsWithErrors = useMemo(() => {
    if (verifiedGuardians.length === 0)
      return (
        dependents?.map((dependent) => {
          dependent.guardians.map((guardian) => ({ ...guardian, validRFC: true }));
          return { ...dependent, errorRFC: false };
        }) || []
      );
    const newDependentsWithErrors =
      dependents?.map<DependantErrorRFC>((dependent) => {
        const guardiansWithValidRFC = dependent.guardians.map((guardian) => {
          const verifiedGuardian = verifiedGuardians.find(({ guardian_id }) => guardian_id === guardian?.id);
          const haveRFC = Boolean(guardian?.tax_id && guardian?.billing_name);
          return { ...guardian, validRFC: haveRFC ? verifiedGuardian?.valid : true };
        });
        const verifiedGuardian = verifiedGuardians.find(
          ({ guardian_id }) => guardian_id === dependent.billing_guardian?.id
        );
        const errorRFC = dependent.billing_guardian?.billing_name ? !verifiedGuardian?.valid : false;

        return {
          ...dependent,
          guardians: guardiansWithValidRFC,
          errorRFC,
        };
      }) || [];
    return newDependentsWithErrors;
  }, [dependents, verifiedGuardians]);

  return {
    billingGuardiansIds,
    dependentsWithErrors,
    refetchDependentsWithErrors,
    isFetchingVerifyRfc,
    verifiedGuardians,
  };
};
