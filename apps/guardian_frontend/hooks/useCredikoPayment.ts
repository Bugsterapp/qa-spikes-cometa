import { api } from '~/utils/api';
import useAlert from './useAlert';
import { SupportedPartners, FulfillmentRequestDTO } from '@cometa/trpc/src/integrations/types';

interface UseCredikoPaymentOptions {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useCredikoPayment = (options: UseCredikoPaymentOptions = {}) => {
  const { setAlert } = useAlert();

  const credikoMutation = api.integrations.encryptFulfillments.useMutation({
    onSuccess: (result) => {
      const firstResult = Array.isArray(result) ? result[0] : result;

      if (firstResult?.url) {
        options.onSuccess?.();
        window.location.href = firstResult.url;
      } else {
        setAlert('No se recibió URL de Crediko');
        options.onError?.();
      }
    },
    onError: () => {
      setAlert('No es posible realizar esta acción en este momento');
      options.onError?.();
    },
  });

  const processCredikoPayment = (fulfillments: FulfillmentRequestDTO[]) => {
    credikoMutation.mutate({
      partner: SupportedPartners.Crediko,
      fulfillments,
    });
  };

  return {
    processCredikoPayment,
    isLoading: credikoMutation.isPending,
    isError: credikoMutation.isError,
    error: credikoMutation.error,
  };
};
