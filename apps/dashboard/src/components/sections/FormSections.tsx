import { useState, useMemo } from 'react';
import Alert from '../ui/Alert';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Label } from '../ui/Label';
import Button from '../organisms/dashboard/Button';
import Confetti from '../ui/Confetti';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { Section, Level, SectionWithLevel } from '@cometa/trpc/src/types';
import Select from '../Select';
import { cn } from '@cometa/utils';
import { Checkbox } from '../atoms/RadixCheckbox';

interface TransformedLevel extends Level {
  grades: string[];
}

export const transformData = (data: SectionWithLevel[]): TransformedLevel[] => {
  const levelMap = new Map<string, TransformedLevel>();

  data.forEach((section) => {
    const { level, grade } = section;
    const gradeName = `${grade} - ${level.name}`;

    if (!levelMap.has(level.id)) {
      levelMap.set(level.id, {
        ...level,
        grades: [gradeName],
      });
    } else {
      const existingLevel = levelMap.get(level.id)!;
      if (!existingLevel.grades.includes(gradeName)) {
        existingLevel.grades.push(gradeName);
      }
    }
  });

  return Array.from(levelMap.values());
};

const levelTypeOrder = ['PRE_SCHOOL', 'ELEMENTARY', 'MIDDLE', 'HIGH'];

export const sortLevels = (levels: TransformedLevel[]): TransformedLevel[] =>
  levels.sort((a, b) => {
    const typeIndexA = levelTypeOrder.indexOf(a.type);
    const typeIndexB = levelTypeOrder.indexOf(b.type);

    if (typeIndexA !== typeIndexB) {
      return typeIndexA - typeIndexB;
    }
    return a.name.localeCompare(b.name);
  });

export const sortGrades = (grades: string[]): string[] =>
  grades.sort((a, b) => {
    const [gradeA] = a.split(' - ');
    const [gradeB] = b.split(' - ');
    return gradeA.localeCompare(gradeB, undefined, { numeric: true });
  });

export const transformAndSortSections = (data?: SectionWithLevel[]): TransformedLevel[] => {
  if (!data) return [];
  const transformedLevels = transformData(data);
  const sortedLevels = sortLevels(transformedLevels);
  sortedLevels.forEach((level) => {
    level.grades = sortGrades(level.grades);
  });
  return sortedLevels;
};

