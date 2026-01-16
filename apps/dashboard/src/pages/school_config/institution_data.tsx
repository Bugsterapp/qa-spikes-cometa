import { useState } from 'react';
import { Button } from '@cometa/recreo/components/ui/Button';
import IcEditPencil from 'public/assets/icons/ic_edit_pencil.svg';
import { PageStateHandler } from '../../components/school_config';
import Layout from '../../components/layouts';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import { useSelectedSchool, useGetMembership } from '../../guards/AuthGuard';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import useAlert from '../../hooks/useAlert';
import { useSendEvent } from '../../hooks/useSendEvent';
import { TrackEvents } from '../../constants/events';
import { useSession } from 'next-auth/react';
import { ServiceClient, api } from '../../utils/api';
import { useMutation } from '@tanstack/react-query';
import type { PatchedDashboardSchoolUpdate } from '@cometa/trpc/src/types';
import { InstitutionForm, InstitutionFormValues } from '../../components/InstitutionForm';
import { compressImage } from '../../utils/file-utils';

type SchoolUpdatePayload = Omit<PatchedDashboardSchoolUpdate, 'logo'> & {
  logo?: File;
};

export default function InstitutionDataPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const { data: session } = useSession();
  const sendTrackEvent = useSendEvent();

  useSendPageViewedEvent('Datos de la Institución', selectedSchool);

  const allowedMemberships = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
  const { isEnabled: enableInstitutionDataFlag } = useFlagWithVariableMatching('enable_institution_data');
  const canViewPage = allowedMemberships.includes(membership ?? '') && enableInstitutionDataFlag;

  const [isEditing, setIsEditing] = useState(false);
  const [triggerReset, setTriggerReset] = useState(false);

  const isSchoolOnboarding = selectedSchool?.status === 'onboarding';

  const {
    data: school,
    isPending: isLoading,
    refetch,
  } = api.schools.schoolDetail.useQuery(
    { id: selectedSchool?.id ?? '' },
    {
      enabled: !!selectedSchool?.id,
    }
  );
  const updateSchoolMutation = useMutation({
    mutationFn: async (payload: SchoolUpdatePayload) => {
      if (!selectedSchool?.id) {
        throw new Error('School ID is required');
      }

      await ServiceClient.schoolsPartialUpdate(selectedSchool.id, payload as PatchedDashboardSchoolUpdate, {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      });
    },
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Datos actualizados con éxito!',
      });
      setIsEditing(false);
      refetch();

      sendTrackEvent(TrackEvents.institution.updated);
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al actualizar los datos de la institución',
      });
    },
  });

  const onSubmit = async (formValues: InstitutionFormValues, logoFile?: File) => {
    try {
      const updatePayload: SchoolUpdatePayload = {};

      if (formValues.phone?.trim()) {
        updatePayload.phone = formValues.phone.replaceAll(' ', '');
      }

      if (formValues.email?.trim()) {
        updatePayload.email = formValues.email.trim();
      }

      if (isSchoolOnboarding && formValues.name?.trim()) {
        updatePayload.name = formValues.name.trim();
      }

      if (logoFile) {
        const compressedLogo = await compressImage(logoFile, 500);
        updatePayload.logo = compressedLogo;
      }

      updateSchoolMutation.mutate(updatePayload);
    } catch {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al actualizar los datos de la institución',
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTriggerReset(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <PageStateHandler canViewPage={canViewPage} isLoading={isLoading || !school} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="w-full top-0 sticky z-10 bg-white">
          <div className="w-full max-w-[540px] mx-auto pt-[24px] pb-[8px] px-8 sm:px-0">
            <div className="flex items-center justify-between h-[72px] gap-[24px]">
              <h1 className="text-[#212B36] text-2xl font-bold font-lota">Datos de tu institución</h1>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="medium"
                  onClick={handleEdit}
                  leftIcon={<IcEditPencil className="w-4 h-4" />}
                  className="hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
                >
                  <span className="text-[#22222A] text-sm font-semibold leading-4 tracking-[0.07px] font-lota">
                    Editar
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start px-8 sm:px-0 pt-0 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[540px] mx-auto">
            <InstitutionForm
              initialValues={{
                name: school?.name ?? '',
                phone: school?.phone ?? '',
                email: school?.email ?? '',
              }}
              existingLogo={school?.logo || undefined}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              isLoading={updateSchoolMutation.isPending}
              isEditing={isEditing}
              showNameField={isSchoolOnboarding}
              showActions={isEditing}
              submitButtonText="Guardar"
              cancelButtonText="Cancelar"
              triggerReset={triggerReset}
              onResetTriggered={() => setTriggerReset(false)}
            />
          </div>
        </div>
      </div>
    </PageStateHandler>
  );
}

InstitutionDataPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Datos de la Institución" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

InstitutionDataPage.auth = true;
