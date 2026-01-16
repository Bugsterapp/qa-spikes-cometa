'use client';
import { api } from '~/utils/api';
import { CardTitle, CardItem, Card, CardContent, ChipItems } from '~/components/Card';
import { useRouter } from 'next/router';
import { Button, Drawer } from '@cometa/recreo';
import { useSelectedSchool } from '~/stores/globalStore';
import { PencilIcon } from 'lucide-react';
import { type FieldValues, type UseFormReturn } from 'react-hook-form';
import { type ReactNode } from 'react';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import type { MedicalInfoUpdateDTO } from '@cometa/trpc/src/students/types';

export type InfoItem = {
  label: string;
  value: string | string[] | number | null | undefined;
};

export type CommonSectionProps = {
  isEditing: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  setIsEditing: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  className?: string;
};

function InfoSection({ items }: { items: InfoItem[] }) {
  return (
    <CardContent>
      {items.map(({ label, value }) => (
        <CardItem key={label} label={label} value={Array.isArray(value) ? <ChipItems items={value} /> : value} />
      ))}
    </CardContent>
  );
}

type EditableSectionProps<TFormValues extends FieldValues = FieldValues> = CommonSectionProps & {
  title: string;
  items: InfoItem[];
  form: UseFormReturn<TFormValues>;
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
  isOpen,
  onClose,
  onDiscard,
  setIsEditing,
  setIsLoading,
  children,
  className,
}: EditableSectionProps<TFormValues>) {
  const sendEvent = useSendEvent();
  const router = useRouter();
  const studentId = router.query.studentId as string;
  const utils = api.useUtils();

  const upsertMedicalForm = api.student.upsertMedicalForm.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
      setIsEditing(false);
      setIsLoading(false);
    },
  });

  const {
    formState: { isDirty },
    reset,
    handleSubmit,
  } = form;

  function handleCancel() {
    reset(defaultValues);
    setIsEditing(false);
  }

  function handleEdit() {
    sendEvent(TrackEvents.students.editClicked);
    setIsEditing(true);
  }

  function onSubmit(data: TFormValues) {
    sendEvent(TrackEvents.students.editConfirm);
    setIsLoading(true);

    if (!isDirty) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }
    const transformedData = transformFormData(data);
    upsertMedicalForm.mutate({ studentId, data: transformedData as MedicalInfoUpdateDTO });
  }

  return (
    <Card className={className}>
      <CardTitle className="py-4">
        <div className="flex justify-between items-center">
          <span>{title}</span>
          <EditButton isEditing={isEditing} onEdit={handleEdit} onCancel={handleCancel} />
        </div>
      </CardTitle>
      <CardContent>
        {isEditing ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {children}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-2 px-5 py-2.5"
              >
                Guardar
              </Button>
            </form>
            <DiscardDialog isOpen={isOpen} isLoading={isLoading} onClose={onClose} onDiscard={onDiscard} />
          </>
        ) : (
          <InfoSection items={items} />
        )}
      </CardContent>
    </Card>
  );
}

function DiscardDialog({
  isOpen,
  isLoading,
  onClose,
  onDiscard,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Drawer.Root open={isOpen} className="max-w-sm text-center gap-3" minHeight="30%">
      <div className="flex flex-col gap-3 items-center">
        <DiscardIcon />
        <Drawer.Title>Descartar cambios</Drawer.Title>
      </div>

      <Drawer.Description>
        <p>Los cambios realizados no se guardarán.</p>
        <p>¿Estás seguro que quieres continuar?</p>
      </Drawer.Description>

      <div className="flex flex-col gap-3">
        <Button
          className="bg-[#FD6262] hover:bg-[#FD6262]/90 text-white text-sm font-semibold px-5 py-2.5 w-full"
          onClick={onDiscard}
          disabled={isLoading}
        >
          Descartar
        </Button>
        <Drawer.Close
          onClick={onClose}
          className="bg-transparent text-[#1C1C1D] hover:bg-[#F3F6FB] text-sm font-semibold px-5 py-2.5 w-full rounded-full"
          disabled={isLoading}
        >
          Volver
        </Drawer.Close>
      </div>
    </Drawer.Root>
  );
}

function DiscardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Discard Icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16C32 11.7565 30.3143 7.68687 27.3137 4.68629C24.3131 1.68571 20.2435 0 16 0ZM17.6 22.4C17.6 23.2837 16.8837 24 16 24C15.1163 24 14.4 23.2837 14.4 22.4V14.4C14.4 13.5163 15.1163 12.8 16 12.8C16.8837 12.8 17.6 13.5163 17.6 14.4V22.4ZM14.4 9.6C14.4 10.4837 15.1163 11.2 16 11.2C16.8837 11.2 17.6 10.4837 17.6 9.6C17.6 8.71634 16.8837 8 16 8C15.1163 8 14.4 8.71634 14.4 9.6Z"
        fill="#FD6262"
      />
    </svg>
  );
}

function EditButton({ isEditing, onCancel, onEdit }: { isEditing: boolean; onCancel: () => void; onEdit: () => void }) {
  const selectedSchool = useSelectedSchool();
  const canEdit = Boolean(selectedSchool?.config_portal?.edit_student_medical_portal);

  if (!canEdit) return null;

  if (isEditing) {
    return (
      <Button
        onClick={onCancel}
        className="text-[#1C1C1D] bg-[#F3F6FB] hover:bg-[#E4EBF6] text-sm font-semibold px-4 py-1.5 flex gap-2 items-center"
      >
        Cancelar
      </Button>
    );
  }

  return (
    <Button
      onClick={onEdit}
      className="text-[#1C1C1D] bg-[#F3F6FB] hover:bg-[#E4EBF6] text-sm font-semibold p-2 w-9 h-9 flex items-center justify-center rounded-full"
    >
      <PencilIcon className="w-4 h-4" />
    </Button>
  );
}

function transformFormData<T extends Record<string, any>>(data: T): T {
  const list: string[] = ['drugs', 'family_history', 'personal_history', 'current_ailments'];
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === 'Sí') {
        return [key, true];
      } else if (value === 'No') {
        return [key, false];
      } else if (value === 'Otro') {
        return [key, null];
      } else if (list.includes(key)) {
        return [key, value?.join(', ')];
      }
      return [key, value];
    })
  ) as T;
}
