import React, { useState } from 'react';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { formatPrice } from '~/utils/orders';
import ApiClient from '~/services/ApiClient';
import { useAlert } from '~/hooks';
import moment from 'moment';
import Box from '~/components/atoms/common/Box';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import { Events } from '~/constants/events';
import useSendTrackEvent from '~/hooks/useSendEvent';

interface KushkiTransferInCardProps {
  items: { order: string; student: string }[];
  guardian: string;
  token: string;
  currency: string;
  hasCommission?: boolean;
  handlerClabe: () => void;
  prices: {
    subtotal: number;
    commissions: number;
    total: number;
  };
}

const KushkiTransferInCard = ({
  items,
  guardian,
  token,
  currency,
  prices,
  hasCommission,
  handlerClabe,
}: KushkiTransferInCardProps) => {
  const [kushki, setKushki] = useState<{ clabe: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();

  const handlerClick = async () => {
    try {
      setLoading(true);
      sendTrackEvent(Events.bank_transfer_initiated_kushki, { order_info: { prices, currency, items, guardian } });
      const { data } = await ApiClient.postKushkiTransfer(guardian, items, token);
      localStorage.removeItem(RATED_CSAT_PAYMENT);
      setKushki(data);
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const expirationDateFormatted = moment(twoDaysFromNow).format('DD/MM/YYYY');
      setExpirationDate(expirationDateFormatted);
      handlerClabe();
    } catch (error) {
      setAlert('No es posible realizar esta acción en este momento');
    }
    setLoading(false);
  };

  const clabe = kushki?.clabe ?? '';

  return (
    <Box className="align-middle flex flex-col justify-around gap-2.5">
      <Stack divider={<Divider sx={{ borderColor: 'grey' }} flexItem />} spacing={3}>
        {hasCommission && (
          <div className="flex flex-col justify-start- px-6 gap-2.5 text-[#212B36]">
            <Typography fontSize={14} fontWeight={500}>
              Subtotal a pagar
            </Typography>
            <Typography fontSize={12} fontWeight={600}>
              {formatPrice(prices.subtotal, currency) + ' ' + currency}
            </Typography>
            <Typography fontSize={12} fontWeight={500} color="#637381">
              +{formatPrice(prices.commissions, currency)} fee administrativo
            </Typography>
          </div>
        )}
        <div className="flex flex-col justify-start px-6 gap-2.5">
          <Typography fontSize={14} fontWeight={500} color="#212B36">
            Total a pagar
          </Typography>
          <Typography color="primary" fontSize={16} fontWeight={600}>
            {formatPrice(prices.total, currency) + ' ' + currency}
          </Typography>
        </div>
        <div className="px-6 text-start flex flex-col justify-between gap-2.5">
          <Typography fontSize={14} fontWeight={500}>
            CLABE:
          </Typography>
          {!kushki ? (
            <Button variant="contained" onClick={handlerClick} disabled={loading}>
              {loading ? 'GENERANDO CLABE...' : 'GENERAR CLABE'}
            </Button>
          ) : (
            <>
              <div className="flex flex-row items-center">
                <CopyToClipboard text={clabe} successMessage="CLABE copiada" />
              </div>
              <Typography color="gray" fontSize={14}>
                Esta CLABE expira el {expirationDate}
              </Typography>
            </>
          )}
          <div className="border-t-[#D6D6D6] border-t pt-3 border-solid">
            <h6 className="mb-2 text-sm font-medium">RFC de destino:</h6>
            <CopyToClipboard text="KUS1812121C1" successMessage="RFC copiado" />
          </div>
        </div>
        <div className="flex flex-col gap-4 px-6">
          <div className="flex flex-row justify-between">
            <Typography fontSize={14} fontWeight={500}>
              Banco de destino:
            </Typography>
            <Typography fontSize={14} fontWeight={500} color="GrayText">
              STP
            </Typography>
          </div>
          <div className="flex flex-row justify-between">
            <Typography fontSize={14} fontWeight={500}>
              Beneficiario:
            </Typography>
            <Typography fontSize={14} fontWeight={500} color="GrayText">
              Kushki
            </Typography>
          </div>
        </div>
      </Stack>
    </Box>
  );
};

export default KushkiTransferInCard;

const CopyToClipboard = ({ text, successMessage }: { text: string; successMessage: string }) => {
  const { setAlert } = useAlert();

  const copyToClipboard = () => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setAlert(successMessage, 'success'));
    }
  };

  return (
    <div
      className="flex items-center transition-opacity hover:cursor-pointer hover:opacity-70"
      onClick={copyToClipboard}
    >
      <span className="text-[#3366FF]">{text}</span>
      <div className="ml-2 cursor-pointer">
        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_15519_15541)">
            <path
              d="M15.8337 20.6667C16.9383 20.6654 17.9974 20.2259 18.7785 19.4448C19.5596 18.6637 19.999 17.6047 20.0003 16.5V9.20251C20.0016 8.76448 19.916 8.33055 19.7483 7.92586C19.5807 7.52118 19.3343 7.1538 19.0237 6.84501L17.1553 4.97668C16.8465 4.66599 16.4792 4.41968 16.0745 4.25203C15.6698 4.08438 15.2359 3.99872 14.7978 4.00001H10.8337C9.729 4.00134 8.66996 4.44075 7.88884 5.22186C7.10773 6.00298 6.66832 7.06202 6.66699 8.16668V16.5C6.66832 17.6047 7.10773 18.6637 7.88884 19.4448C8.66996 20.2259 9.729 20.6654 10.8337 20.6667H15.8337ZM8.33366 16.5V8.16668C8.33366 7.50364 8.59705 6.86776 9.06589 6.39891C9.53473 5.93007 10.1706 5.66668 10.8337 5.66668C10.8337 5.66668 14.9328 5.67835 15.0003 5.68668V7.33335C15.0003 7.77538 15.1759 8.1993 15.4885 8.51186C15.801 8.82442 16.225 9.00001 16.667 9.00001H18.3137C18.322 9.06751 18.3337 16.5 18.3337 16.5C18.3337 17.1631 18.0703 17.7989 17.6014 18.2678C17.1326 18.7366 16.4967 19 15.8337 19H10.8337C10.1706 19 9.53473 18.7366 9.06589 18.2678C8.59705 17.7989 8.33366 17.1631 8.33366 16.5ZM23.3337 10.6667V19.8333C23.3323 20.938 22.8929 21.997 22.1118 22.7782C21.3307 23.5593 20.2717 23.9987 19.167 24H11.667C11.446 24 11.234 23.9122 11.0777 23.7559C10.9215 23.5997 10.8337 23.3877 10.8337 23.1667C10.8337 22.9457 10.9215 22.7337 11.0777 22.5774C11.234 22.4211 11.446 22.3333 11.667 22.3333H19.167C19.83 22.3333 20.4659 22.07 20.9348 21.6011C21.4036 21.1323 21.667 20.4964 21.667 19.8333V10.6667C21.667 10.4457 21.7548 10.2337 21.9111 10.0774C22.0674 9.92114 22.2793 9.83335 22.5003 9.83335C22.7213 9.83335 22.9333 9.92114 23.0896 10.0774C23.2459 10.2337 23.3337 10.4457 23.3337 10.6667Z"
              fill="#637381"
            />
          </g>
          <defs>
            <clipPath id="clip0_15519_15541">
              <rect width="20" height="20" fill="white" transform="translate(5 4)" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// export default CopyToClipboard;
