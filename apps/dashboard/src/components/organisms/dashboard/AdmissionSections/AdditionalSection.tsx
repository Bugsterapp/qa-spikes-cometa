import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { FormValues, MedicalSection, MedicalSectionCallbacks } from './MedicalSection';
import { useSession } from 'next-auth/react';
import { DynamicFormSection, DynamicSectionSkeletonList, useDynamicFormByCreatedBy } from '../DynamicForms';
import { GuardianLeadEntity } from '@cometa/trpc/src/admissions/types';

export function AdditionalSection({
  studentLeadId,
  schoolId,
  levelId,
  guardians,
}: {
  studentLeadId: string;
  schoolId: string;
  levelId?: string | null;
  guardians: GuardianLeadEntity[];
}) {
  const { data: session } = useSession();
  const guardianId = session?.user.id as string;
  const { medicalInfo, emergencyContact, authorizeTransferLabel } = useMedicalInfo(studentLeadId);
  const { forms, isLoading } = useDynamicFormByCreatedBy(schoolId);
  const utils = api.useUtils();
  const upsertMedicalForm = api.admissions.upsertMedicalForm.useMutation();

  function upsertForm(data: FormValues, callbacks: MedicalSectionCallbacks) {
    const emergencyContactId = data?.emergency_contact_id === 'Otro' ? null : data?.emergency_contact_id;

    upsertMedicalForm.mutate(
      {
        ...medicalInfo,
        blood_type: data.blood_type ?? '',
        weight: data.weight ?? 0,
        height: data.height ?? 0,
        laterality: data.laterality ?? '',
        family_history: data.family_history?.join(', ') ?? '',
        personal_history: data.personal_history?.join(', ') ?? '',
        current_ailments: data.current_ailments?.join(', ') ?? '',
        other_history: data.other_history ?? '',
        recent_interventions: data.recent_interventions ?? '',
        drugs: data.drugs?.join(', '),
        authorize_emergency_transfer: data?.authorize_emergency_transfer === 'Sí',
        drug_allergies: data.drug_allergies,
        food_allergies: data.food_allergies,
        plant_allergies: data.plant_allergies,
        other_allergies: data.other_allergies,
        dietary_restrictions: data.dietary_restrictions ?? '',
        has_private_doctor: data.has_private_doctor === 'Sí',
        doctor_name: data.doctor_name ?? '',
        doctor_phone: data.doctor_phone ?? '',
        doctor_clinic: data.doctor_clinic ?? '',
        has_all_vaccines: data.has_all_vaccines === 'Sí',
        pending_vaccines: data.pending_vaccines ?? '',
        comments: data.comments ?? '',
        student_lead_id: studentLeadId,
        emergency_contact_id: emergencyContactId,
        emergency_contact_name: data?.emergency_contact_name ?? '',
        emergency_contact_phone: data?.emergency_contact_phone ?? '',
        emergency_contact_relationship: data?.emergency_contact_relationship ?? '',
        has_allergies: medicalInfo?.has_allergies ?? false,
        require_drugs: medicalInfo?.require_drugs ?? false,
        authorize_physical_activity: medicalInfo?.authorize_physical_activity ?? false,
        has_private_insurance: medicalInfo?.has_private_insurance ?? false,
        accept_truthfulness: medicalInfo?.accept_truthfulness ?? false,
        changed_by: guardianId,
      },
      {
        onSuccess: async () => {
          await utils.admissions.getMedicalForm.invalidate({ studentLeadId });
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
          emergencyContact={emergencyContact}
          authorizeTransferLabel={authorizeTransferLabel}
          guardians={guardians.map((guardian) => ({
            id: guardian.external_id,
            first_name: guardian.first_name,
            last_name: guardian.last_name,
            phone: guardian.phone,
            relationship: guardian.relationship,
          }))}
          upsertForm={upsertForm}
        />
      ),
      name: 'Ficha médica',
    },
  ];

  forms.forEach((form) => {
    sections.push({
      component: <DynamicFormSection formEntity={form} answeredFor={studentLeadId} validations={validations} />,
      name: form.name as string,
    });
  });

  const sortedSections = [...sections].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  return (
    <section className="flex flex-col gap-y-4">
      {isLoading ? (
        <DynamicSectionSkeletonList />
      ) : (
        sortedSections.map((section) => <div key={section.name}>{section.component}</div>)
      )}
    </section>
  );
}

function useMedicalInfo(studentLeadId: string) {
  const selectedSchool = useSelectedSchool();

  const { data: medicalInfo } = api.admissions.getMedicalForm.useQuery({ studentLeadId }, { enabled: !!studentLeadId });

  const authorizeEmergencyTransfer = medicalInfo?.authorize_emergency_transfer;
  const authorizeTransferLabel =
    authorizeEmergencyTransfer !== undefined ? (authorizeEmergencyTransfer ? 'Sí' : 'No') : '-';

  const emergencyContactId = medicalInfo?.emergency_contact_id;
  const { data: guardian } = api.guardian.getGuardianById.useQuery(
    { id: emergencyContactId as string, schoolId: selectedSchool?.id as string },
    { enabled: !!emergencyContactId }
  );
  const { data: applicationForm } = api.admissions.getApplicationForm.useQuery(
    { studentLeadId },
    { enabled: !!emergencyContactId }
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
      relationship: applicationForm?.guardian_relationship,
    };
  }

  return { medicalInfo, emergencyContact, authorizeTransferLabel };
}
