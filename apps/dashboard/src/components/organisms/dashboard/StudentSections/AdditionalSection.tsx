import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { FormValues, MedicalSection, MedicalSectionCallbacks } from '../AdmissionSections/MedicalSection';
import { DynamicFormSection, DynamicSectionSkeletonList, useDynamicFormByCreatedBy } from '../DynamicForms';
import { Guardian } from '@cometa/trpc/src/types';

export function AdditionalSection({
  studentId,
  schoolId,
  guardians,
  levelId,
}: {
  studentId: string;
  schoolId: string;
  guardians: Guardian[];
  levelId?: string;
}) {
  const { medicalInfo, emergencyContact, authorizeTransferLabel } = useMedicalInfo(studentId);
  const { forms, isLoading } = useDynamicFormByCreatedBy(schoolId);

  const utils = api.useUtils();
  const upsertMedicalForm = api.students.updateMedicalInfo.useMutation();

  function upsertForm(data: FormValues, callbacks: MedicalSectionCallbacks) {
    const weight = data.weight ? Number(data.weight) : undefined;
    const height = data.height ? Number(data.height) : undefined;
    const familyHistory = data.family_history && data.family_history?.length > 0 ? data.family_history?.join(', ') : '';
    const personalHistory =
      data.personal_history && data.personal_history?.length > 0 ? data.personal_history?.join(', ') : '';
    const currentAilments =
      data.current_ailments && data.current_ailments?.length > 0 ? data.current_ailments?.join(', ') : '';
    const drugs = data.drugs && data.drugs?.length > 0 ? data.drugs?.join(', ') : '';
    const emergencyContactId = data?.emergency_contact_id === 'Otro' ? null : data?.emergency_contact_id;

    upsertMedicalForm.mutate(
      {
        studentId,
        data: {
          blood_type_code: data.blood_type ?? '',
          weight,
          height,
          laterality: data.laterality,
          family_history: familyHistory,
          personal_history: personalHistory,
          current_ailments: currentAilments,
          other_history: data.other_history ?? '',
          recent_interventions: data.recent_interventions ?? '',
          drugs,
          authorize_emergency_transfer: data?.authorize_emergency_transfer === 'Sí',
          drug_allergies: data.drug_allergies ?? '',
          food_allergies: data.food_allergies ?? '',
          plant_allergies: data.plant_allergies ?? '',
          other_allergies: data.other_allergies ?? '',
          dietary_restrictions: data.dietary_restrictions ?? '',
          has_private_doctor: data?.has_private_doctor === 'Sí',
          doctor_name: data?.doctor_name ?? '',
          doctor_phone: data?.doctor_phone ?? '',
          doctor_clinic: data?.doctor_clinic ?? '',
          has_all_vaccines: data.has_all_vaccines === 'Sí',
          pending_vaccines: data.pending_vaccines ?? '',
          comments: data.comments ?? '',
          emergency_contact_id: emergencyContactId,
          emergency_contact_name: data?.emergency_contact_name ?? '',
          emergency_contact_phone: data?.emergency_contact_phone ?? '',
          emergency_contact_relationship: data?.emergency_contact_relationship ?? '',
          has_allergies: medicalInfo?.has_allergies ?? false,
          require_drugs: medicalInfo?.require_drugs ?? false,
          authorize_physical_activity: medicalInfo?.authorize_physical_activity ?? false,
          has_private_insurance: medicalInfo?.has_private_insurance ?? false,
        },
      },
      {
        onSuccess: async () => {
          await utils.students.retrieveStudentAdditionalInfo.invalidate({ studentId });
          callbacks.onSuccess();
        },
        onError: () => {
          callbacks.onError();
        },
      }
    );
  }

  const validations = levelId ? { visibleConditionValue: levelId } : undefined;

  const sections = [
    {
      component: (
        <MedicalSection
          medicalInfo={medicalInfo}
          guardians={guardians}
          emergencyContact={emergencyContact}
          authorizeTransferLabel={authorizeTransferLabel}
          upsertForm={upsertForm}
        />
      ),
      name: 'Ficha médica',
    },
  ];

  forms.forEach((form) => {
    sections.push({
      component: <DynamicFormSection formEntity={form} answeredFor={studentId} validations={validations} />,
      name: form.name as string,
    });
  });

  const sortedSections = [...sections].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  return (
    <section className="flex flex-col gap-y-4 pb-4">
      {isLoading ? (
        <DynamicSectionSkeletonList />
      ) : (
        sortedSections.map((section) => <div key={section.name}>{section.component}</div>)
      )}
    </section>
  );
}

function useMedicalInfo(studentId: string) {
  const selectedSchool = useSelectedSchool();

  const { data } = api.students.retrieveStudentAdditionalInfo.useQuery({ studentId }, { enabled: !!studentId });
  const medicalInfo = data?.medical_info;

  const authorizeEmergencyTransfer = medicalInfo?.authorize_emergency_transfer;
  const authorizeTransferLabel =
    authorizeEmergencyTransfer !== undefined ? (authorizeEmergencyTransfer ? 'Sí' : 'No') : '-';

  const emergencyContactId = medicalInfo?.emergency_contact_id;
  const { data: guardian } = api.guardian.getGuardianById.useQuery(
    { id: emergencyContactId as string, schoolId: selectedSchool?.id as string },
    { enabled: !!emergencyContactId && !!studentId }
  );

  let emergencyContact = {
    name: medicalInfo?.emergency_contact_name,
    phone: medicalInfo?.emergency_contact_phone,
    relationship: medicalInfo?.emergency_contact_relationship,
  };
  if (guardian) {
    emergencyContact = {
      name: `${guardian?.first_name} ${guardian?.last_name}`,
      phone: guardian?.phone,
      relationship: '',
    };
  }

  return { studentInfo: data, medicalInfo, emergencyContact, authorizeTransferLabel };
}
