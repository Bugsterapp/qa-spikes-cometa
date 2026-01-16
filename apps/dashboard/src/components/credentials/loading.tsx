import { useCredential } from './credential-context';
import { LoadingScreen } from './loading-screen';

export function Loading() {
  const { isCreating, isUpdating, isLoading } = useCredential();

  const showLoading = isCreating || isUpdating || isLoading;

  if (!showLoading) return null;

  let title = 'Cargando plantilla...';
  let description = 'Tu plantilla de credencial se está cargando. En unos segundos estará lista.';

  if (isCreating) {
    title = 'Creando plantilla...';
    description = 'Tu plantilla de credencial se está guardando. En unos segundos estará lista para usar.';
  } else if (isUpdating) {
    title = 'Actualizando plantilla...';
    description = 'Los cambios en tu plantilla se están guardando. En unos segundos estarán listos.';
  }

  return <LoadingScreen title={title} description={description} />;
}
