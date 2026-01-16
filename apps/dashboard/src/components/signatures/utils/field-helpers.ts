import { TemplateFieldType, type TemplateFieldEntity } from '@cometa/trpc/src/students/types';

export function getFieldLabel(field: TemplateFieldEntity): string {
  if (field.fieldMeta && 'label' in field.fieldMeta && field.fieldMeta.label) {
    return field.fieldMeta.label;
  }
  return getFieldTypeLabel(field.type);
}

export function getFieldTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    [TemplateFieldType.TEXT]: 'Texto',
    [TemplateFieldType.NAME]: 'Nombre',
    [TemplateFieldType.EMAIL]: 'Email',
    [TemplateFieldType.DATE]: 'Fecha',
    [TemplateFieldType.NUMBER]: 'Número',
    [TemplateFieldType.SIGNATURE]: 'Firma',
    [TemplateFieldType.INITIALS]: 'Iniciales',
    [TemplateFieldType.CHECKBOX]: 'Checkbox',
    [TemplateFieldType.RADIO]: 'Radio',
    [TemplateFieldType.DROPDOWN]: 'Dropdown',
  };
  return typeLabels[type] || type;
}
