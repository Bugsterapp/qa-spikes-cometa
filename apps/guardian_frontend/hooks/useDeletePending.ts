import { useSession } from 'next-auth/react';
import { useSelectedSchoolId } from '~/stores/globalStore';
import { api } from '~/utils/api';
import useAlert from './useAlert';
import { useSendTrackEvent } from '@cometa/utils';

export const useDeletePending = () => {
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();
  const selectedSchoolId = useSelectedSchoolId();
  const session = useSession();
  const { mutateAsync: mutateAsyncDeletePayin, isPending: isLoading } = api.payin.deletePayin.useMutation();

  const handleDeleted = (payinId: string, onClose: () => void, onDeleted: () => void) => {
    mutateAsyncDeletePayin({
      payinId: payinId,
      schoolId: selectedSchoolId ?? '',
    })
      .then(() => {
        sendTrackEvent('portal: Pending Payment Deleted', session, { payinId });
        setAlert('El pago en proceso ha sido eliminado.', 'success');
      })
      .finally(() => {
        onDeleted();
        onClose();
      })
      .catch(() => {
        setAlert('No se puede eliminar en estos momentos.');
        onClose();
      });
  };

  return {
    handleDeleted,
    isLoading,
  };
};
