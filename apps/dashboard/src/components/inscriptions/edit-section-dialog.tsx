import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import Dialog from '/src/components/atoms/Dialog';
import { Button, Select } from '@cometa/recreo';
import useAlert from '/src/hooks/useAlert';

const editSectionSchema = z.object({
  levelId: z.string().min(1, 'Nivel es requerido'),
  gradeId: z.string().min(1, 'Grado es requerido'),
  groupId: z.string().min(1, 'Grupo es requerido'),
});

type EditSectionFormData = z.infer<typeof editSectionSchema>;

type EditSectionDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedInscriptions: InscriptionEntity[];
  onSuccess: () => void;
};

const WITHOUT_GROUP_VALUE = 'Sin grupo';

export function EditSectionDialog({ open, onClose, selectedInscriptions, onSuccess }: EditSectionDialogProps) {
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();

  const firstInscription = selectedInscriptions[0];

  const { data: levels = [] } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const initialLevelId = firstInscription?.section?.level_id || '';
  const initialGradeId = firstInscription?.section?.grade_id || '';
  const initialGroupId = firstInscription?.section?.related_group_id || WITHOUT_GROUP_VALUE;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSectionFormData>({
    resolver: zodResolver(editSectionSchema),
    defaultValues: {
      levelId: initialLevelId,
      gradeId: initialGradeId,
      groupId: initialGroupId,
    },
  });

  const updateInscription = api.students.updateInscription.useMutation({
    onSuccess: () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: `Se cambió exitosamente la sección para ${selectedInscriptions.length} estudiante${
          selectedInscriptions.length === 1 ? '' : 's'
        }.`,
      });
      onSuccess();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: `Error al cambiar la sección para ${selectedInscriptions.length} estudiante${
          selectedInscriptions.length === 1 ? '' : 's'
        }.`,
      });
    },
    onSettled: () => {
      handleClose();
    },
  });

  const levelId = watch('levelId');
  const gradeId = watch('gradeId');

  const hasOneSelectedInscription = selectedInscriptions.length === 1;
  const currentCycle = firstInscription?.school_cycle?.name;

  const selectedLevel = levels.find((level) => level.id === levelId);
  const availableGrades = selectedLevel?.grades || [];
  const selectedGrade = availableGrades.find((grade) => grade.id === gradeId);
  const availableGroups = selectedGrade?.groups || [];

  async function onSubmit(data: EditSectionFormData) {
    const hasChanges =
      data.levelId !== initialLevelId || data.gradeId !== initialGradeId || data.groupId !== initialGroupId;

    if (!hasChanges) {
      return handleClose();
    }

    await Promise.all(
      selectedInscriptions.map((inscription) =>
        updateInscription.mutateAsync({
          inscriptionId: inscription.id as string,
          data: {
            level_id: data.levelId,
            grade_id: data.gradeId,
            group_id: data.groupId === WITHOUT_GROUP_VALUE ? null : data.groupId,
          },
        })
      )
    );
  }

  function handleClose() {
    reset();
    onClose();
  }

  const isPending = updateInscription.isPending || isSubmitting;

  return (
    <Dialog.Root open={open} position="center" classNames="w-[430px] px-6 py-7 z-[50]">
      <Dialog.Title className="text-lg font-bold">Editar sección asignada para el {currentCycle}</Dialog.Title>

      <Dialog.Description>
        Selecciona un nuevo nivel, grado o grupo para {hasOneSelectedInscription ? 'el' : 'los'}{' '}
        {selectedInscriptions.length} estudiante{hasOneSelectedInscription ? '' : 's'} que has seleccionado previamente.
      </Dialog.Description>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3 text-start">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
          <Controller
            name="levelId"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Selecciona un nivel"
                className="w-full"
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('gradeId', '');
                  setValue('groupId', '');
                }}
                value={field.value}
                disabled={isPending}
                isLegacy={false}
              >
                <Select.Content>
                  {levels?.map((levelOption) => (
                    <Select.Item key={levelOption.id} value={levelOption.id || ''}>
                      {levelOption.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          {errors.levelId && <p className="text-red-500 text-sm mt-1">{errors.levelId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
          <Controller
            name="gradeId"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Selecciona un grado"
                className="w-full"
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('groupId', '');
                }}
                value={field.value}
                disabled={isPending || !availableGrades?.length}
                isLegacy={false}
              >
                <Select.Content>
                  {availableGrades?.map((gradeOption) => (
                    <Select.Item key={gradeOption.id} value={gradeOption.id || ''}>
                      {gradeOption.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          {errors.gradeId && <p className="text-red-500 text-sm mt-1">{errors.gradeId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
          <Controller
            name="groupId"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Selecciona un grupo"
                className="w-full"
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending || !availableGroups?.length}
                isLegacy={false}
              >
                <Select.Content>
                  {availableGroups?.length === 0 && gradeId ? (
                    <Select.Item value={WITHOUT_GROUP_VALUE}>{WITHOUT_GROUP_VALUE}</Select.Item>
                  ) : (
                    <>
                      {!availableGroups?.some((group) => group.name === WITHOUT_GROUP_VALUE) && (
                        <Select.Item value={WITHOUT_GROUP_VALUE}>{WITHOUT_GROUP_VALUE}</Select.Item>
                      )}
                      {availableGroups?.map((groupOption) => (
                        <Select.Item key={groupOption.id} value={groupOption.id || ''}>
                          {groupOption.name || WITHOUT_GROUP_VALUE}
                        </Select.Item>
                      ))}
                    </>
                  )}
                </Select.Content>
              </Select>
            )}
          />
          {errors.groupId && <p className="text-red-500 text-sm mt-1">{errors.groupId.message}</p>}
        </div>

        <div className="flex justify-center gap-10 pt-2">
          <Dialog.Close onClick={handleClose} asChild>
            <Button variant="solid-light" size="small" disabled={isPending}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={isPending} color="black">
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Dialog.Root>
  );
}
