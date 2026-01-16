'use client';

import { useCallback, useState } from 'react';
import { api } from '/src/utils/api';
import { AdjustmentRulesConfig, AdjustmentRule, SimulationResult } from './AdjustmentRulesConfig';
import { RuleTypeEnum, ModeEnum, TypeAceEnum } from '@cometa/trpc/src/types';
import { ADJUSTMENT_RULE_DEFAULT_VALUES } from './constants';
import useAlert from '/src/hooks/useAlert';

type SimulateResponse = {
  base_amount?: string;
  mode?: string;
  steps?: {
    name?: string;
    base?: string;
    percentage?: string;
    applied?: string;
    balance?: string;
  }[];
  final_amount?: string;
};

export type AdjustmentRulesConfigContainerProps = {
  schoolId: string;
  baseAmount?: number;
  hasExistingConfiguration?: boolean;
  applyDiscountsIndependently?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdjustmentRulesConfigContainer({
  schoolId,
  baseAmount = 10000,
  hasExistingConfiguration = true,
  applyDiscountsIndependently = false,
  onSuccess,
  onCancel,
}: AdjustmentRulesConfigContainerProps) {
  const { setAlertState } = useAlert();

  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [finalTotal, setFinalTotal] = useState<string>('0.00');

  const { data: paginatedRules, isLoading: isLoadingRules } = api.adjustmentRules.list.useQuery(
    { schoolId },
    {
      enabled: !!schoolId,
    }
  );

  const simulateMutation = api.adjustmentRules.simulate.useMutation({
    onSuccess: (data: SimulateResponse | undefined) => {
      if (!data) return;

      const nameToRuleType: Record<string, RuleTypeEnum> = {
        scholarship: RuleTypeEnum.Scholarship,
        early_bird: RuleTypeEnum.EarlyBird,
        special_discount: RuleTypeEnum.SpecialDiscount,
        interest: RuleTypeEnum.Interest,
        special_overcharge: RuleTypeEnum.SpecialOvercharge,
      };

      if (data.steps && Array.isArray(data.steps)) {
        const mappedResults: SimulationResult[] = data.steps
          .map((step) => {
            if (!step.name) return null;
            return {
              rule_type: nameToRuleType[step.name] || RuleTypeEnum.Scholarship,
              applied_amount: step.applied || '0.00',
              balance: step.balance || '0.00',
            };
          })
          .filter((result): result is SimulationResult => result !== null);

        setSimulationResults(mappedResults);
      }

      if (data.final_amount) {
        setFinalTotal(data.final_amount);
      }
    },
    onError: () => {
      // Simulation error - silently fail
    },
  });

  const utils = api.useUtils();

  const bulkCreateMutation = api.adjustmentRules.bulkCreate.useMutation({
    onSuccess: async () => {
      await utils.adjustmentRules.list.invalidate({ schoolId });

      setAlertState({
        severity: 'success',
        open: true,
        message: 'Configuración guardada con éxito.',
      });
      onSuccess?.();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al guardar la configuración',
      });
    },
  });

  const existingRules = paginatedRules?.results || [];

  const initialRules: AdjustmentRule[] | undefined =
    existingRules.length > 0
      ? existingRules.map(
          (rule: {
            id: string;
            rule_type: string;
            order: number;
            is_active?: boolean;
            config?: Record<string, unknown>;
          }) => ({
            id: rule.id,
            rule_type: rule.rule_type as RuleTypeEnum,
            order: rule.order,
            is_active: rule.is_active ?? true,
            config: rule.config,
          })
        )
      : undefined;

  const isFixedAmount = useCallback(
    (ruleType: RuleTypeEnum): boolean =>
      [RuleTypeEnum.SpecialDiscount, RuleTypeEnum.SpecialOvercharge].includes(ruleType),
    []
  );

  const handleSimulationNeeded = useCallback(
    (params: { rules: AdjustmentRule[]; applyIndependently: boolean }) => {
      const { rules, applyIndependently } = params;
      const adjustments = rules.map((rule) => {
        const value = ADJUSTMENT_RULE_DEFAULT_VALUES[rule.rule_type] || 0;
        const adjustment: {
          type: TypeAceEnum;
          amount?: string;
          percentage?: string;
        } = {
          type: rule.rule_type as unknown as TypeAceEnum,
        };

        if (isFixedAmount(rule.rule_type)) {
          adjustment.amount = value.toFixed(2);
        } else {
          adjustment.percentage = value.toFixed(2);
        }

        return adjustment;
      });

      simulateMutation.mutate({
        schoolId,
        base_amount: baseAmount.toFixed(2),
        mode: applyIndependently ? ModeEnum.Independent : ModeEnum.Sequential,
        adjustments,
      });
    },
    [schoolId, baseAmount, isFixedAmount, simulateMutation]
  );

  const handleSave = useCallback(
    async (data: {
      apply_independently: boolean;
      rules: Array<{
        rule_type: RuleTypeEnum;
        order: number;
        is_active: boolean;
        config?: Record<string, any>;
      }>;
    }) => {
      await bulkCreateMutation.mutateAsync({
        schoolId,
        apply_independently: data.apply_independently,
        rules: data.rules,
      });
    },
    [schoolId, bulkCreateMutation]
  );

  if (isLoadingRules) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <AdjustmentRulesConfig
      schoolId={schoolId}
      initialRules={initialRules}
      initialApplyIndependently={applyDiscountsIndependently}
      baseAmount={baseAmount}
      onSave={handleSave}
      onCancel={onCancel}
      isLoading={bulkCreateMutation.isPending}
      simulationResults={simulationResults}
      finalTotal={finalTotal}
      onSimulationNeeded={handleSimulationNeeded}
      hasExistingConfiguration={hasExistingConfiguration}
    />
  );
}
