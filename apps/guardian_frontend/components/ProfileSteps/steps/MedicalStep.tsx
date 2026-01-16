import * as Sentry from '@sentry/nextjs';
import { MedicalInfoUpdateDTO } from '@cometa/trpc/src/students/types';
import { InscriptionEntity, StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import {
  AdditionalCommentsSection,
  AllergiesSection,
  BackgroundSection,
  EmergencyContactSection,
  GeneralSection,
  MedicalAuthorizationSection,
} from '../sections';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@cometa/recreo';
import { useAlert } from '~/hooks';
import { api } from '~/utils/api';
import { useHandleMutate } from '../api';
import { isSectionHidden, transformFormData } from '../sections/EditableSection';
import { UpsertMedicalFormDto } from '@cometa/trpc/src/admissions/types';

type MedicalStepProps = {
  studentId: string;
  studentAdditionalInfo: StudentEntity | null | undefined;
  hiddenFields: string[];
  onUpdateInscription: (inscription: Partial<InscriptionEntity>) => Promise<void>;
  onNext: () => void;
};

type FormValues = {
  emergency_contact_id: string | null | undefined;
  emergency_contact_name: string | null | undefined;
  emergency_contact_phone: string | null | undefined;
  emergency_contact_relationship: string | null | undefined;
  blood_type_code?: string | null | undefined;
  weight: number | null | undefined;
  height: number | null | undefined;
  laterality: string | null | undefined;
  family_history: string[] | null | undefined;
  personal_history: string[] | null | undefined;
  current_ailments: string[] | null | undefined;
  other_history: string | null | undefined;
  recent_interventions: string | null | undefined;
  drug_allergies: string | null | undefined;
  food_allergies: string | null | undefined;
  plant_allergies: string | null | undefined;
  other_allergies: string | null | undefined;
  drugs: string[] | null | undefined;
  authorize_emergency_transfer: string | null | undefined;
  authorize_physical_activity: string | null | undefined;
  pending_vaccines: string | null | undefined;
  comments: string | null | undefined;
};

type IsValidState = {
  emergencyContact: boolean;
  general: boolean;
  background: boolean;
  allergies: boolean;
  medicalAuthorization: boolean;
  additionalComments: boolean;
};

type SectionField =
  | 'emergencyContact'
  | 'generalInfo'
  | 'background'
  | 'medicalAuthorization'
  | 'allergies'
  | 'doctor'
  | 'additionalComments';

export type MedicalFormField = keyof UpsertMedicalFormDto;

export const sectionFields: Record<SectionField, MedicalFormField[]> = {
  emergencyContact: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
  generalInfo: ['blood_type', 'height', 'weight', 'laterality'],
  background: ['family_history', 'personal_history', 'current_ailments', 'other_history', 'recent_interventions'],
  medicalAuthorization: ['drugs', 'authorize_emergency_transfer'],
  allergies: ['drug_allergies', 'food_allergies', 'plant_allergies', 'other_allergies', 'dietary_restrictions'],
  doctor: ['has_private_doctor', 'doctor_name', 'doctor_phone', 'doctor_clinic', 'has_private_insurance'],
  additionalComments: ['pending_vaccines', 'comments'],
};

export function MedicalStep({
  studentId,
  studentAdditionalInfo,
  hiddenFields,
  onUpdateInscription,
  onNext,
}: MedicalStepProps) {
  const { register, getAction, updateIsDirty, updateIsEditing, getMedicalValues } = useFormActions();
  const { setAlert } = useAlert();
  const utils = api.useUtils();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState<IsValidState>({
    emergencyContact: true,
    general: true,
    background: true,
    allergies: true,
    medicalAuthorization: true,
    additionalComments: true,
  });
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    emergencyContact: null,
    general: null,
    background: null,
    allergies: null,
    medicalAuthorization: null,
    additionalComments: null,
  });

  const emergencyContactAction = getAction(FormActionKeys.EmergencyContactForm);
  const generalAction = getAction(FormActionKeys.GeneralForm);
  const backgroundAction = getAction(FormActionKeys.BackgroundForm);
  const allergiesAction = getAction(FormActionKeys.AllergiesForm);
  const medicalAuthorizationAction = getAction(FormActionKeys.MedicalAuthorizationForm);
  const additionalCommentsAction = getAction(FormActionKeys.AdditionalCommentsForm);

  const actions = [
    emergencyContactAction,
    generalAction,
    backgroundAction,
    allergiesAction,
    medicalAuthorizationAction,
    additionalCommentsAction,
  ];
  const dependencyKey = actions.map((action) => `${action?.isEditing}-${action?.isDirty}`).join('-');

  const upsertMedicalForm = api.student.upsertMedicalForm.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
    },
    onError(error) {
      Sentry.captureException(error);
    },
  });

  const handleUpsertMedicalForm = useHandleMutate(upsertMedicalForm.mutateAsync);

  async function handleSave(studentId: string, payload: MedicalInfoUpdateDTO): Promise<boolean> {
    const { success } = await handleUpsertMedicalForm({ studentId, data: payload });
    return success;
  }

  function handleIsValid(isValid: boolean, section: string) {
    setIsValid((prev) => {
      const newState = { ...prev, [section]: isValid };
      const anyInvalid = Object.values(newState).some((value) => !value);
      setHasValidationErrors(anyInvalid);
      return newState;
    });
  }

  async function validate() {
    const [emergencyContact, general, background, allergies, medicalAuthorization, additionalComments] =
      await Promise.all(actions.map((action) => (action?.validate ? action.validate() : Promise.resolve(true))));

    setIsValid({
      emergencyContact,
      general,
      background,
      allergies,
      medicalAuthorization,
      additionalComments,
    });

    return emergencyContact && general && background && allergies && medicalAuthorization && additionalComments;
  }

  const combinedAction: FormAction = {
    submitForm: async () => {
      const data: FormValues = (getMedicalValues() || {}) as FormValues;
      const transformedData = transformFormData(data);

      const success = await handleSave(studentId, transformedData as MedicalInfoUpdateDTO);
      return { success };
    },
    restoreForm: () => {
      emergencyContactAction?.restoreForm?.();
      generalAction?.restoreForm?.();
      backgroundAction?.restoreForm?.();
      allergiesAction?.restoreForm?.();
      medicalAuthorizationAction?.restoreForm?.();
      additionalCommentsAction?.restoreForm?.();
    },
    setIsEditing: (value: boolean) => {
      emergencyContactAction?.setIsEditing?.(value);
      generalAction?.setIsEditing?.(value);
      backgroundAction?.setIsEditing?.(value);
      allergiesAction?.setIsEditing?.(value);
      medicalAuthorizationAction?.setIsEditing?.(value);
      additionalCommentsAction?.setIsEditing?.(value);
    },
    isEditing:
      emergencyContactAction?.isEditing ||
      generalAction?.isEditing ||
      backgroundAction?.isEditing ||
      allergiesAction?.isEditing ||
      medicalAuthorizationAction?.isEditing ||
      additionalCommentsAction?.isEditing ||
      false,
    isDirty:
      emergencyContactAction?.isDirty ||
      generalAction?.isDirty ||
      backgroundAction?.isDirty ||
      allergiesAction?.isDirty ||
      medicalAuthorizationAction?.isDirty ||
      additionalCommentsAction?.isDirty ||
      false,
  };

  const prevDependencyKey = useRef<string>();

  useEffect(() => {
    if (prevDependencyKey.current !== dependencyKey) {
      register(FormActionKeys.MedicalStep, { ...combinedAction });
      updateIsDirty(FormActionKeys.MedicalStep, combinedAction.isDirty ?? false);
      updateIsEditing(FormActionKeys.MedicalStep, combinedAction.isEditing ?? false);
      prevDependencyKey.current = dependencyKey;
    }
  }, [register, dependencyKey]);

  async function handleSubmit() {
    if (isSubmitting) return;
    const allFormsValid = await validate();

    if (!allFormsValid) {
      setAlert('Hay campos obligatorios sin completar');

      const firstInvalidSection = Object.entries(isValid).find(([_, isValid]) => !isValid)?.[0];

      if (firstInvalidSection && sectionRefs.current[firstInvalidSection]) {
        sectionRefs.current[firstInvalidSection]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      for (const [key, value] of Object.entries(isValid)) {
        if (!value) {
          const action = getAction(`${key}Form`);
          if (action && action.setIsEditing) {
            action.setIsEditing(true);
            const isValidForm = await action.validate?.();
            setIsValid((prev) => ({ ...prev, [key]: isValidForm }));
          }
        }
      }
      return;
    }

    setIsSubmitting(true);

    const action = getAction(FormActionKeys.MedicalStep);
    if (action && action.isEditing && action.isDirty) {
      const result = action?.submitForm ? await action.submitForm() : { success: false };
      if (result && !result.success) {
        setAlert('Ocurrió un error al actualizar los datos');
        setIsSubmitting(false);
        return;
      }
      setAlert('Datos actualizados exitosamente', 'success');
    }

    await onUpdateInscription({ medical_step_completed_at: new Date().toISOString() });
    setIsSubmitting(true);
    onNext();
  }

  return (
    <>
      {!isSectionHidden(sectionFields.emergencyContact, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.emergencyContact = el)}>
          <EmergencyContactSection
            studentId={studentId}
            studentAdditionalInfo={studentAdditionalInfo}
            hiddenFields={hiddenFields}
          />
        </div>
      ) : null}

      {!isSectionHidden(sectionFields.generalInfo, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.general = el)}>
          <GeneralSection
            studentAdditionalInfo={studentAdditionalInfo}
            onIsValid={handleIsValid}
            hasValidationErrors={hasValidationErrors}
            hiddenFields={hiddenFields}
          />
        </div>
      ) : null}

      {!isSectionHidden(sectionFields.background, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.background = el)}>
          <BackgroundSection
            studentAdditionalInfo={studentAdditionalInfo}
            onIsValid={handleIsValid}
            hasValidationErrors={hasValidationErrors}
            hiddenFields={hiddenFields}
          />
        </div>
      ) : null}

      {!isSectionHidden(sectionFields.allergies, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.allergies = el)}>
          <AllergiesSection studentAdditionalInfo={studentAdditionalInfo} hiddenFields={hiddenFields} />
        </div>
      ) : null}

      {!isSectionHidden(sectionFields.medicalAuthorization, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.medicalAuthorization = el)}>
          <MedicalAuthorizationSection
            studentAdditionalInfo={studentAdditionalInfo}
            onIsValid={handleIsValid}
            hasValidationErrors={hasValidationErrors}
            hiddenFields={hiddenFields}
          />
        </div>
      ) : null}

      {!isSectionHidden(sectionFields.additionalComments, hiddenFields) ? (
        <div ref={(el) => (sectionRefs.current.additionalComments = el)}>
          <AdditionalCommentsSection studentAdditionalInfo={studentAdditionalInfo} hiddenFields={hiddenFields} />
        </div>
      ) : null}

      <Button
        className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-2 px-5 py-2.5"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Continuar'}
      </Button>
    </>
  );
}
