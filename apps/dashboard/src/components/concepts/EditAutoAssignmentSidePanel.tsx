import SidebarHeader from 'src/components/molecules/dashboard/SidebarHeader';
import Sheet, { ContainerActions } from 'src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import useAlert from '/src/hooks/useAlert';
import { Button } from '../ui/Button';
import CreateAutoAssignmentForm, { CreateAutoAssignmentFormSchema } from './CreateAutoAssignmentForm';
import { useRef, useState } from 'react';
import { useGetPermissions, useSelectedSchoolId } from '/src/guards/AuthGuard';
import {
  ConceptAutoAssignedGrade,
  ConceptAutoAssignedLevel,
  ConceptAutoAssignedSection,
  DetailConcept,
} from '@cometa/trpc/src/types';
import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { CheckedData, ResumeAutoAssign } from './CreateAutoAssignmentSidePanel';
import DeleteAutoAssignmentForm, { DeleteAutoAssignmentFormSchema } from './DeleteAutoAssignmentForm';
import Dialog from '/src/components/atoms/Dialog';
import ButtonDialog from '/src/components/organisms/dashboard/Button';
import { cn } from '@cometa/utils';

enum Steps {
  Step1 = 'STEP_1_ACTIONS',
  Step2 = 'STEP_2_EDIT',
  Step3 = 'STEP_3_REMOVE',
  Step4 = 'STEP_4_RESUME',
}

interface EditAutoAssignmentSidePanelProps {
  onClose: () => void;
  open?: boolean;
  concept: DetailConcept;
}

const updateAutoAssignToRemove = (autoAssignLevels: ConceptAutoAssignedLevel[]) => {
  const updateSections = (sections: ConceptAutoAssignedSection[]) =>
    sections
      .map((section) => (section.is_already_assigned ? { ...section, is_already_assigned: false } : null))
      .filter((section) => !!section);

  const updateGrades = (grades: ConceptAutoAssignedGrade[]) =>
    grades
      .map((grade) => {
        if (grade.is_all_assigned) {
          return {
            ...grade,
            is_all_assigned: false,
            sections: updateSections(grade.sections),
          };
        }
        const sections = updateSections(grade.sections);
        return sections.length > 0 ? { ...grade, sections } : null;
      })
      .filter((grade) => !!grade);

  const newAutoAssignLevels = autoAssignLevels
    .map((level) => {
      if (level.is_all_assigned) {
        return {
          ...level,
          is_all_assigned: false,
          grades: updateGrades(level.grades),
        };
      }
      const grades = updateGrades(level.grades);
      return grades.length > 0 ? { ...level, grades } : null;
    })
    .filter((level) => !!level);
  return newAutoAssignLevels as ConceptAutoAssignedLevel[];
};

