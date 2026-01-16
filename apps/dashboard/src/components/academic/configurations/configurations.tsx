import * as Sentry from '@sentry/nextjs';
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@cometa/recreo/v2';
import { DatePicker } from '@cometa/recreo/v2/components/date-picker';
import { useState, useMemo, useEffect, useRef } from 'react';
import { PencilIcon, ChevronDown } from 'lucide-react';
import { useSchoolCycleSelector } from '../../organisms/dashboard/SchoolCycleSelector';
import { api } from '/src/utils/api';
import { format, parse, isValid as isValidDate } from 'date-fns';
import useAlert from '/src/hooks/useAlert';
import { useGetMembership, useSelectedSchool } from '/src/guards/AuthGuard';
import {
  RoundingCriteria,
  EvaluationPeriodEntity,
  AcademicConfigOriginTypeEnum,
  EvaluationScoreSystem,
  EvaluationNoteSystem,
  AttendanceGranularityTypeEnum,
  AttendanceContextTypeEnum,
  SepEducationalLevel,
} from '@cometa/trpc/src/students/types';
import { cn } from '@cometa/utils';
import { canManageAcademicActions } from '../utils';
import { ConfigurationSkeleton } from '../skeletons';

function generatePeriodFieldKey(periodName: string, levelId: string, type: 'start' | 'end') {
  const normalizedName = periodName.replace(/\s+/g, '');
  const normalizedLevelId = levelId.replace(/\s+/g, '');
  return `${normalizedLevelId}_${normalizedName}_${type}`;
}

function validatePeriodDates(
  periodsByLevel: PeriodsGroupedByLevel[],
  data: Record<string, unknown>,
  ctx: z.RefinementCtx
) {
  for (const levelGroup of periodsByLevel) {
    for (const period of levelGroup.periods) {
      const startKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'start');
      const endKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'end');
      const startDate = data[startKey] as Date | undefined;
      const endDate = data[endKey] as Date | undefined;

      if (startDate && endDate && startDate >= endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fecha de inicio debe ser anterior a la fecha de cierre',
          path: [startKey],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fecha de cierre debe ser posterior a la fecha de inicio',
          path: [endKey],
        });
      }
    }
  }
}

function createConfigurationSchema(periodsByLevel: PeriodsGroupedByLevel[]) {
  const baseSchema = {
    restrict_report_card_for_debtors: z.boolean({
      required_error: 'Debes seleccionar una opción para restricción de boletas',
      invalid_type_error: 'La restricción de boletas debe ser verdadero o falso',
    }),
    lock_evaluation_score_editing_after_period_close: z.boolean({
      required_error: 'Debes seleccionar una opción para bloqueo de edición',
      invalid_type_error: 'El bloqueo de edición debe ser verdadero o falso',
    }),
  };

  const levelConfigsSchema = periodsByLevel.reduce((acc, levelGroup) => {
    acc[`${levelGroup.levelId}_evaluation_score_system`] = z.nativeEnum(EvaluationScoreSystem).nullable();
    acc[`${levelGroup.levelId}_evaluation_note_system`] = z.nativeEnum(EvaluationNoteSystem).nullable();
    acc[`${levelGroup.levelId}_decimal_places`] = z
      .number({
        required_error: 'El uso de decimales es requerido',
        invalid_type_error: 'El uso de decimales debe ser un número',
      })
      .int('El uso de decimales debe ser un número entero')
      .nonnegative('El uso de decimales no puede ser negativo');
    acc[`${levelGroup.levelId}_rounding_criteria`] = z
      .nativeEnum(RoundingCriteria, {
        required_error: 'El criterio de redondeo es requerido',
        invalid_type_error: 'El criterio de redondeo no es válido',
      })
      .nullable();

    acc[`${levelGroup.levelId}_attendance_context`] = z.nativeEnum(AttendanceContextTypeEnum).nullable();
    acc[`${levelGroup.levelId}_attendance_granularity`] = z.nativeEnum(AttendanceGranularityTypeEnum).nullable();

    acc[`${levelGroup.levelId}_sep_level`] = z.nativeEnum(SepEducationalLevel).nullable();

    return acc;
  }, {} as Record<string, z.ZodType>);

  const periodsSchema = periodsByLevel.reduce((acc, levelGroup) => {
    levelGroup.periods.forEach((period) => {
      acc[generatePeriodFieldKey(period.name, levelGroup.levelId, 'start')] = z.date({
        required_error: 'La fecha de inicio es requerida',
        invalid_type_error: 'La fecha de inicio no es válida',
      });
      acc[generatePeriodFieldKey(period.name, levelGroup.levelId, 'end')] = z.date({
        required_error: 'La fecha de cierre es requerida',
        invalid_type_error: 'La fecha de cierre no es válida',
      });
    });
    return acc;
  }, {} as Record<string, z.ZodDate>);

  return z.object({ ...baseSchema, ...levelConfigsSchema, ...periodsSchema }).superRefine((data, ctx) => {
    validatePeriodDates(periodsByLevel, data, ctx);

    for (const levelGroup of periodsByLevel) {
      const scoreSystem = data[`${levelGroup.levelId}_evaluation_score_system` as keyof typeof data];
      const noteSystem = data[`${levelGroup.levelId}_evaluation_note_system` as keyof typeof data];

      if (!scoreSystem && !noteSystem) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes seleccionar al menos un sistema de calificaciones',
          path: [`${levelGroup.levelId}_evaluation_score_system`],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes seleccionar al menos un sistema de calificaciones',
          path: [`${levelGroup.levelId}_evaluation_note_system`],
        });
      }
    }
  });
}

