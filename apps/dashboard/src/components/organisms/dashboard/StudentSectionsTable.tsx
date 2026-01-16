import { useToggle } from '@cometa/hooks';
import { InscriptionSection, InscriptionStatusEnum, Section } from '@cometa/trpc/src/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import { createColumnHelper } from '@tanstack/react-table';
import { useSession } from 'next-auth/react';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import Dialog from '../../atoms/Dialog';
import Button from './Button';
import StudentInscriptionStatusChip from './student/StudentInscriptionStatusChip';
import Select from '/src/components/Select';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { Tooltip } from '/src/components/atoms/Tooltip';
import useLevelOptions from '/src/hooks/useLevelOptions';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import { useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';

interface StudentSectionsTableProps {
  id: string;
  schoolId?: string;
}

const schema = z
  .object({
    level: z.string().min(1, 'Falta completar este campo'),
    grade: z.string().min(1, 'Falta completar este campo'),
    group: z.string().min(1, 'Falta completar este campo'),
    section: z.string().min(1, 'Falta completar este campo'),
  })
  .refine((data) => {
    if (data.level && data.grade && data.group && data.section) {
      return true;
    }
    return false;
  });

type FormValues = z.infer<typeof schema>;

export const StudentSectionsTable = ({ id, schoolId }: StudentSectionsTableProps) => {
  const { data: session } = useSession();
  const [hoverSection, setHoverSection] = useState<Section | undefined>();
  const [selectedInscription, setSelectedInscription] = useState<InscriptionSection | undefined>();
  const { toggle: openTo, onOpen: onOpenTo, onClose: onCloseTo } = useToggle();
  const { data: sections } = useSections(session?.token, schoolId, true);
  const { data: levels } = useLevels(session?.token, schoolId);
  const utils = api.useUtils();
  const { isActionBlocked, getBlockedTooltip } = useIntegrationsBlockedFields();
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const { data: student, isPending: isStudentLoading } = api.students.dashboardSchoolDueOrdersStudentDetail.useQuery(
    { studentId: id, schoolId: schoolId || '' },
    {
      enabled: !!id && !!schoolId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const updateStudentSection = api.students.studentUpdateSection.useMutation();

  const level = watch('level');
  const grade = watch('grade');
  const group = watch('group');

  const { gradesOptions, groupOptions, levelSelected } = useLevelOptions(
    sections || [],
    levels || [],
    level,
    selectedInscription?.section,
    grade
  );

  const sectionsWithId =
    sections?.reduce((acc: any, section: any) => {
      const levelName = levels?.find((level) => level.id === section.level)?.name;
      if (levelName) {
        if (acc[levelName]) {
          acc[levelName].push(section);
        } else {
          acc[levelName] = [section];
        }
      }
      return acc;
    }, {}) || [];

  if (level && grade && group && levelSelected && sectionsWithId[levelSelected?.name]) {
    const section = sectionsWithId[levelSelected?.name]?.find(
      (section: any) => section.grade === `${grade}` && section.group === `${group}`
    );
    if (section) {
      setValue('section', section.id);
    }
  }

  const columnHelper = createColumnHelper<InscriptionSection>();
  const columns = [
    columnHelper.accessor('school_cycle', {
      cell: (row) => (
        <div>
          <span>{row.getValue()?.name}</span>
        </div>
      ),
      size: 100,
      header: () => <span className="font-semibold text-sm">Ciclo escolar</span>,
    }),
    columnHelper.accessor('status', {
      cell: (row) => (
        <div>
          <StudentInscriptionStatusChip status={row.getValue() as InscriptionStatusEnum} />
        </div>
      ),
      header: () => <span className="font-semibold text-sm">Estado de inscripción</span>,
      size: 150,
    }),
    columnHelper.accessor('section.name', {
      cell: (row) => (
        <div>
          <span
            className={cn({
              'italic text-[#637381]': !row.getValue(),
            })}
          >
            {row.getValue() ? `${row.getValue()} | ${row?.row?.original?.section?.level_name}` : 'Sin sección'}
          </span>
        </div>
      ),
      header: () => <span className="font-semibold text-sm">Sección</span>,
      size: 150,
    }),
    columnHelper.accessor('id', {
      cell: (info) => (
        <div>
          {hoverSection && hoverSection?.id === info.row.original.section?.id && (
            <Tooltip message={editSectionTooltipMessage}>
              <button
                className={cn('flex gap-2 items-center justify-center', {
                  'cursor-not-allowed opacity-50': isEditSectionBlocked,
                  'cursor-pointer': !isEditSectionBlocked,
                })}
                onClick={() => handleOpenEditSection(info.row.original)}
                disabled={isEditSectionBlocked}
              >
                <IcEdit fill={isEditSectionBlocked ? '#9CA3AF' : '#00AB55'} />
                <span
                  className={cn('font-bold text-[13px]', {
                    'text-gray-400': isEditSectionBlocked,
                    'text-[#00AB55]': !isEditSectionBlocked,
                  })}
                >
                  Editar sección
                </span>
              </button>
            </Tooltip>
          )}
        </div>
      ),
      header: (): JSX.Element | null => null,
      size: 150,
    }),
  ];

  const isEditSectionBlocked = isActionBlocked(['inscription.grade', 'inscription.group']);
  const editSectionTooltipMessage = getBlockedTooltip(isEditSectionBlocked);

  const handleOpenEditSection = (row: InscriptionSection) => {
    if (isEditSectionBlocked) return;

    setSelectedInscription(row);
    setValue('level', row.section?.level);
    setValue('grade', row.section?.grade);
    setValue('group', row.section?.group || '');
    onOpenTo();
  };

  const rowHover = (row?: InscriptionSection) => {
    if (!row) {
      setHoverSection(undefined);
      return;
    }
    const { section } = row;
    setHoverSection(section || 'sin sección');
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateStudentSection.mutateAsync(
        {
          id: selectedInscription?.id || '',
          school_id: schoolId || '',
          data: {
            section: data.section,
          },
        },
        {
          onSuccess: async () => {
            await utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
            onCloseTo();
          },
        }
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const handleCancel = () => {
    onCloseTo();
  };

  return (
    <div>
      {!isStudentLoading && (
        <div className="mb-4 rounded-lg border border-[#E4EBF6]">
          <TableVirtualized
            columns={columns}
            onRowHover={rowHover}
            data={student?.inscription_section || []}
            isLoading={isStudentLoading}
            totalCount={student?.inscription_section?.length || 0}
            totalFetched={student?.inscription_section?.length || 0}
            hasNextPage={false}
            isFetchingNextPage={false}
            fetchNextPage={() => void 0}
            hideFooter
            maxHeight={((student?.inscription_section?.length ?? 0) + 1) * 53.5}
          />
        </div>
      )}
      <Dialog.Root
        open={openTo && !!selectedInscription}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onCloseTo();
          }
        }}
      >
        <Dialog.Title>Editar sección</Dialog.Title>
        <Dialog.Description>
          <div>
            <span>
              Ingresa la nueva sección que tendrá el estudiante en el {selectedInscription?.school_cycle?.name}
            </span>
          </div>
        </Dialog.Description>
        <div>
          <form className="flex flex-col justify-between h-full gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Nivel"
                  className="w-full outline-none min-h-[56px] h-full"
                  onValueChange={(e) => {
                    setValue('grade', '');
                    setValue('group', '');
                    onChange(e);
                  }}
                  value={value}
                  error={errors.level?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {levels?.map((level) => (
                      <Select.Item className="w-full bg-gray-200 outline-none" value={level.id} key={level.id}>
                        {level.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="grade"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Grado"
                  className="w-full outline-none min-h-[56px] h-full"
                  onValueChange={onChange}
                  value={value}
                  error={errors.grade?.message}
                  disabled={!gradesOptions?.length}
                >
                  <Select.Content className="w-full outline-none">
                    {gradesOptions?.map((grade) => (
                      <Select.Item className="w-full bg-gray-200 outline-none" value={grade} key={grade}>
                        {grade}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="group"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Grupo"
                  className="w-full outline-none min-h-[56px] h-full"
                  onValueChange={onChange}
                  value={value}
                  error={errors.group?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {!groupOptions?.length && (
                      <Select.Item className="w-full bg-gray-200 outline-none" value="-" key="-" disabled>
                        No hay grupos disponibles
                      </Select.Item>
                    )}
                    {groupOptions?.map((group) => (
                      <Select.Item className="w-full bg-gray-200 outline-none" value={group} key={group}>
                        {group}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <div className="flex justify-center gap-6">
              <Button
                variant="ghost"
                size="small"
                className="text-green text-sm px-4 py-2 round-lg w-[150px]"
                onClick={() => handleCancel()}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="text-sm round-lg px-4 py-2 w-[150px] h-9"
                type="submit"
                disabled={updateStudentSection.isPending}
              >
                Guardar
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Root>
    </div>
  );
};
