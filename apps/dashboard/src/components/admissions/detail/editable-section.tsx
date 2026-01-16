'use client';

import { Button, Dialog } from '@cometa/recreo';
import * as InfoBox from '/src/components/ui/InfoBox';
import * as List from '/src/components/ui/List';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import { cn } from '@cometa/utils';
import { type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useState, type ReactNode, useCallback } from 'react';
import useAlert from '/src/hooks/useAlert';
import { useSelectedSchool } from '/src/guards/AuthGuard';

export type MutateResult = {
  success: boolean;
  error: string | null;
};

export type InfoItem = {
  label: string;
  value: string | string[] | number | null | undefined;
  isItalic?: boolean;
};

export type CommonSectionProps = {
  isEditing: boolean;
  isLoading: boolean;
  setIsEditing: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
};

function InfoSection({ items }: { items: InfoItem[] }) {
  return (
    <InfoBox.Content>
      <List.List>
        {items.map(({ label, value, isItalic }) => (
          <List.Item key={`${label}-${value}`} className="flex items-center">
            <span className="w-[20%] text-xs leading-[18px] text-[#6E7480]">{label}</span>
            <span
              className={cn('text-base leading-6 text-[#1C1C1D]', {
                'text-sm text-[#686F87] italic': isItalic,
              })}
            >
              {value}
            </span>
          </List.Item>
        ))}
      </List.List>
    </InfoBox.Content>
  );
}

type EditableSectionProps<TFormValues extends FieldValues = FieldValues> = CommonSectionProps & {
  title: string;
  items: InfoItem[];
  form: UseFormReturn<TFormValues>;
  onSave: (data: TFormValues) => Promise<boolean>;
  defaultValues: TFormValues;
  children: ReactNode;
};

export function EditableSection<TFormValues extends FieldValues>({
  title,
  items,
  form,
  defaultValues,
  isEditing,
  isLoading,
  setIsEditing,
  setIsLoading,
  onSave,
  children,
}: EditableSectionProps<TFormValues>) {
  const { setAlertState } = useAlert();
  const [openDialog, setOpenDialog] = useState(false);

  const {
    formState: { isDirty },
    reset,
    handleSubmit,
  } = form;

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setOpenDialog(true);
    } else {
      setIsEditing(false);
    }
  }, [isDirty, setIsEditing]);

  const handleEdit = useCallback(() => {
    reset(defaultValues);
    setIsEditing(true);
  }, [defaultValues, reset, setIsEditing]);

  const onSubmit = useCallback(
    async (data: TFormValues) => {
      setIsLoading(true);
      if (!isDirty) {
        setIsLoading(false);
        setIsEditing(false);
        return;
      }
      const isSuccess = await onSave(data);
      if (isSuccess) {
        setAlertState({
          open: true,
          severity: 'success',
          message: 'Prospecto actualizado exitosamente',
        });
      } else {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Ocurrió un error al actualizar el prospecto',
        });
      }
      reset(defaultValues);
      setIsLoading(false);
      setIsEditing(false);
    },
    [isDirty, onSave, setIsEditing]
  );

  const handleDiscard = useCallback(() => {
    reset(defaultValues);
    setIsEditing(false);
    setOpenDialog(false);
  }, [defaultValues, reset, setIsEditing]);

  return (
    <>
      <InfoBox.Root>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InfoBox.Header title={title}>
            <EditButton
              isEditing={isEditing}
              isLoading={isLoading}
              isDirty={isDirty}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </InfoBox.Header>
          <InfoBox.Content>
            {isEditing ? <div className="flex flex-col gap-4 mt-6">{children}</div> : <InfoSection items={items} />}
          </InfoBox.Content>
        </form>
      </InfoBox.Root>

      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Title>¿Deseas descartar los cambios?</Dialog.Title>
        <Dialog.Description>Los cambios que realizaste se perderán si continúas.</Dialog.Description>
        <div className="flex justify-end gap-3">
          <Dialog.Close asChild>
            <Button
              variant="outline"
              className="w-[156px] h-9 bg-transparent rounded-lg text-[#637381] font-bold text-sm hover:no-underline flex items-center justify-center"
              onClick={() => setOpenDialog(false)}
            >
              Volver
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              variant="outline"
              className="w-[156px] h-9 bg-[#FF4842] hover:bg-[#FF4842]/90 text-white rounded-lg font-bold text-sm shadow-[0_8px_16px_rgba(255,72,66,0.24)] flex items-center justify-center"
              onClick={handleDiscard}
            >
              Descartar
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Root>
    </>
  );
}

type EditButtonProps = {
  isEditing: boolean;
  isLoading: boolean;
  isDirty: boolean;
  onEdit: () => void;
  onCancel: () => void;
};

function EditButton({ isEditing, isLoading, isDirty, onEdit, onCancel }: EditButtonProps) {
  const selectedSchool = useSelectedSchool();
  const canEdit = Boolean(selectedSchool?.config_dashboard?.edit_admission_detail);

  if (!canEdit) return null;
  return isEditing ? (
    <div className="flex gap-2">
      <Button onClick={onCancel} variant="text" size="small" color="legacy">
        Descartar
      </Button>
      <Button type="submit" variant="solid" color="legacy" size="small" disabled={!isDirty || isLoading}>
        Guardar
      </Button>
    </div>
  ) : (
    <div className="ml-auto">
      <Button onClick={onEdit} variant="outline" className="border-none text-green gap-2 h-7">
        <IcEdit className="w-5 h-5" />
        Editar
      </Button>
    </div>
  );
}