const roundingCriteriaOptions = [
  { value: null, label: 'Sin redondeo', example: '8.6 → 8.6' },
  {
    value: RoundingCriteria.Standard,
    label: 'Estándar (≥.5 hacia arriba, ≤.4 hacia abajo)',
    example: '8.6 → 9.0, 8.4 → 8.0',
  },
  { value: RoundingCriteria.RoundHalfUp, label: '≥ .5 hacia arriba', example: '8.6 → 9.0' },
  { value: RoundingCriteria.RoundUp, label: 'Redondeo hacia arriba', example: '8.1 → 9.0' },
  { value: RoundingCriteria.RoundDown, label: 'Redondeo hacia abajo', example: '8.9 → 8.0' },
];

const roundingCriteriaExamplesMap = new Map(roundingCriteriaOptions.map((option) => [option.value, option.example]));

const decimalPlacesOptions = [
  { value: 0, label: '0 decimales', example: '8' },
  { value: 1, label: '1 decimal', example: '8.6' },
  { value: 2, label: '2 decimales', example: '8.65' },
];

const decimalPlacesExamplesMap = new Map(decimalPlacesOptions.map((option) => [option.value, option.example]));

const _sepConversionTable = [
  { range: '0 - 5.9', sep: '5' },
  { range: '6.0 - 6.5', sep: '6' },
  { range: '6.6 - 7.5', sep: '7' },
  { range: '7.6 - 8.5', sep: '8' },
  { range: '8.6 - 9.5', sep: '9' },
  { range: '9.6 - 10', sep: '10' },
];

const attendanceOptions = [
  {
    value: 'group_daily',
    label: 'Una vez al día por grupo',
    context: AttendanceContextTypeEnum.Group,
    granularity: AttendanceGranularityTypeEnum.Daily,
  },
  {
    value: 'classroom_daily',
    label: 'Una vez al día por clase',
    context: AttendanceContextTypeEnum.Classroom,
    granularity: AttendanceGranularityTypeEnum.Daily,
  },
];

const attendanceHelpTextMap = {
  group_daily: 'Recomendado para niveles con un docente principal o jornada continua.',
  classroom_daily: 'Recomendado para niveles con varios docentes por grupo.',
  classroom_per_module: 'Recomendado para clases con módulos diferenciados (Teoría, práctica, laboratorio, etc.).',
};

const sepLevelOptions = [
  {
    value: SepEducationalLevel.Preschool,
    label: 'Preescolar',
    description: 'Formato de calificaciones cualitativas, organizadas por campo formativo',
  },
  {
    value: SepEducationalLevel.Elementary,
    label: 'Primaria',
    description: 'Formato de calificaciones cualitativas + numéricas, organizadas por campo formativo',
  },
  {
    value: SepEducationalLevel.MiddleSchool,
    label: 'Secundaria',
    description: 'Formato de calificaciones numérico, organizado por materia',
  },
  {
    value: SepEducationalLevel.HighSchool,
    label: 'Preparatoria',
    description: 'No aplica para archivo SEP',
  },
];

