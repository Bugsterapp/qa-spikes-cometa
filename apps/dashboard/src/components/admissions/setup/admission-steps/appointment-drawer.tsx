import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@cometa/recreo/v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2';
import { TextArea } from '@cometa/recreo';
import { Info } from 'lucide-react';
import { api } from '/src/utils/api';
import {
  SchoolStepEntity,
  SchoolStepStatusEnum,
  SchoolStepTags,
  SchoolStepTypeEnum,
} from '@cometa/trpc/src/admissions/types';
import { ConfigurationDrawer } from '/src/components/admissions/setup/shared';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { CalendarDialog } from '../dialogs/calendar-dialog';
import { isValidUrl, normalizeUrl } from '/src/utils/url-validation';

const appointmentConfigSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    type: z.enum(['manual', 'platform']),
    url: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'platform') {
        return data.url && data.url.length > 0;
      }
      return true;
    },
    {
      message: 'El link es requerido para plataforma de citas',
      path: ['url'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'platform' && data.url) {
        return isValidUrl(data.url);
      }
      return true;
    },
    {
      message: 'El link debe ser una URL válida (ej: https://ejemplo.com, www.ejemplo.com o ejemplo.com)',
      path: ['url'],
    }
  );

type AppointmentConfigFormData = z.infer<typeof appointmentConfigSchema>;

export type AppointmentValues = {
  name: string;
  description: string;
  type: 'manual' | 'platform';
  url?: string;
};

export type AppointmentConfigurationProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  schoolStep: SchoolStepEntity;
  defaultValues?: AppointmentValues;
};

export function AppointmentConfigurationDrawer({
  isOpen,
  onClose,
  onSuccess,
  schoolStep,
  defaultValues,
}: AppointmentConfigurationProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upsertSchoolSteps = api.admissions.upsertSchoolSteps.useMutation({
    onSuccess: async () => {
      toast({ title: 'Los cambios han sido guardados', variant: 'success' });

      await utils.admissions.getSchoolSteps.invalidate({ schoolId });

      onSuccess?.();
      handleClose();
      setIsSubmitting(false);
    },
    onError: () => {
      toast({ title: 'Error al guardar configuración', variant: 'error' });
      setIsSubmitting(false);
    },
  });

  const [showDialog, setShowDialog] = useState(false);

  function handleCloseDialog() {
    setShowDialog(false);
  }

  const form = useForm<AppointmentConfigFormData>({
    resolver: zodResolver(appointmentConfigSchema),
    defaultValues,
  });

  const {
    watch,
    register,
    formState: { errors },
  } = form;
  const type = watch('type');

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  function getNormalizedUrl(data: AppointmentConfigFormData): string {
    if (data.type === 'manual') return '';
    if (!data.url) return '';
    return normalizeUrl(data.url);
  }

  async function onSubmit(data: AppointmentConfigFormData) {
    setIsSubmitting(true);

    try {
      const formData = { ...data, url: getNormalizedUrl(data) };

      const updatedStep = {
        ...schoolStep,
        name: formData.name,
        description: formData.description,
        status: SchoolStepStatusEnum.Draft,
        school_id: schoolStep.school_id || '',
        order: schoolStep.order || 1,
        tag: schoolStep.tag as SchoolStepTags,
        type: schoolStep.type as SchoolStepTypeEnum,
        rules: schoolStep.rules,
        actions: {
          ...schoolStep.actions,
          to_do: {
            ...schoolStep.actions?.to_do,
            label: schoolStep.actions?.to_do?.label || 'Completar',
            redirect_url: formData.type === 'platform' ? formData.url || '' : '',
          },
          in_progress: {
            ...schoolStep.actions?.in_progress,
            label: schoolStep.actions?.in_progress?.label || 'Continuar',
            redirect_url: schoolStep.actions?.in_progress?.redirect_url || '',
          },
          completed: {
            ...schoolStep.actions?.completed,
            label: schoolStep.actions?.completed?.label || 'Revisar',
            redirect_url: schoolStep.actions?.completed?.redirect_url || '',
          },
        },
      };

      await upsertSchoolSteps.mutateAsync([updatedStep]);
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    form.reset();
  }

  function getHelperText() {
    if (type === 'manual') {
      return 'Las familias verán este paso en su app, donde se indica que el colegio se pondrá en contacto para coordinar la cita. Podrás marcar esta tarea como completada cuando lo necesites.';
    }
    return 'Redireccionaremos al tutor al link que pongas acá para que pueda autogestionar su cita contigo.';
  }

  const isLoading = upsertSchoolSteps.isPending || isSubmitting;

  return (
    <ConfigurationDrawer
      isOpen={isOpen}
      onClose={handleClose}
      onSave={form.handleSubmit(onSubmit)}
      title="Configurar agendamiento"
      isLoading={isLoading}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre de la cita</label>
            <Input {...register('name')} placeholder="Ej: Visita al colegio" isError={!!errors.name} />
            {errors.name ? <span className="text-xs text-red-500 mt-1">{errors.name.message}</span> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción de la cita</label>
            <TextArea
              {...register('description')}
              placeholder="Ej: Te invitamos a conocer las instalaciones"
              className="h-[120px] resize-none"
              isLegacy={false}
            />
            {errors.description ? (
              <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Gestión de la cita</label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(newValue) => {
                    field.onChange(newValue);
                    if (newValue === 'manual') {
                      form.setValue('url', '');
                      form.clearErrors('url');
                    }
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cómo gestionar la cita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Gestionar por cuenta propia</SelectItem>
                    <SelectItem value="platform">Usar plataforma de citas</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              {getHelperText()}
              {/* TODO: Enable in the future
              {type === 'platform' ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowDialog(true)}
                  className="p-0 h-auto underline hover:bg-transparent"
                  type="button"
                >
                  Te mostramos cómo hacerlo
                </Button>
              ) : null}
              */}
            </p>
          </div>

          {type === 'platform' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Link a la plataforma de citas</label>
              <Input
                {...register('url')}
                placeholder="ej: calendly.com, www.google.com, https://mi-sitio.com"
                isError={!!errors.url && type === 'platform'}
              />
              {errors.url && type === 'platform' ? (
                <span className="text-xs text-red-500 mt-1">{errors.url.message}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      <CalendarDialog isOpen={showDialog} onClose={handleCloseDialog} onNext={handleCloseDialog} />
    </ConfigurationDrawer>
  );
}
