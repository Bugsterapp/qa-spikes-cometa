import React, { useState } from 'react';
import { formatPrice, typeOfOrdersInStore } from '~/utils/orders';
import { useAlert } from '~/hooks';
import moment from 'moment';
import Box from '~/components/atoms/common/Box';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { api } from '~/utils/api';
import { Button } from '~/components/ui/Button';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import { CopyToClipboard } from '~/components/CopyToClipboard';
import { useSelectionStore } from '~/stores/selectionStorePersisted';
import { CartItem } from '@cometa/hooks';

interface KushkiTransferInCardProps {
  items: Omit<CartItem, 'id'>[];
  guardian: string;
  currency: string;
  hasCommission?: boolean;
  handlerClabe: () => void;
  setStockError?: (value: boolean) => void;
  prices: {
    subtotal: number;
    commissions: number;
    total: number;
  };
  disableMutation?: boolean;
  clabeData?: { clabe: string };
}

export const RFC_KUSHKI = 'KUS1812121C1';

const KushkiTransferInCard = ({
  items,
  currency,
  prices,
  hasCommission,
  handlerClabe,
  setStockError,
  disableMutation,
  clabeData,
}: KushkiTransferInCardProps) => {
  const [kushki, setKushki] = useState<{ clabe: string } | null>(clabeData || null);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const { setAlert } = useAlert();
  const sendEvent = useSendEvent();
  const { selectedItems } = useSelectionStore();
  const { optional, mandatory } = typeOfOrdersInStore(selectedItems);

  // Setup expiration date when clabeData is provided externally
  React.useEffect(() => {
    if (clabeData && !expirationDate) {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const expirationDateFormatted = moment(twoDaysFromNow).format('DD/MM/YYYY');
      setExpirationDate(expirationDateFormatted);
    }
  }, [clabeData, expirationDate]);

  // Only use the mutation if not disabled
  const { mutate: mutateCheckoutTransferIn, isPending: isLoading } = api.kushki.checkoutTransferIn.useMutation({
    onSuccess(data) {
      localStorage.removeItem(RATED_CSAT_PAYMENT);
      setKushki(data);
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const expirationDateFormatted = moment(twoDaysFromNow).format('DD/MM/YYYY');
      setExpirationDate(expirationDateFormatted);
      handlerClabe();
    },
    onError(error) {
      if ((error as any)?.meta?.responseJSON[0]?.error?.json?.message) {
        setStockError?.(true);
      } else {
        setAlert('No es posible realizar esta acción en este momento');
      }
    },
  });

  const handlerClick = () => {
    sendEvent(TrackEvents.checkout.bankTransfer.bankTransferInitiated, { optional, mandatory });
    if (!disableMutation) {
      mutateCheckoutTransferIn({ items });
    }
  };

  const clabe = kushki?.clabe ?? '';

  return (
    <Box className="align-middle flex flex-col justify-around gap-2.5">
      <div className="flex flex-col gap-y-6">
        {hasCommission && (
          <>
            <div className="flex flex-col justify-start- px-6 gap-2.5 text-[#212B36]">
              <span className="text-sm font-medium">Subtotal a pagar</span>
              <span className="text-xs font-semibold">{formatPrice(prices.subtotal, currency) + ' ' + currency}</span>
              <span className="text-xs font-medium text-[#637381]">
                +{formatPrice(prices.commissions, currency)} fee administrativo
              </span>
            </div>
            <hr className="border-[#d8d7dc]" />
          </>
        )}
        <div className="flex flex-col justify-start px-6 gap-y-2.5">
          <div>
            <span className="text-sm font-medium text-secondary">Total a pagar</span>
            <div className="font-semibold text-blue-100">
              <span className="text-2xl">{formatPrice(prices.total, currency)}</span> {currency}
            </div>
          </div>
          <span className="text-sm font-medium text-secondary">
            Recuerda ingresar el monto exacto, tal cual figura en el “Total a pagar”.
          </span>
        </div>
        <hr className="border-[#d8d7dc]" />
        <div className="px-6 text-start flex flex-col justify-between gap-2.5">
          <span className="text-sm font-medium">CLABE:</span>
          {!kushki ? (
            <Button className="text-sm font-semibold py-1.5 px-4" onClick={handlerClick} disabled={isLoading}>
              {isLoading ? 'GENERANDO CLABE...' : 'GENERAR CLABE'}
            </Button>
          ) : (
            <>
              <div className="flex flex-row items-center">
                <CopyToClipboard
                  text={clabe}
                  successMessage="CLABE copiada"
                  onCopy={() => sendEvent(TrackEvents.checkout.bankTransfer.bankCodeCopied)}
                >
                  <span className="text-[#3366FF]">{clabe}</span>
                </CopyToClipboard>
              </div>
              <span className="text-sm text-[#808080]">Esta CLABE expira el {expirationDate}</span>
            </>
          )}
          <div className="border-t-[#D6D6D6] border-t pt-3 border-solid">
            <h6 className="mb-2 text-sm font-medium">RFC de destino:</h6>
            <CopyToClipboard
              onCopy={() => sendEvent(TrackEvents.checkout.bankTransfer.bankTransferTaxIdCopied)}
              text={RFC_KUSHKI}
              successMessage="RFC copiado"
            >
              <span className="text-[#3366FF]">{RFC_KUSHKI}</span>
            </CopyToClipboard>
          </div>
        </div>
        <hr className="border-[#d8d7dc]" />
        <div className="flex flex-col gap-4 px-6">
          <div className="flex flex-row justify-between">
            <span className="text-sm font-medium">Banco de destino:</span>
            <span className="text-sm font-medium text-[#808080]">STP</span>
          </div>
          <div className="flex flex-row justify-between">
            <span className="text-sm font-medium">Beneficiario:</span>
            <span className="text-sm font-medium text-[#808080]">Kushki</span>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default KushkiTransferInCard;
