'use client';

import { CardTitle, CardItem, Card, CardContent, ChipItems } from '~/components/Card';
import { Button } from '@cometa/recreo';
import { PencilIcon } from 'lucide-react';
import { type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useCallback, type ReactNode } from 'react';

export type MutateResult = {
  success: boolean;
  error: string | null;
};

export type InfoItem = {
  label: string;
  value: string | string[] | number | null | undefined;
  name?: string;
};

function InfoSection({ items }: { items: InfoItem[] }) {
  return (
    <>
      {items.map(({ label, value }) => (
        <CardItem key={label} label={label} value={Array.isArray(value) ? <ChipItems items={value} /> : value} />
      ))}
    </>
  );
}

type EditableSectionProps<TFormValues extends FieldValues = FieldValues> = {
  title: string;
  items: InfoItem[];
  form: UseFormReturn<TFormValues>;
  defaultValues: TFormValues;
  children: ReactNode;
  isEditing: boolean;
  canEdit: boolean;
  setIsEditing: (value: boolean) => void;
};

export function EditableSection<TFormValues extends FieldValues>({
  title,
  items,
  form,
  defaultValues,
  isEditing,
  canEdit,
  setIsEditing,
  children,
}: EditableSectionProps<TFormValues>) {
  const { reset, trigger } = form;

  const handleCancel = useCallback(async () => {
    reset(defaultValues);
    setIsEditing(false);
  }, [defaultValues, reset, setIsEditing]);

  const handleEdit = useCallback(async () => {
    reset(defaultValues);
    await trigger();
    setIsEditing(true);
  }, [defaultValues, reset, setIsEditing]);

  return (
    <Card>
      <CardTitle className="py-4">
        <div className="flex justify-between items-center">
          <span className="text-base not-italic font-semibold">{title}</span>
          <EditButton isEditing={isEditing} canEdit={canEdit} onEdit={handleEdit} onCancel={handleCancel} />
        </div>
      </CardTitle>
      <CardContent>
        {isEditing ? <div className="flex flex-col gap-4">{children}</div> : <InfoSection items={items} />}
      </CardContent>
    </Card>
  );
}

function EditButton({
  isEditing,
  canEdit,
  onCancel,
  onEdit,
}: {
  isEditing: boolean;
  canEdit: boolean;
  onCancel: () => void;
  onEdit: () => void;
}) {
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

export function transformFormData<T extends Record<string, any>>(data: T): T {
  const list: string[] = ['drugs', 'family_history', 'personal_history', 'current_ailments'];
  const notTransform: string[] = [
    'recent_interventions',
    'other_history',
    'drug_allergies',
    'food_allergies',
    'plant_allergies',
    'other_allergies',
    'pending_vaccines',
    'comments',
  ];

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (notTransform.includes(key)) {
        return [key, value];
      }
      if (value === 'Sí') {
        return [key, true];
      } else if (value === 'No') {
        return [key, false];
      } else if (value === 'Otro') {
        return [key, null];
      } else if (list.includes(key)) {
        return [key, value ? value.join(', ') : ''];
      } else if (value === '-') {
        return [key, null];
      }
      return [key, value ? value : null];
    })
  ) as T;
}

export function isHidden(field: string, hiddenFields: string[]) {
  return hiddenFields?.includes(field) ?? false;
}

export function isSectionHidden(fields: string[], hiddenFields: string[]) {
  return fields.every((field) => hiddenFields?.includes(field));
}
