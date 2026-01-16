import SidebarHeader from 'src/components/molecules/dashboard/SidebarHeader';
import Sheet, { ContainerActions } from 'src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import useAlert from '/src/hooks/useAlert';
import { Button } from '../ui/Button';
import CreateAutoAssignmentForm, { CreateAutoAssignmentFormSchema } from './CreateAutoAssignmentForm';
import { useRef, useState } from 'react';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import {
  ConceptAutoAssignedGrade,
  ConceptAutoAssignedLevel,
  ConceptAutoAssignedSection,
  DetailConcept,
} from '@cometa/trpc/src/types';
import { formatPrice } from '/src/utils/general';
import Info from 'public/assets/icons/ic_info.svg';

enum Steps {
  Step1 = 'STEP_1_FORM',
  Step2 = 'STEP_2_DETAIL',
}

interface ResumeAutoAssignProps {
  autoAssignLevels: ConceptAutoAssignedLevel[];
  checkedKeys: CheckedData['checkedKeys'];
  concept: DetailConcept;
}

export interface CheckedData {
  checkedKeys: string[];
  checkedKeysLeaf: string[];
}

interface CreateAutoAssignmentSidePanelProps {
  onClose: () => void;
  open?: boolean;
  concept: DetailConcept;
}

const softUpdateAutoAssign = (autoAssignLevels: ConceptAutoAssignedLevel[], checkedIds: string[]) => {
  const setAssignedSections = (
    sections: ConceptAutoAssignedSection[],
    checkedIds: string[]
  ): ConceptAutoAssignedSection[] =>
    sections.map((section) => {
      if (checkedIds.includes(section.id)) {
        return { ...section, is_already_assigned: true };
      }
      return section;
    });
  const setAssinedGrades = (grades: ConceptAutoAssignedGrade[], checkedIds: string[]): ConceptAutoAssignedGrade[] =>
    grades.map((grade) => {
      if (checkedIds.includes(grade.id)) {
        return {
          ...grade,
          is_all_assigned: true,
          sections: setAssignedSections(grade.sections, checkedIds),
        };
      }
      return {
        ...grade,
        sections: setAssignedSections(grade.sections, checkedIds),
      };
    });
  const newAutoAssignLevels: ConceptAutoAssignedLevel[] = autoAssignLevels.map((level) => {
    if (checkedIds.includes(level.id)) {
      return {
        ...level,
        is_all_assigned: true,
        grades: setAssinedGrades(level.grades, checkedIds),
      };
    }
    return {
      ...level,
      grades: setAssinedGrades(level.grades, checkedIds),
    };
  });
  return newAutoAssignLevels;
};

