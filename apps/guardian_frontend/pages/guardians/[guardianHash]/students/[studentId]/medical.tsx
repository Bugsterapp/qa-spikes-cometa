'use client';

import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToggle } from '@cometa/hooks';
import { GuardianStudent } from '@cometa/trpc/src/types';
import {
  AdditionalComments,
  additionalCommentsSchema,
  AdditionalCommentsSection,
  Allergies,
  allergiesSchema,
  AllergiesSection,
  Background,
  backgroundSchema,
  BackgroundSection,
  EmergencyContact,
  emergencyContactSchema,
  EmergencyContactSection,
  FormAdditionalCommentsValues,
  FormAllergiesValues,
  formatBooleanField,
  FormBackgroundValues,
  FormEmergencyContactValues,
  FormGeneralInfoValues,
  FormMedicalAuthorizationValues,
  GeneralInfo,
  generalInfoSchema,
  GeneralSection,
  MedicalAuthorization,
  medicalAuthorizationSchema,
  MedicalAuthorizationSection,
} from '~/components/MedicalInfo';
import { isSectionHidden, sectionFields } from '../../admissions/[admissionId]/medical-form';
import { cn } from '@cometa/utils';

type FormSection<TFormValues extends FieldValues = FieldValues> = {
  form: UseFormReturn<TFormValues>;
  defaultValues: TFormValues;
};

type FormSections = {
  emergencyContact: FormSection<FormEmergencyContactValues>;
  generalInfo: FormSection<FormGeneralInfoValues>;
  background: FormSection<FormBackgroundValues>;
  allergies: FormSection<FormAllergiesValues>;
  medicalAuthorization: FormSection<FormMedicalAuthorizationValues>;
  additionalComments: FormSection<FormAdditionalCommentsValues>;
};

type FormSectionStatus = {
  isEditing: boolean;
  isLoading: boolean;
};

type FormSectionsState = {
  emergencyContact: FormSectionStatus;
  generalInfo: FormSectionStatus;
  background: FormSectionStatus;
  allergies: FormSectionStatus;
  medicalAuthorization: FormSectionStatus;
  additionalComments: FormSectionStatus;
};

type Action<T extends keyof FormSectionsState> = {
  section: T;
  field: keyof FormSectionsState[T];
  value: boolean;
};

const initialFormSectionsState: FormSectionsState = {
  emergencyContact: { isEditing: false, isLoading: false },
  generalInfo: { isEditing: false, isLoading: false },
  background: { isEditing: false, isLoading: false },
  allergies: { isEditing: false, isLoading: false },
  medicalAuthorization: { isEditing: false, isLoading: false },
  additionalComments: { isEditing: false, isLoading: false },
};

function reducer<T extends keyof FormSectionsState>(state: FormSectionsState, action: Action<T>): FormSectionsState {
  const currentState = state[action.section];
  const updatedState = {
    ...currentState,
    [action.field]: action.value,
  };

  if (currentState[action.field] === action.value) {
    return state;
  }

  return {
    ...state,
    [action.section]: updatedState,
  };
}