type PeriodDatesProps = { period: EvaluationPeriodEntity; levelId: string; isEditing: boolean };
function PeriodDates({ period, levelId, isEditing }: PeriodDatesProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const startFieldName = generatePeriodFieldKey(period.name, levelId, 'start');
  const endFieldName = generatePeriodFieldKey(period.name, levelId, 'end');

  const startError = errors[startFieldName]?.message?.toString();
  const endError = errors[endFieldName]?.message?.toString();

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-base font-bold mb-1">{period.name}</span>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Controller
            name={startFieldName}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute -top-1.5 left-2 z-10 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                  Inicio
                </span>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!isEditing}
                  placeholder="Selecciona fecha de inicio"
                  error={startError}
                />
              </div>
            )}
          />
        </div>
        <div>
          <Controller
            name={endFieldName}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute -top-1.5 left-2 z-10 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                  Cierre
                </span>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!isEditing}
                  placeholder="Selecciona fecha de cierre"
                  error={endError}
                />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

type PeriodsGroupedByLevel = {
  levelId: string;
  levelName: string;
  periods: EvaluationPeriodEntity[];
};

type LevelGradingConfigProps = {
  levelId: string;
  isEditing: boolean;
};

function LevelGradingConfig({ levelId, isEditing }: LevelGradingConfigProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const evaluationScoreSystemFieldName = `${levelId}_evaluation_score_system`;
  const evaluationNoteSystemFieldName = `${levelId}_evaluation_note_system`;
  const decimalPlacesFieldName = `${levelId}_decimal_places`;
  const roundingCriteriaFieldName = `${levelId}_rounding_criteria`;

  const currentScoreSystem = watch(evaluationScoreSystemFieldName);
  const currentDecimalPlaces = watch(decimalPlacesFieldName);
  const currentRoundingCriteria = watch(roundingCriteriaFieldName);

  const scoreSystemError = errors[evaluationScoreSystemFieldName]?.message?.toString();
  const noteSystemError = errors[evaluationNoteSystemFieldName]?.message?.toString();
  const decimalPlacesError = errors[decimalPlacesFieldName]?.message?.toString();
  const roundingCriteriaError = errors[roundingCriteriaFieldName]?.message?.toString();

  return (
    <div className="space-y-6 pb-8 border-b border-slate-200">
      <div className="space-y-0.5">
        <h3 className="font-semibold text-base">Sistema de calificaciones</h3>
        <span className="text-sm text-gray-600 block">
          Establece el formato y las reglas con las que se registran las calificaciones en este nivel.
        </span>
      </div>
      <div>
        <Controller
          name={evaluationScoreSystemFieldName}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <span className="absolute -top-2 left-2 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                Sistema de calificaciones
              </span>
              <Select
                value={field.value === null ? 'null' : field.value}
                onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona un sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EvaluationScoreSystem.Numeric}>Numérico (0-10)</SelectItem>
                  <SelectItem value="null">Ninguno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        {scoreSystemError && <p className="text-red-500 text-xs mt-1">{scoreSystemError}</p>}
        {currentScoreSystem === EvaluationScoreSystem.Numeric && (
          <span className="mt-2 text-xs text-black-600 block">Ejemplo: Calificación 8</span>
        )}
      </div>

      {currentScoreSystem === EvaluationScoreSystem.Numeric && (
        <>
          <div>
            <Controller
              name={decimalPlacesFieldName}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <span className="absolute -top-2 left-2 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                    Uso de decimales
                  </span>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {decimalPlacesOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            {decimalPlacesError && <p className="text-red-500 text-xs mt-1">{decimalPlacesError}</p>}
            <span className="mt-2 text-xs text-black-600 block">
              Ejemplo: Calificación {decimalPlacesExamplesMap.get(currentDecimalPlaces)}
            </span>
          </div>

          <div>
            <Controller
              name={roundingCriteriaFieldName}
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <span className="absolute -top-2 left-2 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                    Criterio de redondeo
                  </span>
                  <Select
                    value={field.value === null ? 'null' : field.value}
                    onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roundingCriteriaOptions.map((option) => (
                        <SelectItem key={option.value ?? 'null'} value={option.value === null ? 'null' : option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            {roundingCriteriaError && <p className="text-red-500 text-xs mt-1">{roundingCriteriaError}</p>}
            <span className="mt-2 text-xs text-black-600 block">
              Ejemplo: Calificación {roundingCriteriaExamplesMap.get(currentRoundingCriteria)}
            </span>
          </div>
        </>
      )}

      <div>
        <Controller
          name={evaluationNoteSystemFieldName}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <span className="absolute -top-2 left-4 bg-white px-2 text-xs text-slate-500">
                Sistema cualitativo de calificaciones
              </span>
              <Select
                value={field.value === null ? 'null' : field.value}
                onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona un sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Ninguna</SelectItem>
                  <SelectItem value={EvaluationNoteSystem.ShortText}>Texto corto</SelectItem>
                  <SelectItem value={EvaluationNoteSystem.LongText}>Texto largo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        {noteSystemError && <p className="text-red-500 text-xs mt-1">{noteSystemError}</p>}
      </div>
    </div>
  );
}

type LevelAttendanceConfigProps = {
  levelId: string;
  isEditing: boolean;
};

function LevelAttendanceConfig({ levelId, isEditing }: LevelAttendanceConfigProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const contextFieldName = `${levelId}_attendance_context`;
  const granularityFieldName = `${levelId}_attendance_granularity`;

  const currentContext = watch(contextFieldName);
  const currentGranularity = watch(granularityFieldName);

  const contextError = errors[contextFieldName]?.message?.toString();
  const granularityError = errors[granularityFieldName]?.message?.toString();

  const getCombinedValue = () => {
    if (!currentContext || !currentGranularity) return 'null';
    const option = attendanceOptions.find(
      (opt) => opt.context === currentContext && opt.granularity === currentGranularity
    );
    return option?.value ?? 'null';
  };

  const handleCombinedChange = (value: string) => {
    if (value === 'null') {
      setValue(contextFieldName, null);
      setValue(granularityFieldName, null);
      return;
    }

    const option = attendanceOptions.find((opt) => opt.value === value);
    if (option) {
      setValue(contextFieldName, option.context);
      setValue(granularityFieldName, option.granularity);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="font-semibold text-base">Modo de toma de asistencia</h3>
        <span className="text-sm text-gray-600 block">
          Define cómo se registrará la asistencia en este nivel: por grupo una vez al día, o por cada clase impartida.
        </span>
      </div>
      <div>
        <div className="relative">
          <span className="absolute -top-2 left-2 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
            Tipo de asistencia
          </span>
          <Select value={getCombinedValue()} onValueChange={handleCombinedChange} disabled={!isEditing}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecciona un tipo de asistencia" />
            </SelectTrigger>
            <SelectContent>
              {attendanceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="null">Ninguno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(contextError || granularityError) && (
          <p className="text-red-500 text-xs mt-1">{contextError || granularityError}</p>
        )}
        {getCombinedValue() !== 'null' && (
          <span className="mt-2 text-xs text-black-600 block">
            {attendanceHelpTextMap[getCombinedValue() as keyof typeof attendanceHelpTextMap]}
          </span>
        )}
      </div>
    </div>
  );
}

type LevelSEPConfigProps = {
  levelId: string;
  isEditing: boolean;
};

function LevelSEPConfig({ levelId, isEditing }: LevelSEPConfigProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const sepLevelFieldName = `${levelId}_sep_level`;
  const currentSepLevel = watch(sepLevelFieldName);
  const sepLevelError = errors[sepLevelFieldName]?.message?.toString();

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="font-semibold text-base">Nivel SEP</h3>
        <span className="text-sm text-gray-600 block">
          Define el nivel educativo oficial de la SEP que corresponde a este nivel en tu colegio.
        </span>
      </div>
      <div>
        <Controller
          name={sepLevelFieldName}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <span className="absolute -top-2 left-2 inline-flex items-center bg-white px-0 py-0 text-xs text-slate-500 leading-none rounded whitespace-nowrap">
                Nivel educativo SEP
              </span>
              <Select
                value={field.value === null ? 'null' : field.value}
                onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona un nivel SEP" />
                </SelectTrigger>
                <SelectContent>
                  {sepLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="null">Ninguno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        {sepLevelError && <p className="text-red-500 text-xs mt-1">{sepLevelError}</p>}
        {currentSepLevel && currentSepLevel !== 'null' && (
          <span className="mt-2 text-xs text-black-600 block">
            {sepLevelOptions.find((opt) => opt.value === currentSepLevel)?.description}
          </span>
        )}
      </div>
    </div>
  );
}

type LevelConfigProps = {
  levelGroup: PeriodsGroupedByLevel;
  isEditing: boolean;
};

function LevelConfig({ levelGroup, isEditing }: LevelConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    formState: { errors },
  } = useFormContext();

  // check if some period or level config has errors
  useEffect(() => {
    const hasPeriodErrors = levelGroup.periods.some((period) => {
      const startKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'start');
      const endKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'end');
      return errors[startKey] || errors[endKey];
    });

    const hasLevelConfigErrors =
      errors[`${levelGroup.levelId}_evaluation_score_system`] ||
      errors[`${levelGroup.levelId}_evaluation_note_system`] ||
      errors[`${levelGroup.levelId}_decimal_places`] ||
      errors[`${levelGroup.levelId}_rounding_criteria`] ||
      errors[`${levelGroup.levelId}_attendance_context`] ||
      errors[`${levelGroup.levelId}_attendance_granularity`] ||
      errors[`${levelGroup.levelId}_sep_level`];

    if (hasPeriodErrors || hasLevelConfigErrors) {
      setIsOpen(true);
    }
  }, [errors, levelGroup.periods, levelGroup.levelId]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-slate-100 rounded-[20px] overflow-hidden bg-white">
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between bg-white transition-colors',
            'relative px-8 py-5',
            'hover:bg-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
            isOpen &&
              "after:content-[''] after:absolute after:left-8 after:right-8 after:bottom-0 after:h-px after:bg-slate-200"
          )}
        >
          <span className="font-semibold text-base">{levelGroup.levelName}</span>
          <ChevronDown
            className={cn('h-5 w-5 transition-transform duration-200', {
              'rotate-180': isOpen,
            })}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-8 space-y-6">
            {/* Level Grading Configuration */}
            <LevelGradingConfig levelId={levelGroup.levelId} isEditing={isEditing} />

            {/* Evaluation Periods */}
            <div className="space-y-4 pb-8 border-b border-slate-200">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-base">Períodos de Evaluación</h3>
                <span className="text-sm text-gray-600 block">
                  Establece el formato y las reglas con las que se registran las calificaciones en este nivel.
                </span>
              </div>
              {levelGroup.periods.length > 0 ? (
                levelGroup.periods.map((period) => (
                  <PeriodDates key={period.id} period={period} isEditing={isEditing} levelId={levelGroup.levelId} />
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Aún no hay períodos configurados para este nivel.</p>
              )}
            </div>

            {/* Level Attendance Configuration*/}
            <LevelAttendanceConfig levelId={levelGroup.levelId} isEditing={isEditing} />

            {/* Level SEP Configuration*/}
            <div className="pt-8 border-t border-slate-200">
              <LevelSEPConfig levelId={levelGroup.levelId} isEditing={isEditing} />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function Configurations() {
  const { setAlertState } = useAlert();
  const { activeCycle } = useSchoolCycleSelector();
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const canEdit = canManageAcademicActions(membership);

  const [isEditing, setIsEditing] = useState(false);
  const hasInitialized = useRef(false);
  const { data: levels, isLoading: levelsLoading } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId: selectedSchool?.id ?? '' },
    { enabled: !!selectedSchool?.id }
  );

  const { data: evaluationPeriods, refetch: refetchEvaluationPeriods } = api.students.listEvaluationPeriods.useQuery(
    { school_cycle_id: activeCycle?.id as string },
    { enabled: !!activeCycle?.id }
  );

  const {
    data: schoolConfig,
    refetch: refetchSchoolConfig,
    isLoading: schoolConfigLoading,
  } = api.students.getSchoolConfig.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const levelIds = levels?.map((level) => level.id).filter((id): id is string => !!id) ?? [];

  const { data: levelConfigs, refetch: refetchLevelConfigs } = api.students.listAcademicConfigs.useQuery(
    { origin_type: AcademicConfigOriginTypeEnum.Level, origin_id: levelIds, school_cycle_id: activeCycle?.id ?? '' },
    { enabled: !!selectedSchool?.id && levelIds.length > 0 && !!activeCycle?.id }
  );

  const upsertSchoolConfig = api.students.upsertSchoolConfig.useMutation({
    onSuccess: () => {
      refetchSchoolConfig().then(() => {
        hasInitialized.current = false;
      });
    },
  });

  const upsertAcademicConfigMutation = api.students.upsertAcademicConfig.useMutation({
    onSuccess: () => {
      refetchLevelConfigs().then(() => {
        hasInitialized.current = false;
      });
    },
  });

  const updateEvaluationPeriodMutation = api.students.updateEvaluationPeriod.useMutation({
    onSuccess: () => {
      refetchEvaluationPeriods().then(() => {
        hasInitialized.current = false;
      });
    },
  });

  const periodsByLevelArray: PeriodsGroupedByLevel[] =
    levels?.map((level) => ({
      levelId: level.id ?? '',
      levelName: level.name ?? 'Nivel desconocido',
      periods: evaluationPeriods?.filter((period) => period.level_id === level.id) ?? [],
    })) ?? [];

  const configurationSchema = useMemo(() => createConfigurationSchema(periodsByLevelArray), [periodsByLevelArray]);

  type ConfigurationFormData = z.infer<typeof configurationSchema>;

  const defaultValues = useMemo(() => {
    const academicConfig = (schoolConfig?.academic ?? {}) as ConfigurationFormData;
    const baseDefaults = {
      restrict_report_card_for_debtors: academicConfig.restrict_report_card_for_debtors ?? true,
      lock_evaluation_score_editing_after_period_close:
        academicConfig.lock_evaluation_score_editing_after_period_close ?? true,
    };

    const parsePeriodDate = (date?: string | null): Date | undefined => {
      if (!date) return undefined;
      const parsed = parse(date, 'yyyy-MM-dd', new Date());
      return isValidDate(parsed) ? parsed : undefined;
    };

    const levelConfigsDefaults = periodsByLevelArray.reduce((acc, levelGroup) => {
      const levelConfig = levelConfigs?.find((lc) => lc.origin_id === levelGroup.levelId);

      acc[`${levelGroup.levelId}_evaluation_score_system`] =
        levelConfig?.scoring?.evaluation_score_system !== undefined
          ? levelConfig.scoring.evaluation_score_system
          : EvaluationScoreSystem.Numeric;

      acc[`${levelGroup.levelId}_evaluation_note_system`] =
        levelConfig?.scoring?.evaluation_note_system !== undefined ? levelConfig.scoring.evaluation_note_system : null;

      acc[`${levelGroup.levelId}_decimal_places`] = levelConfig?.scoring?.decimal_places ?? 1;
      acc[`${levelGroup.levelId}_rounding_criteria`] =
        levelConfig?.scoring?.rounding_criteria !== undefined
          ? levelConfig.scoring.rounding_criteria
          : RoundingCriteria.RoundHalfUp;

      acc[`${levelGroup.levelId}_attendance_context`] = levelConfig?.attendance?.context ?? null;
      acc[`${levelGroup.levelId}_attendance_granularity`] = levelConfig?.attendance?.granularity ?? null;

      acc[`${levelGroup.levelId}_sep_level`] = levelConfig?.sep?.level ?? null;

      return acc;
    }, {} as Record<string, string | number | RoundingCriteria | EvaluationScoreSystem | EvaluationNoteSystem | SepEducationalLevel | null>);

    const periodsDefaults = periodsByLevelArray.reduce((acc, levelGroup) => {
      levelGroup.periods.forEach((period) => {
        acc[generatePeriodFieldKey(period.name, levelGroup.levelId, 'start')] = parsePeriodDate(period.start_date);
        acc[generatePeriodFieldKey(period.name, levelGroup.levelId, 'end')] = parsePeriodDate(period.end_date);
      });
      return acc;
    }, {} as Record<string, Date | undefined>);

    return { ...baseDefaults, ...levelConfigsDefaults, ...periodsDefaults };
  }, [periodsByLevelArray, schoolConfig, levelConfigs]);

  const methods = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    trigger: triggerFormValidation,
  } = methods;

  useEffect(() => {
    const totalPeriods = periodsByLevelArray.reduce((sum, level) => sum + level.periods.length, 0);
    if (totalPeriods > 0 && schoolConfig && levelConfigs && !hasInitialized.current) {
      reset(defaultValues);
      hasInitialized.current = true;
    }
  }, [periodsByLevelArray, reset, defaultValues, schoolConfig, levelConfigs]);

  function mapPeriodsData(data: ConfigurationFormData) {
    const formatDateForBackend = (value: Date | undefined): string => {
      if (!value) return '';
      return format(value, 'yyyy-MM-dd');
    };

    type PeriodUpdate = { id: string; start_date: string; end_date: string; hasValidDates: boolean };
    const periodsToUpdate: PeriodUpdate[] = [];

    periodsByLevelArray.forEach((levelGroup) => {
      levelGroup.periods.forEach((period) => {
        const startKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'start');
        const endKey = generatePeriodFieldKey(period.name, levelGroup.levelId, 'end');

        const startDate = (data as Record<string, unknown>)[startKey] as Date | undefined;
        const endDate = (data as Record<string, unknown>)[endKey] as Date | undefined;

        periodsToUpdate.push({
          id: period.id,
          start_date: formatDateForBackend(startDate),
          end_date: formatDateForBackend(endDate),
          hasValidDates: !!(startDate && endDate),
        });
      });
    });

    return periodsToUpdate.filter((period) => period.hasValidDates);
  }

  async function onSubmit(data: ConfigurationFormData) {
    const isValid = await triggerFormValidation();
    if (!isValid) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Formulario invalido',
      });
      return;
    }

    if (!selectedSchool) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No hay un colegio seleccionado',
      });
      return;
    }

    try {
      await upsertSchoolConfig.mutateAsync({
        school_id: selectedSchool.id,
        academic: {
          restrict_report_card_for_debtors: data.restrict_report_card_for_debtors,
          lock_evaluation_score_editing_after_period_close: data.lock_evaluation_score_editing_after_period_close,
        },
      });

      const levelConfigPromises = periodsByLevelArray.map((levelGroup) => {
        const evaluationScoreSystem = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_evaluation_score_system`
        ] as EvaluationScoreSystem | null;

        const evaluationNoteSystem = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_evaluation_note_system`
        ] as EvaluationNoteSystem | null;

        const decimalPlaces = (data as Record<string, unknown>)[`${levelGroup.levelId}_decimal_places`] as number;
        const roundingCriteria = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_rounding_criteria`
        ] as RoundingCriteria | null;

        const attendanceContext = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_attendance_context`
        ] as AttendanceContextTypeEnum | null;

        const attendanceGranularity = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_attendance_granularity`
        ] as AttendanceGranularityTypeEnum | null;

        const sepLevel = (data as Record<string, unknown>)[
          `${levelGroup.levelId}_sep_level`
        ] as SepEducationalLevel | null;

        const attendancePayload =
          attendanceContext && attendanceGranularity
            ? {
                context: attendanceContext,
                granularity: attendanceGranularity,
              }
            : null;

        const sepPayload = sepLevel ? { level: sepLevel } : null;

        return upsertAcademicConfigMutation.mutateAsync({
          origin_type: AcademicConfigOriginTypeEnum.Level,
          origin_id: levelGroup.levelId,
          school_cycle_id: activeCycle?.id as string,
          scoring: {
            evaluation_score_system: evaluationScoreSystem,
            evaluation_note_system: evaluationNoteSystem,
            decimal_places: decimalPlaces,
            rounding_criteria: roundingCriteria,
          },
          attendance: attendancePayload,
          sep: sepPayload,
        });
      });

      const validPeriodsToUpdate = mapPeriodsData(data);
      const periodPromises = validPeriodsToUpdate.map((periodData) =>
        updateEvaluationPeriodMutation.mutateAsync({
          evaluationPeriodId: periodData.id,
          data: {
            start_date: periodData.start_date,
            end_date: periodData.end_date,
          },
        })
      );

      await Promise.all([...levelConfigPromises, ...periodPromises]);

      setIsEditing(false);
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Configuraciones actualizadas exitosamente',
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al actualizar las configuraciones',
      });
      Sentry.captureException(error);
    }
  }

  function handleReset() {
    setIsEditing(false);
    reset(defaultValues);
  }

  function ActionButtons() {
    return (
      <>
        {isEditing ? (
          <div className="space-x-2">
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={handleReset}>
              Descartar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setIsEditing(true)} variant="ghost">
            <PencilIcon size={14} />
            Editar
          </Button>
        )}
      </>
    );
  }

  if (levelsLoading || schoolConfigLoading) {
    return <ConfigurationSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto p-6 space-y-6 pb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Configuraciones</h1>
              {/* <span className="text-sm text-gray-600">{activeCycle?.name}</span> */}
            </div>
            {canEdit ? <ActionButtons /> : null}
          </div>
          <p className="text-sm text-gray-600">
            Define cómo tu colegio evalúa, registra y publica las calificaciones de cada nivel educativo.
          </p>
        </div>

        {/* @TODO: uncomment when is implemented with the correct logic for each level */}
        {/*<div className="rounded-2xl p-8 bg-gray-200">
          <span className="font-bold text-lg flex items-center gap-2">
            <LockIcon size={18} />
            Conversión automática a la escala SEP
          </span>
          <p className="text-sm text-gray-600">
            Las calificaciones se convierten automáticamente a escala 5-10 para la boleta oficial SEP. La tabla de abajo
            muestra un ejemplo del método de conversión utilizado. Ten en cuenta que cada nivel educativo puede tener
            diferentes configuraciones de decimales y redondeo.
          </p>

          <div className="bg-white rounded-2xl p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="text-sm font-bold text-center">Tus calificaciones</div>
              <div className="text-sm font-bold text-center">Conversión a la SEP</div>
            </div>
            {sepConversionTable.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 py-2 border-t border-gray-200">
                <div className="text-sm text-center">{row.range}</div>
                <div className="text-sm text-center">{row.sep}</div>
              </div>
            ))}
          </div>
        </div>*/}

        <div>
          <h2 className="font-bold text-lg">Configuraciones por nivel</h2>
          <p className="text-sm text-gray-600 mb-6">
            Personaliza cómo se calculan y presentan las calificaciones en cada nivel educativo.
            <br />
            Estas opciones pueden variar entre niveles según la metodología o el tipo de evaluación del colegio.
          </p>
        </div>

        <div className="space-y-4">
          {periodsByLevelArray.map((levelGroup) => (
            <LevelConfig key={levelGroup.levelId} levelGroup={levelGroup} isEditing={isEditing} />
          ))}
        </div>

        <hr className="border-slate-200" />

        <div>
          <h2 className="font-bold text-lg">Boletas</h2>
          <p className="text-sm text-gray-600 mb-6">
            Personaliza cómo se entregan y muestran las boletas en tu colegio.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <Label className="text-sm font-medium block">¿Restringir boletas a familias con morosidad?</Label>
            <p className="text-sm text-gray-600">Las familias con pagos pendientes no podrán ver sus boletas.</p>
            <Controller
              name="restrict_report_card_for_debtors"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="restrict-yes" />
                    <Label htmlFor="restrict-yes" className="text-sm">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="restrict-no" />
                    <Label htmlFor="restrict-no" className="text-sm">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.restrict_report_card_for_debtors?.message && (
              <p className="text-red-500 text-xs mt-1">{errors.restrict_report_card_for_debtors.message}</p>
            )}
          </div>

          <hr />

          <div className="space-y-1">
            <Label className="text-sm font-medium block">
              ¿Bloquear edición de calificaciones fuera del periodo de evaluación?
            </Label>
            <p className="text-sm text-gray-600">
              Si activas esta opción, los docentes solo podrán capturar calificaciones mientras el periodo esté activo.
              Antes del inicio o después del cierre del periodo, no podrán editar calificaciones. Solo los directores
              podrán hacer ajustes en cualquier momento.
            </p>
            <Controller
              name="lock_evaluation_score_editing_after_period_close"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="block-yes" />
                    <Label htmlFor="block-yes" className="text-sm">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="block-no" />
                    <Label htmlFor="block-no" className="text-sm">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.lock_evaluation_score_editing_after_period_close?.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lock_evaluation_score_editing_after_period_close.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
