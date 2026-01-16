import { useState, PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdmissionSetupContext, StepConfig } from './admission-setup-context';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { z } from 'zod';
import {
  SchoolStepTypeEnum,
  SchoolStepTags,
  SchoolStepStatusEnum,
  SchoolStepRules,
} from '@cometa/trpc/src/admissions/types';
import { presetDefaultRedirectUrl, presetDefaultCompletedByRules } from '../utils/step-defaults';

const admissionFormSchema = z.object({
  basicData: z.boolean().default(true),
  applicationForm: z.boolean().default(true),
  medicalInfo: z.boolean().default(false),
  psychopedagogicalForm: z.boolean().default(false),
  consentForm: z.boolean().default(false),
  schoolInfo: z.boolean().default(false),
  uploadDocuments: z.boolean().default(false),
  documentsValidation: z.boolean().default(false),
  visitSchool: z.boolean().default(false),
  admissionExam: z.boolean().default(false),
});

export type AdmissionFormData = z.infer<typeof admissionFormSchema>;

export function AdmissionSetupProvider({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showPublishing, setShowPublishing] = useState(false);
  const [stepCreationError, setStepCreationError] = useState<string | null>(null);

  const school = useSelectedSchool();

  const upsertSchoolSteps = api.admissions.upsertSchoolSteps.useMutation();
  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery(
    { schoolId: school?.id as string },
    { enabled: !!school?.id }
  );

  const form = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: admissionFormSchema.parse({}),
  });

  const stepConfig = currentStep ? STEP_CONFIGS[currentStep - 1] : null;

  function goToStep(step: number) {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
      setShowConfiguration(false);
    } else if (step > TOTAL_STEPS) {
      startLoading();
    }
  }

  function showExitDialog() {
    setShowExitConfirmation(true);
  }

  function hideExitDialog() {
    setShowExitConfirmation(false);
  }

  function startLoading() {
    setCurrentStep(null);
    setShowLoading(true);
  }

  async function startPublishing() {
    const schoolId = school?.id;
    if (!schoolId) return;

    setShowPublishing(true);
    setCurrentStep(null);
    setShowConfiguration(false);

    const draftSteps = schoolSteps.filter((step) => step.status === SchoolStepStatusEnum.Draft);

    const updatedSteps = draftSteps.map((step) => ({
      id: step.id,
      name: step.name as string,
      description: step.description as string,
      school_id: step.school_id as string,
      order: step.order as number,
      tag: step.tag as SchoolStepTags,
      type: step.type as SchoolStepTypeEnum,
      actions: {
        to_do: {
          label: step.actions?.to_do?.label || 'Completar',
          redirect_url: step.actions?.to_do?.redirect_url || '',
        },
        in_progress: {
          label: step.actions?.in_progress?.label || 'Continuar',
          redirect_url: step.actions?.in_progress?.redirect_url || '',
        },
        completed: {
          label: step.actions?.completed?.label || 'Revisar',
          redirect_url: step.actions?.completed?.redirect_url || '',
        },
      },
      status: SchoolStepStatusEnum.Active,
      rules: step.rules,
      deleted_at: step.deleted_at,
    }));

    if (updatedSteps.length > 0) {
      await upsertSchoolSteps.mutateAsync(updatedSteps);
    }
  }

  async function finishSetup() {
    try {
      setStepCreationError(null);
      const formData = form.getValues();
      const steps = generateAdmissionSteps(formData);

      const schoolId = school?.id;
      if (!schoolId) {
        setShowLoading(false);
        return;
      }

      const schoolStepsData = createSchoolStepsFromGenerated(steps, schoolId);
      const result = await upsertSchoolSteps.mutateAsync(schoolStepsData);

      if (!result) {
        setStepCreationError('Error al crear los pasos de admisión');
        setShowLoading(false);
        return;
      }

      setShowConfiguration(true);
      setCurrentStep(null);
      setShowLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear los pasos';
      setStepCreationError(errorMessage);
      setShowLoading(false);
    }
  }

  function goToConfiguration() {
    setShowConfiguration(true);
    setCurrentStep(null);
  }

  const value = {
    form,
    currentStep,
    stepConfig,
    totalSteps: TOTAL_STEPS,
    showExitConfirmation,
    showLoading,
    showConfiguration,
    showPublishing,
    isCreatingSteps: upsertSchoolSteps.isPending,
    stepCreationError,
    goToStep,
    goToConfiguration,
    showExitDialog,
    hideExitDialog,
    startLoading,
    finishSetup,
    startPublishing,
  };

  return <AdmissionSetupContext.Provider value={value}>{children}</AdmissionSetupContext.Provider>;
}

const STEP_CONFIGS: StepConfig[] = [
  {
    title: '¿Qué información necesitas pedir durante el proceso?',
    subtitle: 'Selecciona lo que necesites incluir. (Opción múltiple)',
  },
  {
    title: '¿Necesitas compartir documentos o información con los padres de familia?',
    subtitle: 'Marca solo si necesitas incluir este paso en tu proceso.',
  },
  {
    title: '¿Deberás solicitar documentos a las familias?',
    subtitle: 'Marca solo si necesitas incluir este paso en tu proceso.',
  },
  {
    title: '¿Qué necesitas agendar con las familias?',
    subtitle: 'Marca solo lo que necesites agendar durante el proceso. (Opción múltiple)',
  },
];

const TOTAL_STEPS = STEP_CONFIGS.length;

type GeneratedStep = {
  id: string;
  name: string;
  description: string;
  type: SchoolStepTypeEnum;
  tag: SchoolStepTags;
  order: number;
};