function MedicalInfoPage() {
  const router = useRouter();
  const { guardianHash, studentId } = router.query;

  const [formSectionsState, dispatch] = useReducer(reducer, initialFormSectionsState);

  const {
    medicalInfo,
    emergencyContact,
    generalInfo,
    background,
    allergies,
    medicalAuthorization,
    additionalComments,
  } = useMedicalInfo(studentId as string);

  const { hiddenFields } = useHiddenFields(studentId as string);

  const emergencyContactDefaultValues = useMemo(
    () => ({
      emergency_contact_id: emergencyContact?.id || undefined,
      emergency_contact_name: emergencyContact?.name || undefined,
      emergency_contact_phone: emergencyContact?.phone || undefined,
      emergency_contact_relationship: emergencyContact?.relationship || undefined,
    }),
    [emergencyContact]
  );

  const generalInfoDefaultValues = useMemo(
    () => ({
      blood_type_code: generalInfo?.blood_type_code || undefined,
      weight: generalInfo?.weight || undefined,
      height: generalInfo?.height || undefined,
      laterality: generalInfo?.laterality || undefined,
    }),
    [generalInfo]
  );

  const backgroundDefaultValues = useMemo(
    () => ({
      family_history: background?.family_history || undefined,
      personal_history: background?.personal_history || undefined,
      current_ailments: background?.current_ailments || undefined,
      recent_interventions: background?.recent_interventions || undefined,
      other_history: background?.other_history || undefined,
    }),
    [background]
  );

  const allergiesDefaultValues = useMemo(
    () => ({
      drug_allergies: allergies?.drug_allergies || undefined,
      food_allergies: allergies?.food_allergies || undefined,
      plant_allergies: allergies?.plant_allergies || undefined,
      other_allergies: allergies?.other_allergies || undefined,
    }),
    [allergies]
  );

  const medicalAuthorizationDefaultValues = useMemo(
    () => ({
      drugs: medicalAuthorization?.drugs || undefined,
      authorize_emergency_transfer: medicalAuthorization?.authorize_emergency_transfer || undefined,
      authorize_physical_activity: medicalAuthorization?.authorize_physical_activity || undefined,
    }),
    [medicalAuthorization]
  );

  const additionalCommentsDefaultValues = useMemo(
    () => ({
      pending_vaccines: additionalComments?.pending_vaccines || undefined,
      comments: additionalComments?.comments || undefined,
    }),
    [additionalComments]
  );

  const emergencyContactForm = useForm<FormEmergencyContactValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: emergencyContactDefaultValues,
  });

  const generalInfoForm = useForm<FormGeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: generalInfoDefaultValues,
  });

  const backgroundForm = useForm<FormBackgroundValues>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: backgroundDefaultValues,
  });

  const allergiesForm = useForm<FormAllergiesValues>({
    resolver: zodResolver(allergiesSchema),
    defaultValues: allergiesDefaultValues,
  });

  const medicalAuthorizationForm = useForm<FormMedicalAuthorizationValues>({
    resolver: zodResolver(medicalAuthorizationSchema),
    defaultValues: medicalAuthorizationDefaultValues,
  });

  const additionalCommentsForm = useForm<FormAdditionalCommentsValues>({
    resolver: zodResolver(additionalCommentsSchema),
    defaultValues: additionalCommentsDefaultValues,
  });

  const sections: FormSections = useMemo(
    () => ({
      emergencyContact: {
        form: emergencyContactForm,
        defaultValues: emergencyContactDefaultValues,
      },
      generalInfo: {
        form: generalInfoForm,
        defaultValues: generalInfoDefaultValues,
      },
      background: {
        form: backgroundForm,
        defaultValues: backgroundDefaultValues,
      },
      allergies: {
        form: allergiesForm,
        defaultValues: allergiesDefaultValues,
      },
      medicalAuthorization: {
        form: medicalAuthorizationForm,
        defaultValues: medicalAuthorizationDefaultValues,
      },
      additionalComments: {
        form: additionalCommentsForm,
        defaultValues: additionalCommentsDefaultValues,
      },
    }),
    [medicalInfo]
  );

  const { toggle: isOpen, onOpen, onClose } = useToggle();

  const handleDiscardOnClickBack = useCallback(() => {
    const isAnyDirty = Object.values(sections).some(({ form }) => form.formState.isDirty);
    const hasUnsavedChanges = Object.keys(formSectionsState).some((section) => {
      const currentSection = section as keyof FormSectionsState;
      return formSectionsState[currentSection].isEditing;
    });

    if (hasUnsavedChanges && isAnyDirty) {
      onOpen();
      return;
    }

    router.push(`/guardians/${guardianHash}/students/${studentId}`);
  }, [formSectionsState, sections, router, guardianHash, studentId, onOpen]);

  const updateFormSectionState = useCallback(
    <T extends keyof FormSectionsState>(
      section: T,
      field: keyof FormSectionsState[T] & keyof FormSectionStatus,
      value: boolean
    ) => {
      dispatch({ section, field, value });
    },
    []
  );

  function setIsEditing(section: keyof FormSectionsState, value: boolean) {
    updateFormSectionState(section, 'isEditing', value);
  }

  function setIsLoading(section: keyof FormSectionsState, value: boolean) {
    updateFormSectionState(section, 'isLoading', value);
  }

  function restore() {
    Object.values(sections).forEach(({ form: { reset }, defaultValues }) => {
      reset(defaultValues);
    });
  }

  function handleDiscard() {
    restore();
    Object.keys(sections).forEach((section) => {
      setIsEditing(section as keyof FormSectionsState, false);
      setIsLoading(section as keyof FormSectionsState, false);
    });
    onClose();
  }

  useEffect(() => {
    restore();
  }, [medicalInfo]);

  return (
    <main className="px-5 py-6 flex flex-col gap-6">
      <div onClick={handleDiscardOnClickBack} className="flex gap-3 items-center hover:cursor-pointer">
        <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
        <span className="text-sm font-semibold uppercase">Volver</span>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-bold text-[#22222A]">Ficha médica</h1>
        <p className="text-sm text-[#535765]">Información médica del estudiante disponible para uso del colegio.</p>
      </header>

      <section className="flex flex-col gap-4">
        <EmergencyContactSection
          emergencyContact={emergencyContact}
          form={emergencyContactForm}
          defaultValues={emergencyContactDefaultValues}
          isEditing={formSectionsState.emergencyContact.isEditing}
          isLoading={formSectionsState.emergencyContact.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('emergencyContact', value)}
          setIsLoading={(value: boolean) => setIsLoading('emergencyContact', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.emergencyContact, hiddenFields) })}
        />

        <GeneralSection
          generalInfo={generalInfo}
          form={generalInfoForm}
          defaultValues={generalInfoDefaultValues}
          isEditing={formSectionsState.generalInfo.isEditing}
          isLoading={formSectionsState.generalInfo.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('generalInfo', value)}
          setIsLoading={(value: boolean) => setIsLoading('generalInfo', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.generalInfo, hiddenFields) })}
        />

        <BackgroundSection
          background={background}
          form={backgroundForm}
          defaultValues={backgroundDefaultValues}
          isEditing={formSectionsState.background.isEditing}
          isLoading={formSectionsState.background.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('background', value)}
          setIsLoading={(value: boolean) => setIsLoading('background', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.background, hiddenFields) })}
        />

        <MedicalAuthorizationSection
          medicalAuthorization={medicalAuthorization}
          form={medicalAuthorizationForm}
          defaultValues={medicalAuthorizationDefaultValues}
          isEditing={formSectionsState.medicalAuthorization.isEditing}
          isLoading={formSectionsState.medicalAuthorization.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('medicalAuthorization', value)}
          setIsLoading={(value: boolean) => setIsLoading('medicalAuthorization', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.medicalAuthorization, hiddenFields) })}
        />

        <AllergiesSection
          allergies={allergies}
          form={allergiesForm}
          defaultValues={allergiesDefaultValues}
          isEditing={formSectionsState.allergies.isEditing}
          isLoading={formSectionsState.allergies.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('allergies', value)}
          setIsLoading={(value: boolean) => setIsLoading('allergies', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.allergies, hiddenFields) })}
        />

        <AdditionalCommentsSection
          additionalComments={additionalComments}
          form={additionalCommentsForm}
          defaultValues={additionalCommentsDefaultValues}
          isEditing={formSectionsState.additionalComments.isEditing}
          isLoading={formSectionsState.additionalComments.isLoading}
          isOpen={isOpen}
          onClose={onClose}
          onDiscard={handleDiscard}
          setIsEditing={(value: boolean) => setIsEditing('additionalComments', value)}
          setIsLoading={(value: boolean) => setIsLoading('additionalComments', value)}
          className={cn({ hidden: isSectionHidden(sectionFields.additionalComments, hiddenFields) })}
        />
      </section>
    </main>
  );
}

