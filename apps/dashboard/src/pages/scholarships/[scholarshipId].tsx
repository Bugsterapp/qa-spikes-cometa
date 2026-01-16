import { Button, Dialog } from '@cometa/recreo';
import { AdjustmentDTO } from '@cometa/trpc/src/concepts/types';
import { Status2B3Enum } from '@cometa/trpc/src/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SideFormScholarshipsCreate } from '.';
import MassiveScholarshipAssignment from '../../components/scholarships/ScholarshipMassiveAssign';
import { TabsWrapper as Tabs, useTab } from '../../components/ui/Tabs';
import IcStudents from '/public/assets/icons/ic_students.svg';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import IcEdit from '/public/assets/icons/recreo/ic_edit_recreo.svg';
import Sheet from '/src/components/atoms/Sheet';
import ThreeDotsDropdown from '/src/components/atoms/ThreeDotsDropdown';
import BackButton from '/src/components/BackButton';
import { useFlag, useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import Layout from '/src/components/layouts';
import { useOnboardingVideosStore, ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { useSelectedSchool } from '../../guards/AuthGuard';
import { OnboardingVideoRenderer } from '../../components/onboarding/OnboardingVideoRenderer';
import ButtonOld from '/src/components/organisms/dashboard/Button';
import ScholarshipDetailInfo from '/src/components/organisms/dashboard/scholarship/ScholarshipDetail';
import ScholarshipsStudentsTable from '/src/components/organisms/dashboard/scholarshipsStudents';
import useAlert from '/src/hooks/useAlert';
import { api } from '/src/utils/api';

const ScholarshipsDetail = () => {
  const router = useRouter();
  const scholarshipId = router.query.scholarshipId as string;
  const selectedSchool = useSelectedSchool();
  const [isAssignmentSheetOpen, setIsAssignmentSheetOpen] = useState(false);
  const [createScholarshipOpen, setCreateScholarshipOpen] = useState(false);
  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);
  const { setAlertState } = useAlert();
  const utils = api.useUtils();

  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedAssignmentVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.SCHOLARSHIP_ASSIGNMENT);

  const shouldShowVideoOnLoad = showVideoFeature && !hasWatchedAssignmentVideo;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowVideoOnLoad);

  useEffect(() => {
    setShowOnboarding(shouldShowVideoOnLoad);
  }, [shouldShowVideoOnLoad]);

  const {
    data: scholarship,
    isPending: isLoading,
    error: scholarshipError,
  } = api.scholarships.getScholarshipById.useQuery(
    {
      scholarshipId,
    },
    {
      staleTime: 1000,
    }
  );

  useEffect(() => {
    if (scholarshipError) {
      setAlertState({
        open: true,
        message: 'No se pudo cargar la beca',
        severity: 'error',
      });
      router.back();
    }
  }, [scholarshipError]);

  const getTextAlert = (error: any): string | null => {
    if (error.data?.cause?.message === 'AdjustmentCannotBeDeletedException') {
      if (error.message?.includes('is assigned to a student')) {
        return 'No se puede eliminar la beca porque está asignada a un estudiante';
      }

      if (error.message?.includes('has been applied to one payment or more payments')) {
        return 'No se puede eliminar la beca porque ha sido aplicada a uno o más pagos';
      }
    }
    return null;
  };

  const mutationDelete = api.scholarships.delete.useMutation({
    onError: (error) => {
      const textAlert = getTextAlert(error);
      setAlertState({
        open: true,
        message: textAlert || 'La beca no puede ser eliminada',
        severity: 'error',
      });
      setAlertToCloseSheet(false);
    },
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setAlertState({
        open: true,
        message: '¡Beca eliminada con éxito!',
        severity: 'success',
      });
      await utils.schools.schoolsScholarshipsList.invalidate();
      setAlertToCloseSheet(false);
      router.push('/scholarships');
    },
  });

  const handleDelete = () => {
    mutationDelete.mutate({ id: scholarshipId });
  };

  const { tab, handleChangeTab } = useTab('information');

  const tabsScholarshipsData = [
    {
      value: 'information',
      label: 'Información general',
    },
    {
      value: 'students-assigned',
      label: 'Estudiantes asignados',
    },
  ];

  const handleMassiveAssignment = () => {
    setIsAssignmentSheetOpen(true);
  };

  const [updateScholarshipFlag] = useFlag('update_scholarship');
  const [deleteScholarshipFlag] = useFlag('delete_scholarship');
  const [showScholarshipsMassAssignFlag] = useFlag('hk_show_scholarships_mass_assign');

  if (showOnboarding) {
    return (
      <OnboardingVideoRenderer
        videoType="assignment"
        onComplete={() => setShowOnboarding(false)}
        contextData={{ selectedSchool }}
      />
    );
  }

  return (
    <div className="flex flex-col antialiased font-lota">
      <div className="flex items-center h-full px-8 pt-4">
        <BackButton destination="/scholarships" label="VOLVER" />
      </div>
      <div className="sticky z-20 flex flex-col px-10 bg-white">
        <div className="flex flex-row items-center justify-between w-full py-4 bg-white">
          {isLoading ? (
            <div className="w-64 h-8 bg-gray-200 rounded animate-pulse" />
          ) : (
            <h1 className="text-[#212B36] text-xl leading-[30px] font-bold">{scholarship?.name}</h1>
          )}
          <div className="flex items-center gap-2">
            {showScholarshipsMassAssignFlag?.enabled && (
              <ButtonOld
                onClick={handleMassiveAssignment}
                className="flex h-10 gap-2"
                data-testid="massiveAssignment-btn"
              >
                <IcStudents />
                Asignar estudiantes
              </ButtonOld>
            )}
            {(deleteScholarshipFlag?.enabled || updateScholarshipFlag?.enabled) && (
              <ThreeDotsDropdown classNameContent="p-2.5">
                {updateScholarshipFlag?.enabled && (
                  <DropdownMenu.Item className="text-gray-900 rounded-md flex items-center justify-start outline-none data-[disabled]:text-[#919EAB] data-[disabled]:pointer-events-none data-[highlighted]:bg-white data-[highlighted]:text-gray-700">
                    <Button
                      variant="text"
                      className="flex gap-2.5 px-3 py-2 font-normal w-full justify-start"
                      data-testid="duplicate-concept-button"
                      onClick={() => setCreateScholarshipOpen(true)}
                    >
                      <IcEdit /> Editar beca
                    </Button>
                  </DropdownMenu.Item>
                )}
                {deleteScholarshipFlag?.enabled && (
                  <DropdownMenu.Item className="text-red-500 rounded-md flex items-center justify-start outline-none data-[disabled]:text-[#919EAB] data-[disabled]:pointer-events-none data-[highlighted]:bg-white data-[highlighted]:text-red-600">
                    <Button
                      variant="text"
                      className="flex w-full gap-2.5 px-3 py-2 font-normal justify-start"
                      onClick={() => setAlertToCloseSheet(true)}
                    >
                      <IcTrash />
                      Eliminar beca
                    </Button>
                  </DropdownMenu.Item>
                )}
              </ThreeDotsDropdown>
            )}
          </div>
        </div>
      </div>
      <Tabs
        tabs={tabsScholarshipsData}
        tab={tab}
        handleChangeTab={handleChangeTab}
        defaultValue="information"
        tabsListClassName="px-10"
      />
      {tab === 'information' && <ScholarshipDetailInfo scholarshipId={scholarshipId} />}
      {tab === 'students-assigned' && <ScholarshipsStudentsTable scholarshipId={scholarshipId} />}

      <Sheet open={isAssignmentSheetOpen && !!scholarship} onOpenChange={setIsAssignmentSheetOpen}>
        <Sheet.Content>
          <MassiveScholarshipAssignment
            onClose={() => setIsAssignmentSheetOpen(false)}
            scholarship={scholarship as AdjustmentDTO}
          />
        </Sheet.Content>
      </Sheet>
      <Sheet open={createScholarshipOpen} onOpenChange={setCreateScholarshipOpen}>
        <Sheet.Content>
          <SideFormScholarshipsCreate
            isEdit
            scholarship={scholarship}
            onClose={() => setCreateScholarshipOpen(false)}
          />
        </Sheet.Content>
      </Sheet>
      <Dialog.Root open={alertToCloseSheet} position="center">
        <Dialog.Title>{`¿Seguro de que quieres eliminar la beca ${scholarship?.name}?`}</Dialog.Title>
        <Dialog.Description>
          Esta acción es irreversible. Si continúas, los datos de esta beca se perderán y no podrás recuperarlos.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            className="!text-gray-600 rounded-lg disabled:cursor-not-allowed"
            variant="text"
            color="black"
            onClick={() => setAlertToCloseSheet(false)}
            disabled={mutationDelete.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            className="text-white rounded-lg disabled:cursor-not-allowed bg-error hover:bg-opacity-80 disabled:bg-neutral-300"
            onClick={() => {
              handleDelete();
            }}
            disabled={mutationDelete.isPending}
          >
            {mutationDelete.isPending ? 'Eliminando...' : 'Si, eliminar'}
          </Button>
        </div>
      </Dialog.Root>
    </div>
  );
};

ScholarshipsDetail.auth = true;

ScholarshipsDetail.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de becas y descuentos">
      {page}
    </Layout>
  );
};

export default ScholarshipsDetail;
