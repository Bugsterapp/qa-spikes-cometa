import { useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';

export function useFlag(flagKey: string) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  const attributes = useMemo(
    () => ({
      schoolName: selectedSchool?.name ?? '',
      school_id: selectedSchool?.id ?? '',
      email: session?.user?.email ?? '',
      customer_id: session?.user.id ?? '',
    }),
    [selectedSchool?.name, selectedSchool?.id, session?.user?.email, session?.user.id]
  );

  const { data: decision, isLoading } = api.optimizely.getFlag.useQuery(
    {
      flagKey,
      userId: session?.user.id ?? '',
      attributes,
    },
    {
      enabled: !!session?.user.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
    }
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && decision) {
      // eslint-disable-next-line no-console
      console.log('%cFlags', 'padding: 4; background-color: #8000ff; color: white; font-weight: bold;', {
        flagKey,
        enabled: decision.enabled,
        variables: decision.variables,
        variationKey: decision.variationKey,
      });
    }
  }, [decision, flagKey]);

  return [decision, !isLoading, false] as const;
}

type VariableConditions = {
  equals?: string[];
  ends_with?: string[];
  not_equals?: string[];
  not_ends_with?: string[];
};

type UserAttributes = {
  schoolName?: string;
  school_id?: string;
  schoolId?: string;
  email?: string;
};

type Decision = {
  enabled: boolean;
  variables?: Record<string, any>;
  variationKey?: string | null;
};

export function useFlagWithVariableMatching(flagKey: string) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();

  const userAttributes: UserAttributes = useMemo(
    () => ({
      schoolName: selectedSchool?.name ?? '',
      school_id: selectedSchool?.id ?? '',
      schoolId: selectedSchool?.id ?? '',
      email: session?.user?.email || undefined,
    }),
    [selectedSchool?.name, selectedSchool?.id, session?.user?.email]
  );

  const { data: decision, isLoading } = api.optimizely.getFlag.useQuery(
    {
      flagKey,
      userId: session?.user.id ?? '',
      attributes: userAttributes,
    },
    {
      enabled: !!session?.user.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
    }
  );

  function checkEqualsCondition(conditions: VariableConditions, value: string): boolean {
    return conditions.equals ? conditions.equals.includes(value) : false;
  }

  function checkEndsWithCondition(conditions: VariableConditions, value: string): boolean {
    return conditions.ends_with ? conditions.ends_with.some((suffix) => value.endsWith(suffix)) : false;
  }

  function checkNotEqualsCondition(conditions: VariableConditions, value: string): boolean {
    return conditions.not_equals ? conditions.not_equals.includes(value) : false;
  }

  function checkNotEndsWithCondition(conditions: VariableConditions, value: string): boolean {
    return conditions.not_ends_with ? conditions.not_ends_with.some((suffix) => value.endsWith(suffix)) : false;
  }

  function hasPositiveConditions(conditions: VariableConditions): boolean {
    return !!(conditions.equals || conditions.ends_with);
  }

  function hasNegativeConditions(conditions: VariableConditions): boolean {
    return !!(conditions.not_equals || conditions.not_ends_with);
  }

  function evaluateConditions(conditions: VariableConditions, value: string): boolean {
    const hasPositiveMatch = checkEqualsCondition(conditions, value) || checkEndsWithCondition(conditions, value);
    const hasNegativeMatch = checkNotEqualsCondition(conditions, value) || checkNotEndsWithCondition(conditions, value);

    if (hasNegativeMatch) {
      return false;
    }

    if (hasPositiveConditions(conditions)) {
      return hasPositiveMatch;
    }

    if (hasNegativeConditions(conditions)) {
      return true;
    }

    return false;
  }

  function isClientReadyAndDecisionEnabled(clientReady: boolean, decision: Decision | null): boolean {
    return clientReady && decision?.enabled === true;
  }

  function hasValidVariables(decision: Decision | null): boolean {
    const variables = decision?.variables;
    return !!(variables && typeof variables === 'object' && Object.keys(variables).length > 0);
  }

  function parseVariableConditions(variableValue: any): VariableConditions | null {
    try {
      return typeof variableValue === 'string' ? JSON.parse(variableValue) : variableValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid JSON in variable:`, error);
      return null;
    }
  }

  function checkVariableConditions(decision: Decision | null, userAttributes: UserAttributes): boolean {
    if (!hasValidVariables(decision)) {
      return decision?.enabled === true;
    }

    const variables = decision!.variables;

    for (const [variableName, variableValue] of Object.entries(variables!)) {
      const conditions = parseVariableConditions(variableValue);

      if (!conditions) {
        continue;
      }

      const userValue = userAttributes[variableName as keyof UserAttributes];

      if (userValue && typeof userValue === 'string') {
        if (evaluateConditions(conditions, userValue)) {
          return true;
        }
      }
    }

    return false;
  }

  function isValidVariationKey(decision: Decision | null): boolean {
    const variationKey = decision?.variationKey;
    return !variationKey || variationKey === 'on' || variationKey === 'off';
  }

  function isEnabled(): boolean {
    const clientReady = !isLoading;

    if (!isClientReadyAndDecisionEnabled(clientReady, decision ?? null)) {
      return false;
    }

    if (!decision) {
      return false;
    }

    if (!hasValidVariables(decision)) {
      return decision.enabled;
    }

    const variableConditionsResult = checkVariableConditions(decision, userAttributes);

    if (variableConditionsResult) {
      return true;
    }

    if (!isValidVariationKey(decision)) {
      return false;
    }

    return decision.enabled;
  }

  return {
    isEnabled: isEnabled(),
    decision,
    clientReady: !isLoading,
    userAttributes,
  };
}
