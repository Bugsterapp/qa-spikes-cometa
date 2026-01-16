import { ExpandableFieldItem } from '../expandable-field-item';
import { TextEditor } from '../text-editor';

type TextEditorFieldProps = {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function TextEditorField({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  value,
  onChange,
  disabled,
  className,
}: TextEditorFieldProps) {
  return (
    <ExpandableFieldItem
      id={id}
      label={label}
      description={description}
      isEnabled={isEnabled}
      onToggle={onToggle}
      disabled={disabled}
      className={className}
    >
      <TextEditor value={value} onChange={onChange} disabled={disabled} />
    </ExpandableFieldItem>
  );
}
