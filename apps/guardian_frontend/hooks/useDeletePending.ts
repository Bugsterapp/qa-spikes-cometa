import { useSession } from 'next-auth/react';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import { api } from '~/utils/api';
import useAlert from './useAlert';
import { useSendTrackEvent } from '@cometa/utils';
import { Events } from '~/constants/events';

export const useDeletePending = () => {
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();
  const selectedSchoolId = useSelectedSchoolId();
  const session = useSession();
  const { mutateAsync: mutateAsyncDeletePayin, isLoading } = api.payin.deletePayin.useMutation();

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
        sendTrackEvent(Events.payment_deleted);
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
