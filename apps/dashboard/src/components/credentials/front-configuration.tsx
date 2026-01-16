import { ToggleableListItem } from './shared/toggleable-list-item';
import { DateField } from './shared/date-field';
import { CREDENTIAL_FIELD_LABELS, type CredentialConfig } from './types';

type FrontConfigurationProps = {
  config: CredentialConfig;
  onConfigChange: (config: CredentialConfig) => void;
};

type FrontFieldKey = keyof CredentialConfig['front_fields'];

export function FrontConfiguration({ config, onConfigChange }: FrontConfigurationProps) {
  function handleFieldToggle(field: FrontFieldKey, enabled: boolean) {
    onConfigChange({
      ...config,
      front_fields: {
        ...config.front_fields,
        [field]: {
          ...config.front_fields[field],
          show: enabled,
        },
      },
    });
  }

  function handleExpiresAtToggle(enabled: boolean) {
    onConfigChange({
      ...config,
      front_fields: {
        ...config.front_fields,
        expires_at: {
          ...config.front_fields.expires_at,
          show: enabled,
        },
      },
    });
  }

  function handleExpiresAtDateChange(date: string | undefined) {
    onConfigChange({
      ...config,
      front_fields: {
        ...config.front_fields,
        expires_at: {
          ...config.front_fields.expires_at,
          value: date || '',
        },
      },
    });
  }

  const allFields: FrontFieldKey[] = [
    'name',
    'last_name',
    'level',
    'cct_identifier',
    'grade',
    'enrollment_code',
    'identifier',
    'school_cycle',
    'expires_at',
  ];

  const editableFields = allFields.filter((field) => config.front_fields[field].editable);

  const editableFieldsWithoutExpiresAt = editableFields.filter((field) => field !== 'expires_at');

  const showExpiresAtField = editableFields.includes('expires_at');

  return (
    <>
      <div className="flex flex-col gap-[8px]">
        {editableFieldsWithoutExpiresAt.map((field) => {
          const fieldConfig = config.front_fields[field];
          return (
            <ToggleableListItem
              key={field}
              id={`field-${field}`}
              label={CREDENTIAL_FIELD_LABELS[field]}
              isEnabled={fieldConfig.show}
              onToggle={(enabled) => handleFieldToggle(field, enabled)}
              showDragHandle={false}
            />
          );
        })}

        {showExpiresAtField ? (
          <DateField
            id="field-expires_at"
            label={CREDENTIAL_FIELD_LABELS.expires_at}
            isEnabled={config.front_fields.expires_at.show}
            onToggle={handleExpiresAtToggle}
            date={config.front_fields.expires_at.value || ''}
            onDateChange={handleExpiresAtDateChange}
            dateLabel="Fecha de expiración"
          />
        ) : null}
      </div>
    </>
  );
}