interface ChipsNameGradeSection {
  name: string;
  gradeName?: string;
  levelName: string;
}
export const CardsAutoAssignWithChips = ({ autoAssignLevels }: { autoAssignLevels: ConceptAutoAssignedLevel[] }) => {
  const [assignedLevels, assignedGrades, assignedSections] = autoAssignLevels.reduce(
    (acc, level) => {
      if (level.is_all_assigned) {
        acc[0].push(level.name);
      } else {
        level.grades.forEach((grade) => {
          if (grade.is_all_assigned) {
            acc[1].push({
              name: grade.name,
              levelName: level.name,
            });
          } else {
            grade.sections.forEach((section) => {
              if (section.is_already_assigned) {
                acc[2].push({
                  name: section.name,
                  levelName: level.name,
                  gradeName: grade.name,
                });
              }
            });
          }
        });
      }
      return acc;
    },
    [[], [], []] as [string[], ChipsNameGradeSection[], ChipsNameGradeSection[]]
  );

  const cards = [
    {
      title: 'Niveles',
      subtitle: 'Aplica para todos los grados y grupos  del nivel seleccionado:',
      names: assignedLevels,
    },
    {
      title: 'Grados',
      subtitle: 'Aplica para todos las grupos del grado seleccionado:',
      names: assignedGrades,
    },
    {
      title: 'Secciones',
      subtitle: 'Aplica para  las siguientes secciones específicas seleccionadas:',
      names: assignedSections,
    },
  ];
  return (
    <div className="space-y-2.5">
      {cards.map((card) => {
        if (card.names.length === 0) return null;

        return (
          <div key={card.title} className="p-4 border-2 border-[#DFE3E8] rounded-lg">
            <h6 className="font-semibold font-lota">{card.title}</h6>
            <p className="text-xs font-lota text-[#637381]">{card.subtitle}</p>
            <div className="flex flex-row flex-wrap gap-1 mt-2.5">
              {card.names.map((info) => (
                <span
                  key={`${card.title}-${typeof info === 'string' ? info : info.name + '-' + info.levelName}`}
                  className="bg-[#919EAB29] text-center text-sm rounded-[50px] py-[5px] px-3"
                >
                  {typeof info === 'string' ? (
                    info
                  ) : (
                    <>
                      {info.name}{' '}
                      {info.gradeName && <span className="text-[#637381] text-[10px]">{info.gradeName} | </span>}
                      <span className="text-[#637381] text-[10px]">{info.levelName}</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ResumeAutoAssign = ({ autoAssignLevels, checkedKeys, concept }: ResumeAutoAssignProps) => {
  const resumeAutoAssignLevels = softUpdateAutoAssign(autoAssignLevels, checkedKeys);

  return (
    <div className="px-8 pb-5 space-y-6">
      <div className="inline-flex flex-col items-start justify-start gap-y-1">
        <h3 className="text-[#212b36] text-lg font-bold leading-7">Resumen</h3>
        <span className="self-stretch text-[#637381] text-sm leading-snug">
          Revisa y confirma que el concepto y secciones elegidas sean los correctas:
        </span>
      </div>

      <div className="bg-[#F9FAFB] rounded-lg p-4">
        <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] pb-4">
          <p className="text-xs font-normal text-[#637381]">Concepto:</p>
          <p className="text-base font-normal">{concept.name}</p>
        </div>
        <div className="flex flex-col pt-4 gap-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-normal text-[#637381]">Ciclo escolar:</p>
            <p className="text-base font-normal">
              {concept.school_cycle?.year_start} -{' '}
              {concept.school_cycle?.year_end && concept.school_cycle?.year_end % 100}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-normal text-[#637381]">Precio base:</p>
            <p className="text-base font-normal">
              {formatPrice((concept.orders.length > 1 ? concept.orders.at(-1)?.price : concept.price) || '')} MXN
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-[#212b36] text-base font-semibold">Auto asignación para:</h3>
        <div className=" w-full pl-4 pr-3 py-[13px] bg-[#d0f2ff] rounded-lg justify-start items-center gap-x-3 inline-flex">
          <div className="relative w-6 h-6">
            <Info className="text-[#1890FF]" />
          </div>
          <p className="text-[#04297a] text-sm">
            Se asignará el concepto a todos los estudiantes vinculados con los niveles, grados y secciones seleccionados
          </p>
        </div>
      </div>
      <div>
        <CardsAutoAssignWithChips autoAssignLevels={resumeAutoAssignLevels} />
      </div>
      <div className="w-full p-4 bg-gray-50 rounded-lg border border-[#dfe3e8] flex-col justify-start items-center gap-4 inline-flex">
        <div className="flex flex-col items-start self-stretch justify-center gap-1">
          <span className="text-[#212b36] font-semibold">Órdenes a cobrar</span>
        </div>
        <div className="h-px w-full bg-[#919eab]/25" />
        <div className="flex flex-col items-start self-stretch justify-start gap-3">
          <div className="inline-flex items-center self-stretch justify-between">
            <span className="text-[#637381] text-sm">Cantidad de órdenes</span>
            <span className="text-right text-[#212b36] text-sm font-medium leading-snug">{concept.orders.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateAutoAssignmentSidePanel({
  onClose,
  open,
  concept,
}: Readonly<CreateAutoAssignmentSidePanelProps>) {
  const { setAlertState } = useAlert();
  const utils = api.useUtils();
  const selectedSchoolId = useSelectedSchoolId();

  const [formIsValid, setFormIsValid] = useState(false);
  const [checkedData, setCheckedData] = useState<CheckedData>({
    checkedKeys: [],
    checkedKeysLeaf: [],
  });
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

  const { mutate, isPending: isLoading } = api.concepts.autoAssignCreate.useMutation({
    async onError() {
      await onFinal();
      setAlertState({
        open: true,
        message: `Ha ocurrido un error, intente mas tarde`,
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
    setCheckedData(data.checkedData);
    setCurrentStep(Steps.Step2);
  };

  const triggerMutation = async () => {
    if (checkedData.checkedKeysLeaf.length !== 0) {
      mutate({
        conceptId: concept.id,
        schoolId: selectedSchoolId as string,
        sectionIds: checkedData.checkedKeysLeaf,
      });
    }
  };

  const autoAssignLevels = concept.auto_assigned_concepts;

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      id="create-auto-assignment"
      key="create-auto-assignment"
    >
      <Sheet.Content className="mr-0">
        <div className="flex flex-col flex-auto">
          <div className="sticky top-0 z-10 w-full bg-white">
            <SidebarHeader title="Autoasignación" onClose={onClose} boxClassName="px-8 py-5" />
          </div>
          {currentStep === Steps.Step1 ? (
            <CreateAutoAssignmentForm
              onSubmit={onSubmit}
              autoAssignList={autoAssignLevels}
              ref={formRef}
              onValidChange={(value) => {
                setFormIsValid(value);
              }}
            />
          ) : (
            <>
              {autoAssignLevels ? (
                <ResumeAutoAssign
                  autoAssignLevels={autoAssignLevels as ConceptAutoAssignedLevel[]}
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
              if (currentStep === Steps.Step1) {
                onClose();
              } else {
                setCurrentStep(Steps.Step1);
              }
            }}
            disabled={isLoading}
          >
            {currentStep === Steps.Step1 ? 'Descartar' : 'Volver'}
          </Button>
          <Button
            variant="success"
            className="p-3 text-base"
            onClick={() => {
              if (currentStep === Steps.Step1) {
                formRef.current?.requestSubmit();
              } else {
                triggerMutation();
              }
            }}
            disabled={!formIsValid || isLoading}
          >
            Confirmar
          </Button>
        </ContainerActions>
      </Sheet.Content>
    </Sheet>
  );
}
