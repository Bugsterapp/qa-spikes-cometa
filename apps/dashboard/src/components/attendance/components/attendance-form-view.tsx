import { Controller, UseFormReturn } from 'react-hook-form';
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@cometa/recreo/v2';
import { DatePicker } from '@cometa/recreo/v2/components/date-picker';
import { InfoIcon, StarIcon, ChevronRightIcon, AlertCircle, Loader2 } from 'lucide-react';
import { FormData } from '../hooks/use-take-attendance-form';
import { AttendanceContextTypeEnum } from '@cometa/trpc/src/students/types';
import { format } from 'date-fns';
import { LevelEntity } from '@cometa/trpc/src/students/types-mapping';

type AttendanceFormViewProps = {
  form: UseFormReturn<FormData>;
  searchText: string;
  setSearchText: (text: string) => void;
  levels: LevelEntity[];
  contexts: any[];
  contextType: AttendanceContextTypeEnum | null;
  hasAttendanceConfig: boolean;
  isLoadingLevelConfig: boolean;
  selectedLevel: LevelEntity | undefined;
  isLoadingLevels: boolean;
  isLoadingContexts: boolean;
  onContextSelect: (id: string) => void;
};

export function AttendanceFormView({
  form,
  searchText,
  setSearchText,
  levels,
  contexts,
  contextType,
  hasAttendanceConfig,
  isLoadingLevelConfig,
  selectedLevel,
  isLoadingLevels,
  isLoadingContexts,
  onContextSelect,
}: AttendanceFormViewProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = form;
  const selectedLevelId = watch('levelId');

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Nuevo registro</h3>
        <p className="text-sm text-gray-600">Selecciona la fecha, el nivel y el grupo o clase.</p>
      </div>

      <div className="bg-gradient-to-r from-[#E6F2FA] to-[#F1F1FD] rounded-lg p-4 flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 flex-1">
            <Label className="text-gray-600">Fecha</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(date) => {
                    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                    field.onChange(formattedDate);
                  }}
                  placeholder="Selecciona una fecha"
                  className="bg-white h-12"
                  error={errors.date?.message}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <Label className="text-gray-600">Nivel</Label>
            <Controller
              name="levelId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLevels ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : (
                      levels?.map((level) => (
                        <SelectItem key={level.id} value={level.id as string}>
                          {level.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.levelId && <p className="text-sm text-red-600">{errors.levelId.message}</p>}
          </div>
        </div>

        {selectedLevelId && isLoadingLevelConfig && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Cargando configuración del nivel...</span>
          </div>
        )}

        {selectedLevelId && !isLoadingLevelConfig && !hasAttendanceConfig && (
          <div className="flex items-center gap-2 text-sm text-amber-700 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Este nivel no tiene configurada la toma de asistencia. Contacta al administrador para configurarlo.
            </span>
          </div>
        )}

        {hasAttendanceConfig && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="text-gray-600">
                {contextType === AttendanceContextTypeEnum.Classroom ? 'Clase' : 'Grupo'}
              </Label>
              <Input
                placeholder={
                  contextType === AttendanceContextTypeEnum.Classroom ? 'Buscar clase...' : 'Buscar grupo...'
                }
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                disabled={!selectedLevelId}
                className="bg-white"
              />
            </div>

            {selectedLevelId && selectedLevel && (
              <div className="flex items-center gap-1 text-sm text-gray-600 p-1">
                <InfoIcon size={14} />
                <span>
                  En {selectedLevel.name}, las inasistencias se toman por{' '}
                  {contextType === AttendanceContextTypeEnum.Classroom ? 'clase' : 'grupo'}.
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {hasAttendanceConfig && selectedLevelId && contexts.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {contextType === AttendanceContextTypeEnum.Classroom ? 'Mis Clases' : 'Mis Grupos'}
          </h3>

          {isLoadingContexts ? (
            <div className="flex justify-center py-8">
              <img src="/assets/loading.svg" alt="loading" className="w-8 h-8" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {contexts.map((context) => (
                <button
                  key={context.id}
                  onClick={() => onContextSelect(context.id)}
                  className="flex items-center justify-between p-4 hover:bg-[#F8F9FB] rounded-lg border border-gray-200 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <StarIcon size={20} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">
                        {contextType === AttendanceContextTypeEnum.Classroom
                          ? `${context.course?.name} · ${context.grade?.name ?? ''} ${context.group?.name ?? ''}`
                          : `${context.level?.name} · ${context.grade?.name} ${context.name}`}
                      </span>
                      <span className="text-sm text-gray-500">Profesor · {selectedLevel?.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 items-center group-hover:opacity-100 transition-opacity text-gray-500">
                    <span className="text-sm font-semibold">Editar asistencia</span>
                    <ChevronRightIcon size={16} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