type CreateSchoolStepInput = {
  id?: string | null;
  name: string;
  order: number;
  description: string;
  type?: SchoolStepTypeEnum;
  school_id: string;
  status: SchoolStepStatusEnum;
  actions: {
    to_do: {
      label: string;
      redirect_url: string;
    };
    in_progress: {
      label: string;
      redirect_url: string;
    };
    completed: {
      label: string;
      redirect_url: string;
    };
  };
  tag: SchoolStepTags;
  rules?: SchoolStepRules[] | null;
  deleted_at?: string | null;
};

const STEP_ORDER_MAP = {
  [SchoolStepTags.ScholarInfo]: 1,
  [SchoolStepTags.ApplicationForm]: 2,
  [SchoolStepTags.MedicalForm]: 3,
  [SchoolStepTags.PsychopedagogicalForm]: 4,
  [SchoolStepTags.ConsentForm]: 5,
  [SchoolStepTags.VisitSchool]: 6,
  [SchoolStepTags.AdmissionExam]: 7,
  [SchoolStepTags.Documents]: 8,
  [SchoolStepTags.DocumentsValidation]: 9,
};

function generateAdmissionSteps(formData: AdmissionFormData): GeneratedStep[] {
  const steps: GeneratedStep[] = [];

  steps.push({
    id: 'application-form',
    name: 'Formulario de aplicación',
    description: 'Completa los datos generales del estudiante y de sus tutores.',
    type: SchoolStepTypeEnum.Form,
    tag: SchoolStepTags.ApplicationForm,
    order: STEP_ORDER_MAP[SchoolStepTags.ApplicationForm],
  });

  if (formData.medicalInfo) {
    steps.push({
      id: 'medical-form',
      name: 'Ficha médica',
      description: 'Información médica del estudiante.',
      type: SchoolStepTypeEnum.Form,
      tag: SchoolStepTags.MedicalForm,
      order: STEP_ORDER_MAP[SchoolStepTags.MedicalForm],
    });
  }

  if (formData.psychopedagogicalForm) {
    steps.push({
      id: 'psychopedagogical-form',
      name: 'Información psicopedagógica',
      description: 'Contexto familiar y emocional del estudiante.',
      type: SchoolStepTypeEnum.Form,
      tag: SchoolStepTags.PsychopedagogicalForm,
      order: STEP_ORDER_MAP[SchoolStepTags.PsychopedagogicalForm],
    });
  }

  if (formData.consentForm) {
    steps.push({
      id: 'consent-form',
      name: 'Acuerdos y permisos',
      description: 'Documentos legales y permisos requeridos.',
      type: SchoolStepTypeEnum.Form,
      tag: SchoolStepTags.ConsentForm,
      order: STEP_ORDER_MAP[SchoolStepTags.ConsentForm],
    });
  }

  if (formData.schoolInfo) {
    steps.push({
      id: 'school-info',
      name: 'Información escolar',
      description: 'Revisa documentos importantes del colegio antes de seguir con el proceso.',
      type: SchoolStepTypeEnum.Review,
      tag: SchoolStepTags.ScholarInfo,
      order: STEP_ORDER_MAP[SchoolStepTags.ScholarInfo],
    });
  }

  if (formData.uploadDocuments) {
    steps.push({
      id: 'document-upload',
      name: 'Carga de documentos',
      description: 'Adjunta los documentos solicitados para seguir con el proceso de admisión.',
      type: SchoolStepTypeEnum.Upload,
      tag: SchoolStepTags.Documents,
      order: STEP_ORDER_MAP[SchoolStepTags.Documents],
    });
  }

  if (formData.documentsValidation) {
    steps.push({
      id: 'document-validation',
      name: 'Validación de documentos',
      description: 'Revisión y validación de los documentos entregados.',
      type: SchoolStepTypeEnum.DocsValidation,
      tag: SchoolStepTags.DocumentsValidation,
      order: STEP_ORDER_MAP[SchoolStepTags.DocumentsValidation],
    });
  }

  if (formData.visitSchool) {
    steps.push({
      id: 'school-visit',
      name: 'Visita al colegio',
      description: 'Programa una visita al colegio o reunión con el equipo.',
      type: SchoolStepTypeEnum.VisitSchool,
      tag: SchoolStepTags.VisitSchool,
      order: STEP_ORDER_MAP[SchoolStepTags.VisitSchool],
    });
  }

  if (formData.admissionExam) {
    steps.push({
      id: 'admission-exam',
      name: 'Agendar examen',
      description: 'Programa el examen de ingreso para el estudiante.',
      type: SchoolStepTypeEnum.AdmissionExam,
      tag: SchoolStepTags.AdmissionExam,
      order: STEP_ORDER_MAP[SchoolStepTags.AdmissionExam],
    });
  }

  return steps.sort((a, b) => a.order - b.order);
}

function createSchoolStepsFromGenerated(generatedSteps: GeneratedStep[], schoolId: string): CreateSchoolStepInput[] {
  return generatedSteps.map((step, index) => ({
    id: null,
    name: step.name,
    description: step.description,
    order: index + 1,
    type: step.type,
    school_id: schoolId,
    status: SchoolStepStatusEnum.Inactive,
    actions: {
      to_do: {
        label: 'Comenzar',
        redirect_url: presetDefaultRedirectUrl(step.tag, step.type),
      },
      in_progress: {
        label: 'Continuar',
        redirect_url: '',
      },
      completed: {
        label: 'Revisar',
        redirect_url: presetDefaultRedirectUrl(step.tag, step.type),
      },
    },
    tag: step.tag,
    rules: presetDefaultCompletedByRules(step.tag),
  }));
}