export const Sections = () => {
  const [hasCycleChange, setHasCycleChange] = useState('');
  const [shouldChangeGrade, setShouldChangeGrade] = useState('');
  const [formState, setFormState] = useState('initial');

  const selectedSchool = useSelectedSchool();
  const { data: sections } = api.academicCoordinator.academicCoordinatorSectionsListBySchoolList.useQuery(
    {
      schoolId: selectedSchool?.id || '',
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const mutateFormData = api.sections.createSectionsFormData.useMutation();
  const transformedSections = useMemo(() => transformAndSortSections(sections), [sections]);
  const updateSectionsMutation = api.sections.updateSectionsFromForm.useMutation();
  const handleConfirm = async (payload: Section[]) => {
    try {
      await updateSectionsMutation.mutateAsync({ payload });
      setFormState('success');

      mutateFormData.mutate({
        schoolId: selectedSchool?.id || '',
        formData: {
          ...payload,
          school_id: selectedSchool?.id || '',
          hasCycleChange: hasCycleChange === 'si' ? 'si' : 'no',
          shouldChangeGrade: shouldChangeGrade === 'si' ? 'si' : 'no',
        },
      });
    } catch (error) {
      // console.error('Error updating sections:', error);
    }
  };

  return (
    <div className="flex justify-center bg-[#F4F4F4] pb-24 min-h-screen p-4">
      <div className="w-full max-w-4xl p-8 bg-white font-lota rounded-xl shadow-card">
        {formState === 'initial' && (
          <div className="flex flex-col justify-between h-full gap-4">
            <div className="flex flex-col gap-4">
              <Header />
              <Introduction />

              <RadioGroup onValueChange={setHasCycleChange} value={hasCycleChange}>
                <span className="text-base font-semibold">
                  ¿Tu escuela tendrá un cambio de ciclo escolar en la segunda mitad del año 2024?
                </span>
                <div className="flex flex-col gap-3 px-2 pt-2">
                  <div className="flex items-center gap-[10px]">
                    <RadioGroupItem value="si" id="cycle_change_si" />
                    <Label htmlFor="cycle_change_si">Sí</Label>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <RadioGroupItem value="no" id="cycle_change_no" />
                    <Label htmlFor="cycle_change_no">No</Label>
                  </div>
                </div>
              </RadioGroup>

              {hasCycleChange === 'si' && (
                <RadioGroup onValueChange={setShouldChangeGrade} value={shouldChangeGrade}>
                  <span className="text-base font-semibold">
                    ¿Tus estudiantes deberían de cambiar a un siguiente grado con este cambio de ciclo escolar?
                  </span>
                  <div className="flex flex-col gap-3 px-2 pt-2">
                    <div className="flex items-center gap-[10px]">
                      <RadioGroupItem value="si" id="grade_change_si" />
                      <Label htmlFor="grade_change_si">Sí</Label>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <RadioGroupItem value="no" id="grade_change_no" />
                      <Label htmlFor="grade_change_no">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            </div>
            {hasCycleChange === 'no' && <EndComponent setFormState={setFormState} />}

            {hasCycleChange === 'si' && shouldChangeGrade === 'si' && (
              <div className="py-4">
                <div className="space-y-2">
                  <span className="text-lg font-bold leading-5">
                    Por favor, selecciona el grado siguiente para cada uno de los grados de tu escuela.
                  </span>
                  <p className="leading-6 text-[#454D64]">
                    Esto nos permitirá automáticamente registrar a los estudiantes en el grado siguiente que
                    corresponde. En caso un grado no tenga uno siguiente, podrás elegir la opción "No aplica".
                  </p>
                </div>
                <div className="py-8">
                  {transformedSections && sections && (
                    <GradeProgression
                      levels={transformedSections}
                      allGrades={transformedSections.flatMap((level) => level.grades)}
                      originalSections={sections}
                      onSubmit={handleConfirm}
                    />
                  )}
                </div>
              </div>
            )}
            {hasCycleChange === 'si' && shouldChangeGrade === 'no' && (
              <EndComponentContinueGrade setFormState={setFormState} />
            )}
          </div>
        )}
        {formState === 'success' && <SuccessMessage />}
      </div>
    </div>
  );
};

interface GradeProgressionProps {
  levels: TransformedLevel[];
  allGrades: string[];
  originalSections: SectionWithLevel[];
  onSubmit: (payload: any) => void;
}

const GradeProgression: React.FC<GradeProgressionProps> = ({ levels, allGrades, onSubmit }) => {
  const [selectedGrades, setSelectedGrades] = useState<{ [key: string]: string }>({});
  const [noNextGrade, setNoNextGrade] = useState<{ [key: string]: boolean }>({});

  const handleGradeChange = (gradeId: string, value: string) => {
    setSelectedGrades((prev) => ({ ...prev, [gradeId]: value }));
    setNoNextGrade((prev) => ({ ...prev, [gradeId]: false }));
  };

  const handleNoNextGradeChange = (gradeId: string, checked: boolean) => {
    setNoNextGrade((prev) => ({ ...prev, [gradeId]: checked }));
    if (checked) {
      setSelectedGrades((prev) => {
        const newState = { ...prev };
        delete newState[gradeId];
        return newState;
      });
    }
  };

  const preparePayload = () => {
    const payload = [];

    for (const level of levels) {
      for (const grade of level.grades) {
        const gradeId = grade;
        const nextGrade = selectedGrades[gradeId];
        const isLastSection = noNextGrade[gradeId] || false;

        if (nextGrade) {
          const [nextGradeNumber, nextLevelName] = nextGrade.split(' - ');
          const nextLevel = levels.find((l) => l.name === nextLevelName);

          payload.push({
            level_id: level.id,
            grade: grade.split(' - ')[0],
            last_section: isLastSection,
            without_group: false,
            next: {
              grade: nextGradeNumber,
              level_id: nextLevel?.id,
            },
          });
        } else if (isLastSection) {
          payload.push({
            level_id: level.id,
            grade: grade.split(' - ')[0],
            last_section: true,
            without_group: false,
            next: null,
          });
        }
      }
    }

    return payload;
  };
  const handleSubmit = async () => {
    const payload = preparePayload();
    onSubmit(payload);
  };

  return (
    <div className="space-y-8">
      {levels.map((level) => (
        <div key={level.id} className="p-6 border rounded-lg border-[#E4EBF6]">
          <h2 className="text-lg font-semibold mb-4 border-b border-[#919EAB3D] pb-3 text-[#1C1C1D]">{level.name}</h2>
          {level.grades.map((grade, index) => (
            <div
              key={grade}
              className={cn('flex items-center space-x-4', { 'mb-4': index !== level.grades.length - 1 })}
            >
              <div className="w-[164px] flex items-center justify-between">
                <span className="font-semibold leading-6 text-[#454D64]">{grade}</span>
                <span className="text-gray-400">
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 9H16V7H0V9Z"
                      fill="#8B93A0"
                    />
                  </svg>
                </span>
              </div>
              <Select
                placeholder="Grado siguiente"
                className="w-[364px]"
                value={selectedGrades[grade] || ''}
                onValueChange={(value) => handleGradeChange(grade, value)}
                disabled={noNextGrade[grade]}
              >
                <Select.Content>
                  {allGrades.map((option) => (
                    <Select.Item key={option} value={option}>
                      {option}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <div className="flex items-center gap-2 pl-2">
                <Checkbox
                  checked={noNextGrade[grade] || false}
                  onCheckedChange={(checked) => handleNoNextGradeChange(grade, checked as boolean)}
                />
                <p className="leading-6 text-[#454D64] pt-0.5">No tiene grado siguiente</p>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="flex justify-end">
        <Button variant="primary" className="w-[230px]" onClick={handleSubmit}>
          Enviar información
        </Button>
      </div>
    </div>
  );
};

const Header = () => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold leading-7 text-left">¡Preparémonos para el cambio de ciclo!</h1>
  </div>
);

const Introduction = () => (
  <>
    <p className="leading-6 text-[#454D64]">
      Se acerca el cambio de ciclo escolar y queremos ir preparándonos para que este proceso sea lo más fácil posible
      para ti. Completar este formulario nos ayudará a configurar los grados y niveles de tu escuela para los próximos
      ciclos escolares.
    </p>
    <Alert message="Recuerda asegurarte que la información esté correcta para evitar errores más adelante. Si tienes alguna pregunta, no dudes en escribirle a nuestro equipo de soporte." />
    <div className="py-4">
      <div className="w-full h-[1px] bg-[#919EAB] bg-opacity-24" />
    </div>
  </>
);

const EndComponent = ({ setFormState }: { setFormState: (state: string) => void }) => {
  const selectedSchool = useSelectedSchool();
  const mutateFormData = api.sections.createSectionsFormData.useMutation();
  const handleSubmit = async () => {
    try {
      mutateFormData.mutate({
        schoolId: selectedSchool?.id || '',
        formData: {
          school_id: selectedSchool?.id || '',
          hasCycleChange: 'no',
        },
      });
      setFormState('success');
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <div className="flex justify-end">
      <Button variant="primary" className="w-[230px]" onClick={handleSubmit}>
        Enviar información
      </Button>
    </div>
  );
};

const EndComponentContinueGrade = ({ setFormState }: { setFormState: (state: string) => void }) => {
  const selectedSchool = useSelectedSchool();
  const mutateFormData = api.sections.createSectionsFormData.useMutation();
  const handleSubmit = async () => {
    try {
      mutateFormData.mutate({
        schoolId: selectedSchool?.id || '',
        formData: {
          school_id: selectedSchool?.id || '',
          hasCycleChange: 'si',
          shouldChangeGrade: 'no',
        },
      });
      setFormState('success');
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <div className="flex justify-end">
      <Button variant="primary" className="w-[230px]" onClick={handleSubmit}>
        Enviar información
      </Button>
    </div>
  );
};

export const SuccessMessage = () => (
  <div>
    <Confetti topOffset={400} />
    <div className="w-full flex items-center justify-center h-[calc(100vh-300px)]">
      <div className="w-[300px] flex flex-col gap-4">
        <h2 className="text-2xl font-bold leading-7 text-center">¡Datos actualizados!</h2>
        <p className="leading-6 text-center">
          Si tienes alguna duda, recuerda que puedes contactarnos a través de nuestro equipo de soporte.
        </p>
      </div>
    </div>
  </div>
);
