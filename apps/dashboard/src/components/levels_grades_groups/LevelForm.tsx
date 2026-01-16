import {
  Button,
  Input,
  Label,
  ContainerError,
  SelectInput,
  SelectInputTrigger,
  SelectInputValue,
  SelectInputContent,
  SelectInputItem,
} from '@cometa/recreo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { Events } from '../../constants/events';
import { LevelType, SrcSchoolsApiDomainEntitiesLevelEntity } from '@cometa/trpc/src/students/types';
import SidebarHeader from '../molecules/dashboard/SidebarHeader';
import SidebarActions from '../atoms/SidebarActions';
import CAlert from '../atoms/CAlert';

const LevelTypeSpanish: Record<LevelType, string> = {
  PRE_SCHOOL: 'Preescolar',
  ELEMENTARY: 'Primaria',
  MIDDLE: 'Secundaria',
  'MIDDLE-HIGH': 'Profesional técnico',
  HIGH: 'Bachillerato o su equivalente',
};

export type LevelFormDTO = {
  name: string;
  type: string;
};

type LevelsGradesGroupsFormProps = {
  readonly onClose: () => void;
  readonly onSave: (data: LevelFormDTO) => void;
  readonly isLoading?: boolean;
  readonly level?: SrcSchoolsApiDomainEntitiesLevelEntity;
};

const schema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().min(1, 'Tipo es requerido'),
});

type FormValues = z.infer<typeof schema>;

export function LevelsGradesGroupsForm({ onClose, onSave, level, isLoading }: LevelsGradesGroupsFormProps) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: level?.name ?? '',
      type: level?.type ?? '',
    },
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (level?.type) {
      setValue('type', level.type);
    }
  }, [level?.type, setValue]);

  const isEditing = !!level?.id;

  const onSubmit = (data: FormValues) => {
    onSave(data as LevelFormDTO);
  };

  return (
    <>
      <SidebarHeader
        title={isEditing ? 'Editar nivel' : 'Crear nivel'}
        onClose={onClose}
        boxClassName="border-b border-neutral-200 px-8"
      />
      <div className="flex flex-col px-8 h-full overflow-y-auto pt-6">
        <form className="mt-6 h-full justify-between flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-8 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1C1C1D]" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold leading-5">Información del nivel</span>
                  <span className="text-base font-normal text-[#637381] leading-6">
                    Proporciona la información básica del nivel educativo.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#637381] text-sm font-normal" isError={!!errors.name?.message}>
                    Nombre del nivel
                  </Label>
                  <Input
                    {...register('name')}
                    id="name"
                    type="text"
                    error={errors.name?.message}
                    isLegacy={false}
                    placeholder="Preparatoria"
                    className="px-4 py-3 rounded-lg text-[#1C1C1D] h-12"
                  />
                  <ContainerError error={errors.name?.message as string} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#637381] text-sm font-normal" isError={!!errors.type?.message}>
                    Categoría educativa
                  </Label>
                  <SelectInput
                    onValueChange={(value: string) => {
                      setValue('type', value, { shouldValidate: true });
                    }}
                    value={watch('type')}
                  >
                    <SelectInputTrigger className="w-full outline-none rounded-lg h-12">
                      <SelectInputValue placeholder="Selecciona una categoría educativa" />
                    </SelectInputTrigger>
                    <SelectInputContent className="w-full outline-none">
                      {Object.entries(LevelTypeSpanish).map(([key, displayName]) => (
                        <SelectInputItem key={key} value={key} className="w-full hover:bg-[#F5FAFF] outline-none">
                          {displayName}
                        </SelectInputItem>
                      ))}
                    </SelectInputContent>
                  </SelectInput>
                  <ContainerError error={errors.type?.message as string} />

                  <CAlert
                    type="info"
                    message="Esta categoría educativa aparecerá en las facturas generadas para este nivel educativo (Preescolar, Primaria,
                      Secundaria, etc.)."
                  />
                </div>
              </div>
            )}
          </div>

          <SidebarActions className="justify-end px-0 shadow-none">
            <Button
              type="button"
              color="black"
              variant="text"
              onClick={() => {
                sendTrackEventWithUserName(Events.level_edit_click_cancel);
                onClose();
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" color="black" variant="solid" disabled={!isValid || isLoading}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </SidebarActions>
        </form>
      </div>
    </>
  );
}
