import * as Sentry from '@sentry/nextjs';
import { MainStudentEntity } from '@cometa/trpc/src/students/types';
import { InscriptionEntity, StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { PersonalSection, PhoneSection, AddressSection } from '../sections';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@cometa/recreo';
import { useAlert } from '~/hooks';
import { api } from '~/utils/api';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { useHandleMutate } from '../api';
import { GenderEnum } from '@cometa/trpc';

type PersonalStepProps = {
  student: MainStudentEntity | null | undefined;
  studentAdditionalInfo: StudentEntity | null | undefined;
  onUpdateInscription: (inscription: Partial<InscriptionEntity>) => Promise<void>;
  onNext: () => void;
};

type FormValues = {
  birthdate?: string;
  gender?: string;
  identifier?: string;
  nationality_code?: string;
  birth_place_id?: string;
  home_phone?: string;
  street?: string;
  interior_number?: string;
  neighborhood?: string;
  municipality?: string;
  state_id?: string;
  zip_code?: string;
};

type IsValidState = {
  personal: boolean;
  phone: boolean;
  address: boolean;
};

export function PersonalStep({ student, studentAdditionalInfo, onUpdateInscription, onNext }: PersonalStepProps) {
  const { register, getAction, updateIsDirty, updateIsEditing, getPersonalValues } = useFormActions();
  const { setAlert } = useAlert();
  const utils = api.useUtils();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState<IsValidState>({
    personal: true,
    phone: true,
    address: true,
  });
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    personal: null,
    phone: null,
    address: null,
  });

  const personalAction = getAction(FormActionKeys.PersonalForm);
  const phoneAction = getAction(FormActionKeys.PhoneForm);
  const addressAction = getAction(FormActionKeys.AddressForm);

  const actions = [personalAction, phoneAction, addressAction];
  const dependencyKey = actions.map((action) => `${action?.isEditing}-${action?.isDirty}`).join('-');

  const studentId = student?.id as string;

  const updateStudent = api.students.updateStudent.useMutation({
    onSuccess() {
      utils.students.getStudent.invalidate({ studentId });
    },
    onError(error) {
      Sentry.captureException(error);
    },
  });

  const createAdditionalInfo = api.student.createStudentAdditionalInfo.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
    },
    onError(error) {
      Sentry.captureException(error);
    },
  });

  const updateAdditionalInfo = api.student.updateStudentAdditionalInfo.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
    },
    onError(error) {
      Sentry.captureException(error);
    },
  });

  const handleUpdateStudent = useHandleMutate(updateStudent.mutateAsync);
  const handleCreateAdditionalInfo = useHandleMutate(createAdditionalInfo.mutateAsync);
  const handleUpdateAdditionalInfo = useHandleMutate(updateAdditionalInfo.mutateAsync);

  function handleIsValid(isValid: boolean, section: string) {
    setIsValid((prev) => {
      const newState = { ...prev, [section]: isValid };
      const anyInvalid = Object.values(newState).some((value) => !value);
      setHasValidationErrors(anyInvalid);
      return newState;
    });
  }

  async function validate() {
    const [personal, phone, address] = await Promise.all(
      actions.map((action) => (action?.validate ? action.validate() : Promise.resolve(true)))
    );

    setIsValid({
      personal,
      phone,
      address,
    });

    return personal && phone && address;
  }

  const combinedAction: FormAction = {
    submitForm: async () => {
      const data: FormValues = getPersonalValues() || {};

      let formattedBirthdate = '';
      if (data?.birthdate && data.birthdate.trim() !== '') {
        const parsedDate = parse(data.birthdate as string, 'dd/MM/yyyy', new Date());
        if (isValidDate(parsedDate)) {
          formattedBirthdate = format(parsedDate, 'yyyy-MM-dd');
        }
      }

      const payloadStudent = {
        studentId: student?.id as string,
        data: {
          ...data,
          birthdate: formattedBirthdate,
          first_name: student?.first_name || '',
          last_name: student?.last_name || '',
          identifier: data.identifier ?? null,
          gender: data.gender as GenderEnum,
        },
      };

      const payloadAdditionalInfo = {
        studentId,
        data: {
          student_id: studentId,
          nationality_code: data.nationality_code || null,
          birth_place_id: data.birth_place_id || null,
          address: {
            ...data,
            ...(studentAdditionalInfo?.address?.id ? { id: studentAdditionalInfo.address.id } : {}),
          },
        },
      };

      const handleAdditionalInfoMutation = studentAdditionalInfo
        ? handleUpdateAdditionalInfo
        : handleCreateAdditionalInfo;

      const [resultStudent, resultAdditionalInfo] = await Promise.all([
        handleUpdateStudent(payloadStudent),
        handleAdditionalInfoMutation(payloadAdditionalInfo),
      ]);

      return {
        success: resultStudent.success && resultAdditionalInfo.success,
      };
    },
    restoreForm: () => {
      personalAction?.restoreForm?.();
      phoneAction?.restoreForm?.();
      addressAction?.restoreForm?.();
    },
    setIsEditing: (value: boolean) => {
      personalAction?.setIsEditing?.(value);
      phoneAction?.setIsEditing?.(value);
      addressAction?.setIsEditing?.(value);
    },
    isEditing: personalAction?.isEditing || phoneAction?.isEditing || addressAction?.isEditing || false,
    isDirty: personalAction?.isDirty || phoneAction?.isDirty || addressAction?.isDirty || false,
  };

  const prevDependencyKey = useRef<string>();

  useEffect(() => {
    if (prevDependencyKey.current !== dependencyKey) {
      register(FormActionKeys.PersonalStep, { ...combinedAction });
      updateIsDirty(FormActionKeys.PersonalStep, combinedAction.isDirty ?? false);
      updateIsEditing(FormActionKeys.PersonalStep, combinedAction.isEditing ?? false);
      prevDependencyKey.current = dependencyKey;
    }
  }, [register, dependencyKey]);

  async function handleSave() {
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

    const action = getAction(FormActionKeys.PersonalStep);
    if (action && action.isEditing && action.isDirty) {
      const result = action?.submitForm ? await action.submitForm() : { success: false };
      if (result && !result.success) {
        setAlert('Ocurrió un error al actualizar los datos');
        setIsSubmitting(false);
        return;
      }
      setAlert('Datos actualizados exitosamente', 'success');
    }
    await onUpdateInscription({ personal_step_completed_at: new Date().toISOString() });
    setIsSubmitting(true);
    onNext();
  }

  return (
    <>
      <div ref={(el) => (sectionRefs.current.personal = el)}>
        <PersonalSection
          student={student}
          studentAdditionalInfo={studentAdditionalInfo}
          onIsValid={handleIsValid}
          hasValidationErrors={hasValidationErrors}
        />
      </div>
      <div ref={(el) => (sectionRefs.current.phone = el)}>
        <PhoneSection
          studentAdditionalInfo={studentAdditionalInfo}
          onIsValid={handleIsValid}
          hasValidationErrors={hasValidationErrors}
        />
      </div>
      <div ref={(el) => (sectionRefs.current.address = el)}>
        <AddressSection
          studentAdditionalInfo={studentAdditionalInfo}
          onIsValid={handleIsValid}
          hasValidationErrors={hasValidationErrors}
        />
      </div>

      <Button
        className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-2 px-5 py-2.5"
        onClick={handleSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Continuar'}
      </Button>
    </>
  );
}
