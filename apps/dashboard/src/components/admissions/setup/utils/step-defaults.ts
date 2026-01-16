import {
  SchoolStepTags,
  SchoolStepTypeEnum,
  SchoolStepRules,
  AvailableRulesType,
  SpecificRule,
} from '@cometa/trpc/src/admissions/types';

type CompletedBy = 'guardian' | 'school' | 'both';

const DEFAULT_REDIRECT_URL_BY_TAG_MAP = new Map<SchoolStepTags, string>([
  [SchoolStepTags.ApplicationForm, 'application-form'],
  [SchoolStepTags.MedicalForm, 'medical-form'],
]);

const DEFAULT_REDIRECT_URL_BY_TYPE_MAP = new Map<SchoolStepTypeEnum, string>([
  [SchoolStepTypeEnum.Upload, 'documents'],
  [SchoolStepTypeEnum.Review, 'scholar-info'],
  [SchoolStepTypeEnum.Payment, '/'],
]);

const DEFAULT_COMPLETED_BY_RULES_BY_TAG_MAP = new Map<SchoolStepTags, CompletedBy>([
  [SchoolStepTags.ScholarInfo, 'guardian'],
  [SchoolStepTags.ApplicationForm, 'guardian'],
  [SchoolStepTags.VisitSchool, 'school'],
  [SchoolStepTags.Documents, 'both'],
  [SchoolStepTags.ConsentForm, 'guardian'],
  [SchoolStepTags.DocumentsValidation, 'school'],
  [SchoolStepTags.PaymentFee, 'guardian'],
  [SchoolStepTags.MedicalForm, 'guardian'],
  [SchoolStepTags.PsychopedagogicalForm, 'guardian'],
  [SchoolStepTags.AdmissionExam, 'school'],
]);

export function presetDefaultRedirectUrl(tag: SchoolStepTags, type: SchoolStepTypeEnum): string {
  const urlByTag = DEFAULT_REDIRECT_URL_BY_TAG_MAP.get(tag);
  if (urlByTag) return urlByTag;

  return DEFAULT_REDIRECT_URL_BY_TYPE_MAP.get(type) ?? '';
}

export function presetDefaultCompletedByRules(tag: SchoolStepTags): SchoolStepRules[] {
  const completedBy = DEFAULT_COMPLETED_BY_RULES_BY_TAG_MAP.get(tag) ?? null;
  return buildCompletedByRules(completedBy);
}

function buildCompletedByRules(completedBy: CompletedBy | null): SchoolStepRules[] {
  if (!completedBy) return [];

  if (completedBy === 'both') {
    return [
      createRule(AvailableRulesType.Guardian, [createSpecificRule('completed_by', 'guardian')]),
      createRule(AvailableRulesType.School, [createSpecificRule('completed_by', 'school')]),
    ];
  }

  const valuesMap: Record<Exclude<CompletedBy, 'both'>, string> = {
    guardian: AvailableRulesType.Guardian,
    school: AvailableRulesType.School,
  };

  const value = valuesMap[completedBy];

  return [
    createRule(AvailableRulesType.Guardian, [createSpecificRule('completed_by', value)]),
    createRule(AvailableRulesType.School, [createSpecificRule('completed_by', value)]),
  ];
}

function createRule(applyFor: AvailableRulesType, specificRules: SpecificRule[]): SchoolStepRules {
  return {
    apply_for: applyFor,
    specific_rules: specificRules,
  };
}

function createSpecificRule(condition: string, value: string, action: string | null = null): SpecificRule {
  return { condition, value, action: action ?? '' };
}
