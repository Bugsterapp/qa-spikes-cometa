import { Button } from '@cometa/recreo/v2';
import SidebarActions from '../../../atoms/SidebarActions';

type FormActionsProps = {
  onCancel: () => void;
  isLoading?: boolean;
  cancelText?: string;
  submitText?: string;
  loadingText?: string;
};

export function FormActions({
  onCancel,
  isLoading = false,
  cancelText = 'Descartar',
  submitText = 'Guardar',
  loadingText = 'Guardando...',
}: Readonly<FormActionsProps>) {
  return (
    <SidebarActions variant="form">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button type="submit" variant="default" disabled={isLoading}>
        {isLoading ? loadingText : submitText}
      </Button>
    </SidebarActions>
  );
}
