'use client';

import { Button, RadioCard, RadioGroup, Switch } from '@cometa/recreo/v2';
import { RuleTypeEnum } from '@cometa/trpc/src/types';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmAdjustmentRulesDialog } from './ConfirmAdjustmentRulesDialog';
import { DraggableRuleItem } from './DraggableRuleItem';
import { SimulationDisplay } from './SimulationDisplay';
import { StaticRuleItem } from './StaticRuleItem';
import { AdjustmentRulesHistoryDrawer } from './AdjustmentRulesHistoryDrawer';
import InfoIcon from '/public/assets/icons/ic_info_outline.svg';
import HistoryIcon from '/public/assets/icons/ic_history.svg';

export type AdjustmentRule = {
  id: string;
  rule_type: RuleTypeEnum;
  order: number;
  is_active: boolean;
  config?: Record<string, unknown>;
};

export type SimulationResult = {
  rule_type: RuleTypeEnum;
  applied_amount: string;
  balance: string;
};

export type AdjustmentRulesConfigProps = {
  schoolId: string;
  initialRules?: AdjustmentRule[];
  initialApplyIndependently?: boolean;
  baseAmount?: number;
  onSave?: (data: {
    apply_independently: boolean;
    rules: Array<{
      rule_type: RuleTypeEnum;
      order: number;
      is_active: boolean;
      config?: Record<string, unknown>;
    }>;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  simulationResults?: SimulationResult[];
  finalTotal?: string;
  onSimulationNeeded?: (params: { rules: AdjustmentRule[]; applyIndependently: boolean }) => void;
  hasExistingConfiguration?: boolean;
};

const DEFAULT_RULES: Array<{ rule_type: RuleTypeEnum; order: number }> = [
  { rule_type: RuleTypeEnum.Scholarship, order: 1 },
  { rule_type: RuleTypeEnum.EarlyBird, order: 2 },
  { rule_type: RuleTypeEnum.SpecialDiscount, order: 3 },
  { rule_type: RuleTypeEnum.Interest, order: 4 },
  { rule_type: RuleTypeEnum.SpecialOvercharge, order: 5 },
];

const RULE_NAMES: Record<RuleTypeEnum, string> = {
  [RuleTypeEnum.Scholarship]: 'Becas',
  [RuleTypeEnum.EarlyBird]: 'Descuentos pronto pago',
  [RuleTypeEnum.SpecialDiscount]: 'Descuentos especiales',
  [RuleTypeEnum.Interest]: 'Recargos por mora',
  [RuleTypeEnum.SpecialOvercharge]: 'Recargos especiales',
};

const RULE_DESCRIPTIONS: Record<RuleTypeEnum, string> = {
  [RuleTypeEnum.Scholarship]: 'Aplicado por beca académicas',
  [RuleTypeEnum.EarlyBird]: 'Por pagos antes de la fecha límite',
  [RuleTypeEnum.SpecialDiscount]: 'Aplicados por razones específicas',
  [RuleTypeEnum.Interest]: 'Por pagos después de la fecha límite',
  [RuleTypeEnum.SpecialOvercharge]: 'Aplicados por razones específicas',
};

function isDefaultConfiguration(rules: AdjustmentRule[] | undefined, applyIndependently: boolean): boolean {
  if (applyIndependently) return false;

  if (!rules || rules.length === 0) return true;
  if (rules.length !== DEFAULT_RULES.length) return false;

  const sortedRules = [...rules].sort((a, b) => a.order - b.order);

  return sortedRules.every((rule, index) => {
    const defaultRule = DEFAULT_RULES[index];
    return rule.rule_type === defaultRule.rule_type && rule.order === defaultRule.order;
  });
}

export function AdjustmentRulesConfig({
  schoolId,
  initialRules,
  initialApplyIndependently = false,
  baseAmount = 10000,
  onSave,
  onCancel,
  isLoading = false,
  simulationResults = [],
  finalTotal,
  onSimulationNeeded,
  hasExistingConfiguration = false,
}: AdjustmentRulesConfigProps) {
  const [configMode, setConfigMode] = useState<'default' | 'custom'>(() =>
    isDefaultConfiguration(initialRules, initialApplyIndependently) ? 'default' : 'custom'
  );

  const [applyIndependently, setApplyIndependently] = useState(initialApplyIndependently);

  const [showDialog, setShowDialog] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const [rules, setRules] = useState<AdjustmentRule[]>(() => {
    if (initialRules && initialRules.length > 0) {
      return initialRules.sort((a, b) => a.order - b.order);
    }

    return DEFAULT_RULES.map((defaultRule) => ({
      id: `temp-${defaultRule.rule_type}`,
      rule_type: defaultRule.rule_type,
      order: defaultRule.order,
      is_active: true,
      config: defaultRule.rule_type === RuleTypeEnum.Scholarship ? { is_accumulative: false } : {},
    }));
  });

  const resetToInitialState = useCallback(() => {
    setConfigMode(isDefaultConfiguration(initialRules, initialApplyIndependently) ? 'default' : 'custom');
    setApplyIndependently(initialApplyIndependently);

    if (initialRules && initialRules.length > 0) {
      setRules(initialRules.sort((a, b) => a.order - b.order));
    } else {
      setRules(
        DEFAULT_RULES.map((defaultRule) => ({
          id: `temp-${defaultRule.rule_type}`,
          rule_type: defaultRule.rule_type,
          order: defaultRule.order,
          is_active: true,
          config: defaultRule.rule_type === RuleTypeEnum.Scholarship ? { is_accumulative: false } : {},
        }))
      );
    }
  }, [initialRules, initialApplyIndependently]);

  const handleCancel = useCallback(() => {
    resetToInitialState();
    onCancel?.();
  }, [resetToInitialState, onCancel]);

  const percentages = useMemo<Record<string, number>>(
    () => ({
      [RuleTypeEnum.Scholarship]: 10,
      [RuleTypeEnum.EarlyBird]: 20,
      [RuleTypeEnum.SpecialDiscount]: 250,
      [RuleTypeEnum.Interest]: 5,
      [RuleTypeEnum.SpecialOvercharge]: 100,
    }),
    []
  );

  const isFixedAmount = (ruleType: RuleTypeEnum): boolean =>
    [RuleTypeEnum.SpecialDiscount, RuleTypeEnum.SpecialOvercharge].includes(ruleType);

  const rulesToDisplay = useMemo(() => {
    if (configMode === 'default') {
      return DEFAULT_RULES.map((defaultRule) => ({
        id: `temp-${defaultRule.rule_type}`,
        rule_type: defaultRule.rule_type,
        order: defaultRule.order,
        is_active: true,
        config: defaultRule.rule_type === RuleTypeEnum.Scholarship ? { is_accumulative: false } : {},
      }));
    }
    return rules;
  }, [configMode, rules]);

  useEffect(() => {
    if (onSimulationNeeded) {
      const shouldApplyIndependently = configMode === 'default' ? false : applyIndependently;
      onSimulationNeeded({ rules: rulesToDisplay, applyIndependently: shouldApplyIndependently });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, applyIndependently, configMode]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  }, []);

  const handleSaveConfirmed = useCallback(async () => {
    if (!onSave) return;

    const rulesData = rulesToDisplay.map((rule) => ({
      rule_type: rule.rule_type,
      order: rule.order,
      is_active: rule.is_active,
      config: rule.config,
    }));

    const shouldApplyIndependently = configMode === 'default' ? false : applyIndependently;

    await onSave({
      apply_independently: shouldApplyIndependently,
      rules: rulesData,
    });

    if (hasExistingConfiguration) {
      setShowDialog(false);
    }
  }, [rulesToDisplay, applyIndependently, onSave, hasExistingConfiguration, configMode]);

  const handleSaveClick = useCallback(() => {
    if (hasExistingConfiguration) {
      setShowDialog(true);
    } else {
      handleSaveConfirmed();
    }
  }, [hasExistingConfiguration, handleSaveConfirmed]);

  const getSimulationForRule = useCallback(
    (ruleType: RuleTypeEnum) => simulationResults.find((result) => result.rule_type === ruleType),
    [simulationResults]
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-['Lota_Grotesque'] font-semibold text-xl leading-7 text-[#22283a]">
              Órden de aplicación de becas y recargos
            </h2>
            <p className="font-['Lota_Grotesque'] text-sm leading-5 text-[#697086] mt-3">
              Define el orden en que se aplican los diferentes tipos de descuentos y recargos, y su método de cálculo.
            </p>
          </div>
          {hasExistingConfiguration && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowHistoryDrawer(true)}
              className="shrink-0 bg-[#eceff6] hover:bg-[#e0e4ed] text-[#22283a] shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]"
            >
              <HistoryIcon className="w-4 h-4" />
              <span>Ver historial</span>
            </Button>
          )}
        </div>
      </div>

      <RadioGroup
        value={configMode}
        onValueChange={(value) => setConfigMode(value as 'default' | 'custom')}
        className="flex flex-col gap-3"
      >
        <RadioCard
          id="config-default"
          value="default"
          title="Configuración por defecto"
          description="Mas rápida y sencilla."
        />
        <RadioCard
          id="config-custom"
          value="custom"
          title="Configuración personalizada"
          description="Máxima flexibilidad y ajustes a tu medida."
        />
      </RadioGroup>

      <div className="h-px w-full bg-[#d0d8e9]" />

      {configMode === 'default' && (
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-[#d0d8e9] rounded-lg overflow-hidden">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between leading-none text-sm whitespace-pre">
                <p className="font-['Lota_Grotesque'] text-[#697086]">Monto base:</p>
                <p className="font-['Lota_Grotesque'] font-bold text-[#22283a]">
                  ${baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[#d0d8e9]" />

            <div className="p-4 flex flex-col gap-3">
              {rulesToDisplay.map((rule, index) => {
                const simulation = getSimulationForRule(rule.rule_type);
                return (
                  <div key={rule.id}>
                    <StaticRuleItem
                      name={RULE_NAMES[rule.rule_type]}
                      description={RULE_DESCRIPTIONS[rule.rule_type]}
                      percentage={percentages[rule.rule_type] || 0}
                      ruleType={rule.rule_type}
                      appliedAmount={simulation?.applied_amount}
                      balance={simulation?.balance}
                      showBalance
                      isFixedAmount={isFixedAmount(rule.rule_type)}
                    />
                    {index < rulesToDisplay.length - 1 && (
                      <div className="h-px w-full bg-[#d0d8e9] my-3 -mx-4 w-[calc(100%+2rem)]" />
                    )}
                  </div>
                );
              })}

              <SimulationDisplay finalTotal={finalTotal} variant="default" />
            </div>
          </div>

          <div className="flex gap-4 items-center justify-end w-full">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-9">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isLoading}
              className="h-9 bg-[#22283a] hover:bg-[#1a1f2e] text-white shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]"
            >
              {isLoading ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </div>
        </div>
      )}

      {configMode === 'custom' && (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-3 items-start w-full">
              <div className="pt-[1px]">
                <Switch
                  checked={applyIndependently}
                  onCheckedChange={setApplyIndependently}
                  aria-label="Calcular siempre sobre el monto base"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <p className="font-['Lota_Grotesque'] font-semibold text-sm leading-5 text-[#22283a]">
                  Calcular siempre sobre el monto base
                </p>
                <p className="font-['Lota_Grotesque'] text-sm leading-5 text-[#697086]">
                  <span>Cada ítem se aplicará al monto base original, no al saldo restante. </span>
                  <span className="font-['Lota_Grotesque'] font-semibold">El orden NO afecta el total.</span>
                </p>
              </div>
            </div>

            {applyIndependently ? (
              <div className="bg-white border border-[#d0d8e9] rounded-lg overflow-hidden">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between leading-none text-sm whitespace-pre">
                    <p className="font-['Lota_Grotesque'] text-[#697086]">Monto base:</p>
                    <p className="font-['Lota_Grotesque'] font-bold text-[#22283a]">
                      ${baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-[#d0d8e9]" />

                <div className="p-4 flex flex-col gap-3">
                  {rules.map((rule, index) => {
                    const simulation = getSimulationForRule(rule.rule_type);
                    return (
                      <div key={rule.id}>
                        <StaticRuleItem
                          name={RULE_NAMES[rule.rule_type]}
                          description={RULE_DESCRIPTIONS[rule.rule_type]}
                          percentage={percentages[rule.rule_type] || 0}
                          ruleType={rule.rule_type}
                          appliedAmount={simulation?.applied_amount}
                          balance={simulation?.balance}
                          showBalance={false}
                          isFixedAmount={isFixedAmount(rule.rule_type)}
                        />
                        {index < rules.length - 1 && (
                          <div className="h-px w-full bg-[#d0d8e9] my-3 -mx-4 w-[calc(100%+2rem)]" />
                        )}
                      </div>
                    );
                  })}

                  <SimulationDisplay finalTotal={finalTotal} variant="default" />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border border-[#d0d8e9] rounded-lg overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between leading-none text-sm whitespace-pre">
                      <p className="font-['Lota_Grotesque'] text-[#697086]">Monto base:</p>
                      <p className="font-['Lota_Grotesque'] font-bold text-[#22283a]">
                        ${baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#d0d8e9]" />
                </div>

                <div className="bg-[#e8f4ff] border border-[#64b5ff] rounded-lg px-4 py-3 flex gap-3 items-center w-full">
                  <div className="flex items-start pb-0 pt-[2px] shrink-0">
                    <InfoIcon className="w-4 h-4 text-[#0d4f8c]" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 justify-center">
                    <p className="font-['Lota_Grotesque'] text-sm leading-5 text-[#0d4f8c]">
                      Usa el ícono "::" para arrastrar y cambiar el orden de aplicación.
                    </p>
                  </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2 w-full">
                      {rules.map((rule) => {
                        const simulation = getSimulationForRule(rule.rule_type);
                        return (
                          <DraggableRuleItem
                            key={rule.id}
                            id={rule.id}
                            order={rule.order}
                            name={RULE_NAMES[rule.rule_type]}
                            description={RULE_DESCRIPTIONS[rule.rule_type]}
                            percentage={percentages[rule.rule_type] || 0}
                            ruleType={rule.rule_type}
                            appliedAmount={simulation?.applied_amount}
                            balance={simulation?.balance}
                            isFixedAmount={isFixedAmount(rule.rule_type)}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                <SimulationDisplay finalTotal={finalTotal} variant="standalone" />
              </>
            )}
          </div>

          <div className="flex gap-4 items-center justify-end w-full">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-9">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isLoading}
              className="h-9 bg-[#22283a] hover:bg-[#1a1f2e] text-white shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]"
            >
              {isLoading ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </div>
        </div>
      )}

      <ConfirmAdjustmentRulesDialog
        open={hasExistingConfiguration && showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleSaveConfirmed}
        isLoading={isLoading}
      />

      <AdjustmentRulesHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        schoolId={schoolId}
      />
    </div>
  );
}