export default function EditAutoAssignmentSidePanel({
  onClose,
  open,
  concept,
}: Readonly<EditAutoAssignmentSidePanelProps>) {
  const { setAlertState } = useAlert();
  const utils = api.useUtils();
  const permissions = useGetPermissions();
  const selectedSchoolId = useSelectedSchoolId();
  const [openDialog, setOpenDialog] = useState(false);
  const [checkedData, setCheckedData] = useState<CheckedData>({
    checkedKeys: [],
    checkedKeysLeaf: [],
  });
  const [formIsValid, setFormIsValid] = useState(false);

  const [currentStep, setCurrentStep] = useState(Steps.Step1);

  const onFinal = async () => {
    onClose();
    await utils.schools.schoolsConceptDetail.invalidate({
      school_id: selectedSchoolId as string,
      concept_id: concept.id,
    });
    await utils.schools.schoolsConceptsStudentsAssignedList.invalidate({
      schoolId: selectedSchoolId as string,
      conceptId: concept.id,
    });
    await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate({
      schoolId: selectedSchoolId as string,
      conceptId: concept.id,
    });
  };

  const formRef = useRef<HTMLFormElement>(null);
  const formRefRemove = useRef<HTMLFormElement>(null);

  const { mutate: mutateRemove, isPending: isLoadingRemove } = api.concepts.autoAssignRemove.useMutation({
    async onError() {
      await onFinal();
      setAlertState({
        open: true,
        message: `Ha ocurrido un error al quitar la autoasignación`,
        severity: 'error',
      });
    },
    async onSuccess() {
      await onFinal();
      setAlertState({
        open: true,
        message: `Se ha quitado la autoasignación`,
        severity: 'success',
      });
    },
  });

  const { mutate, isPending: isLoading } = api.concepts.autoAssignCreate.useMutation({
    async onError() {
      await onFinal();
      setAlertState({
        open: true,
        message: `Ha ocurrido un error al registrar la autoasignación`,
        severity: 'error',
      });
    },
    async onSuccess() {
      await onFinal();
      setAlertState({
        open: true,
        message: `Se ha registrado la autoasignación`,
        severity: 'success',
      });
    },
  });

  const onSubmit = (data: CreateAutoAssignmentFormSchema) => {
    setCurrentStep(Steps.Step4);
    setCheckedData(data.checkedData);
  };

  const triggerMutation = async () => {
    mutate({
      conceptId: concept.id,
      schoolId: selectedSchoolId as string,
      sectionIds: checkedData.checkedKeysLeaf,
    });
  };

  const onSubmitRemove = (data: DeleteAutoAssignmentFormSchema) => {
    mutateRemove({
      conceptId: concept.id,
      schoolId: selectedSchoolId as string,
      conceptAvailabilityId: data.checkedData.checkedKeysLeaf,
      deleteConceptAssignments: true,
    });
  };

  const autoAssignLevels = concept.auto_assigned_concepts;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        id="edit-auto-assignment"
        key="edit-auto-assignment"
      >
        <Sheet.Content className="mr-0">
          <div className="flex flex-col flex-auto">
            <div className="sticky top-0 z-10 w-full bg-white">
              <SidebarHeader title="Editar autoasignación" onClose={onClose} boxClassName="px-8 py-5" />
            </div>
            {currentStep === Steps.Step1 && (
              <div className="px-8 pb-5 space-y-6">
                <h3 className="text-[#212b36] text-lg font-bold leading-7">¿Qué acción quieres realizar?</h3>
                <div className="space-y-5">
                  {[
                    {
                      title: 'Agregar sección',
                      description: 'Podrás seleccionar mas secciones para configurar la autoasignación.',
                      icon: <Plus className="w-4 h-4 mr-1 text-green" />,
                      onClick: () => {
                        setCurrentStep(Steps.Step2);
                      },
                      disabled: !permissions.can_add_concept_assignment,
                    },
                    {
                      title: 'Quitar sección',
                      description: 'Podrás quitar la autoasignación para las secciones, grados, grupos que desees.',
                      icon: <IcTrash className="text-error" />,
                      onClick: () => {
                        setCurrentStep(Steps.Step3);
                      },
                      disabled: !permissions.can_delete_concept_assignment,
                    },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="px-4 py-[18px] bg-gray-50 hover:bg-gray-200 rounded-lg border border-[#dfe3e8] justify-between items-center inline-flex text-start disabled:cursor-not-allowed disabled:bg-gray-100"
                      onClick={item.onClick}
                      disabled={item.disabled}
                    >
                      <div className="flex-col justify-start items-start gap-y-1.5 inline-flex">
                        <div className="inline-flex items-center justify-center text-center gap-x-2.5">
                          {item.icon}
                          <span
                            className={cn('text-[#212b36] text-base font-semibold font-lota', {
                              'text-[#637381]': item.disabled,
                            })}
                          >
                            {item.title}
                          </span>
                        </div>
                        <div className="px-8 justify-center items-center gap-2.5 inline-flex">
                          <span className="text-[#637381] text-sm font-normal leading-[18px]">{item.description}</span>
                        </div>
                      </div>
                      <div>
                        <IcArrow />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentStep === Steps.Step2 && (
              <CreateAutoAssignmentForm
                onSubmit={onSubmit}
                autoAssignList={autoAssignLevels}
                ref={formRef}
                onValidChange={(value) => {
                  setFormIsValid(value);
                }}
              />
            )}
            {currentStep === Steps.Step3 && (
              <DeleteAutoAssignmentForm
                onSubmit={onSubmitRemove}
                autoAssignList={updateAutoAssignToRemove(autoAssignLevels)}
                ref={formRefRemove}
                onValidChange={(value) => {
                  setFormIsValid(value);
                }}
              />
            )}
            {currentStep === Steps.Step4 && (
              <>
                {autoAssignLevels ? (
                  <ResumeAutoAssign
                    autoAssignLevels={autoAssignLevels}
                    checkedKeys={checkedData.checkedKeys}
                    concept={concept}
                  />
                ) : null}
              </>
            )}
          </div>
          <ContainerActions>
            <Button
              variant="transparency"
              className="p-3 text-base text-green"
              onClick={() => {
                if (currentStep === Steps.Step1) return onClose();
                if (currentStep === Steps.Step2 || currentStep === Steps.Step3) return setCurrentStep(Steps.Step1);
                if (currentStep === Steps.Step4) return setCurrentStep(Steps.Step2);
              }}
              disabled={isLoading || isLoadingRemove}
            >
              {currentStep === Steps.Step1 ? 'Descartar' : 'Volver'}
            </Button>
            <Button
              variant="success"
              className="p-3 text-base"
              onClick={() => {
                if (currentStep === Steps.Step2) return formRef.current?.requestSubmit();
                if (currentStep === Steps.Step3) return setOpenDialog(true);
                if (currentStep === Steps.Step4) {
                  triggerMutation();
                }
              }}
              disabled={!formIsValid || isLoading || isLoadingRemove}
            >
              Confirmar
            </Button>
          </ContainerActions>
        </Sheet.Content>
      </Sheet>
      <Dialog.Root open={openDialog} position="center" classNames="right-12">
        <Dialog.Title>¿Quieres desasignar todos los estudiantes vinculados a las secciones elegidas?</Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <ButtonDialog
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenDialog(false)}
          >
            Atrás
          </ButtonDialog>
          <ButtonDialog
            variant="cancel"
            size="tooltip"
            onClick={() => {
              formRefRemove.current?.requestSubmit();
              setOpenDialog(false);
            }}
          >
            Sí, desasignar
          </ButtonDialog>
        </div>
      </Dialog.Root>
    </>
  );
}