function useMedicalInfo(studentId: string) {
  const { data: studentInfo } = api.student.getStudentAdditionalInfo.useQuery({ studentId }, { enabled: !!studentId });
  const medicalInfo = studentInfo?.medical_info;

  const authorizeEmergencyTransfer = medicalInfo?.authorize_emergency_transfer;
  const authorizeTransferLabel =
    authorizeEmergencyTransfer !== undefined ? (authorizeEmergencyTransfer ? 'Sí' : 'No') : '-';

  const emergencyContactId = medicalInfo?.emergency_contact_id;
  const { data: student } = api.student.get.useQuery(
    { id: studentId as string },
    { enabled: !!emergencyContactId && !!studentId }
  ) as {
    data: GuardianStudent;
  };

  const guardians = student?.guardians || [];

  let emergencyContact: EmergencyContact = {
    id: medicalInfo?.emergency_contact_id || 'Otro',
    name: medicalInfo?.emergency_contact_name,
    phone: medicalInfo?.emergency_contact_phone,
    relationship: medicalInfo?.emergency_contact_relationship,
  };

  if (guardians.length) {
    const guardian = guardians.find((guardian) => guardian.id === emergencyContactId);
    if (guardian) {
      emergencyContact = {
        id: guardian.id,
        name: `${guardian.first_name} ${guardian.last_name}`,
        phone: guardian.phone,
        relationship: guardian.relationship,
      };
    }
  }

  const generalInfo: GeneralInfo = {
    blood_type_code: medicalInfo?.blood_type_code,
    weight: medicalInfo?.weight,
    height: medicalInfo?.height,
    laterality: medicalInfo?.laterality,
  };

  const background: Background = {
    family_history: medicalInfo?.family_history === '' ? [] : medicalInfo?.family_history?.split(', '),
    personal_history: medicalInfo?.personal_history === '' ? [] : medicalInfo?.personal_history?.split(', '),
    current_ailments: medicalInfo?.current_ailments === '' ? [] : medicalInfo?.current_ailments?.split(', '),
    other_history: medicalInfo?.other_history,
    recent_interventions: medicalInfo?.recent_interventions,
  };

  const allergies: Allergies = {
    drug_allergies: medicalInfo?.drug_allergies,
    food_allergies: medicalInfo?.food_allergies,
    plant_allergies: medicalInfo?.plant_allergies,
    other_allergies: medicalInfo?.other_allergies,
  };

  const medicalAuthorization: MedicalAuthorization = {
    drugs: medicalInfo?.drugs === '' ? [] : medicalInfo?.drugs?.split(', '),
    authorize_emergency_transfer: formatBooleanField(medicalInfo?.authorize_emergency_transfer),
    authorize_physical_activity: formatBooleanField(medicalInfo?.authorize_physical_activity),
  };

  const additionalComments: AdditionalComments = {
    pending_vaccines: medicalInfo?.pending_vaccines,
    comments: medicalInfo?.comments,
  };

  return {
    studentInfo,
    medicalInfo,
    emergencyContact,
    generalInfo,
    background,
    allergies,
    medicalAuthorization,
    additionalComments,
    authorizeTransferLabel,
  };
}

function useHiddenFields(studentId: string) {
  const { data: studentInfo } = api.students.getStudent.useQuery({ studentId }, { enabled: !!studentId });
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: studentInfo?.school_id as string },
    {
      enabled: !!studentInfo?.school_id,
    }
  );
  const hiddenFields = schoolConfig?.hidden_medical_form_fields?.split(',') ?? [];
  return { hiddenFields };
}

MedicalInfoPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Ficha médica</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

MedicalInfoPage.auth = true;

export default MedicalInfoPage;
