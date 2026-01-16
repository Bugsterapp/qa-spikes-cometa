import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { BinInfoResponse } from '@kushki/js/lib/types/bin_info_response';
import type { ErrorResponse } from '@kushki/js/lib/types/error_response';
import { CardTypeEnum } from '@cometa/trpc';
import type { TRPCClientErrorLike } from '@trpc/client';
import type { InferrableClientTypes } from '@trpc/server/unstable-core-do-not-import';
import { useKushki } from '~/utils/kushkiCreditCard';
import { getCardBrand } from '~/lib/getCardBrand';
import useDebounce from '~/hooks/useDebounce';
import Cookies from 'lib/Cookies';
import KushkiCardErrorOptions, {
  getKushkiErrorTitle,
  binInfoErrorCodes,
} from '~/constants/kushki/credit-card/DrawerOptions';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { Banner } from '~/components/Banner';
import { cn } from '@cometa/utils';
import Warning from '~/public/icons/warning.svg';
import InformationWhite from '~/public/icons/information-white.svg';
import CreditCardForm, { CardFormSchema } from './CreditCardForm';
import { useUTMRouter } from '../UtmNavigation';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { capitalizeFirstLetter } from '~/utils/string';

export const MIN_NUM_BIN = 6;
export const MAX_RETRIES_COUNTER = 5;

export const cardCookieKey = (number: string, expiryDate: string) => `${number.slice(-4)}${expiryDate}`;

type CardCommission = {
  type: 'percentage';
  value: number;
  subtotal: number;
  commission: number;
  total: number;
};

type CommissionValues = {
  DEBIT: CardCommission;
  CREDIT: CardCommission;
  AMEX: CardCommission;
};

export interface KushkiCreditCardFormProps {
  onSubmit: (values: {
    cardInfo: CardFormSchema;
    binInfo: BinInfoResponse | null;
    cardBrandCode: CardTypeEnum;
    cardBrand: any;
  }) => void;
  commissionValues?: CommissionValues;
  show3DS?: boolean;
  onError?: (error: TRPCClientErrorLike<InferrableClientTypes> | ErrorResponse) => void;
  allowedCards?: string[];
  controlledLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export function useKushkiForm({
  controlledLoading,
  onLoadingChange,
}: {
  controlledLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
} = {}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [cardInfoByKushki, setCardInfoByKushki] = useState<BinInfoResponse | null>(null);
  const [showAlert, setShowAlert] = useState<'with_retries' | 'last_retry' | null>(null);
  const [checkedTerms, setCheckedTerms] = useState(false);
  const kushkiInstance = useKushki();
  const isLoading = controlledLoading ?? internalLoading;

  const setIsLoading = (value: boolean) => {
    if (controlledLoading !== undefined) {
      onLoadingChange?.(value);
    } else {
      setInternalLoading(value);
    }
  };

  const handleChangeCheckbox = (checked: boolean) => {
    setCheckedTerms(checked);
  };

  const handleCardInfo = (cardNumber: string, showError = false, onError?: (error: ErrorResponse) => void) => {
    if (!cardNumber || cardNumber.length < MIN_NUM_BIN) {
      setCardInfoByKushki(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    kushkiInstance?.requestBinInfo({ bin: cardNumber }, (response) => {
      setIsLoading(false);
      if (!('code' in response)) {
        setCardInfoByKushki((prev) => {
          // Only update if the response is different
          if (JSON.stringify(prev) === JSON.stringify(response)) {
            return prev;
          }
          return response;
        });
      } else {
        setCardInfoByKushki((prev) => prev);
        if (showError) {
          const binError: ErrorResponse = response;
          if (binInfoErrorCodes.includes(response.code)) {
            binError.code = `${response.code}_bin`;
          }
          handleRetryError(binError, undefined, false, onError as any);
        }
      }
    });
  };

  const handleRetryError = (
    error?: TRPCClientErrorLike<InferrableClientTypes> | ErrorResponse | null,
    cookieKey?: string,
    count = false,
    onError?: (error: TRPCClientErrorLike<InferrableClientTypes> | ErrorResponse) => void
  ) => {
    if (!cookieKey) return;

    const paymentRetries = Cookies.get('PAYMENT_RETRY');
    const previousCounterByKey = paymentRetries?.[cookieKey] || 0;
    const currentCounter = previousCounterByKey + (count ? 1 : 0);

    Cookies.set('PAYMENT_RETRY', { ...(paymentRetries || {}), [cookieKey]: currentCounter }, { expires: 1 });

    if (currentCounter < MAX_RETRIES_COUNTER) {
      setShowAlert('with_retries');
    } else {
      setShowAlert('last_retry');
    }

    // Call onError if provided and there's an error
    if (error && onError) {
      onError(error);
    }
  };

  const canRequestCheckout = (cookieKey?: string) => {
    if (!cookieKey) return true;
    const paymentRetries = Cookies.get('PAYMENT_RETRY');
    const counter = paymentRetries?.[cookieKey] || 0;
    return counter < MAX_RETRIES_COUNTER;
  };

  return {
    cardInfoByKushki,
    showAlert,
    checkedTerms,
    isLoading,
    setIsLoading,
    handleCardInfo,
    handleRetryError,
    canRequestCheckout,
    handleChangeCheckbox,
    setShowAlert,
  };
}

export function KushkiCreditCardForm({
  onSubmit,
  commissionValues,
  show3DS = false,
  onError,
  allowedCards = [],
  controlledLoading,
  onLoadingChange,
}: KushkiCreditCardFormProps) {
  const {
    cardInfoByKushki,
    showAlert,
    checkedTerms,
    isLoading,
    setIsLoading,
    handleCardInfo,
    handleRetryError,
    canRequestCheckout,
    handleChangeCheckbox,
    setShowAlert,
  } = useKushkiForm({ controlledLoading, onLoadingChange });

  const sendEvent = useSendEvent();

  const { watch } = useFormContext<CardFormSchema>();
  const cardNumber = watch('number');
  const debouncedCardNumber = useDebounce(cardNumber ?? '', 900);
  const router = useUTMRouter();

  const { guardianHash } = router.query;
  const validateCardAllowance = (cardType: string | undefined): string | undefined => {
    if (cardType && !allowedCards.includes(cardType)) {
      return `Por el momento no aceptamos ${cardData?.card?.niceType}. Por favor intenta con otra tarjeta.`;
    }
    return undefined;
  };

  useEffect(() => {
    if (debouncedCardNumber?.length >= MIN_NUM_BIN) {
      handleCardInfo(debouncedCardNumber);
    }
  }, [debouncedCardNumber]);

  const cardData = getCardBrand(cardNumber ?? '');

  const getCardBrandCode = (): CardTypeEnum => {
    const { AMEX, CREDIT, DEBIT } = CardTypeEnum;
    if (cardData?.card?.type === 'american-express') return AMEX;
    if (cardInfoByKushki?.cardType === 'debit') return DEBIT;
    return CREDIT;
  };

  const cardBrandCode = getCardBrandCode();
  const cookieCardKey = cardCookieKey(cardNumber ?? '', watch('expiryDate') ?? '');

  const handleSubmit = (formData: CardFormSchema) => {
    setIsLoading(true);

    if (!canRequestCheckout(cookieCardKey)) {
      handleRetryError(null, cookieCardKey, false, onError);
      setIsLoading(false);
      return;
    }

    const cardError = validateCardAllowance(cardData?.card?.type);
    if (cardError) {
      setIsLoading(false);
      if (onError) {
        onError({
          code: 'CARD_BRAND_NOT_ALLOWED',
        } as ErrorResponse);
      }
      return;
    }

    if (!cardInfoByKushki) {
      handleCardInfo(formData.number ?? '', true, onError);
      return;
    }

    onSubmit({
      cardInfo: formData,
      binInfo: cardInfoByKushki,
      cardBrandCode,
      cardBrand: capitalizeFirstLetter(cardInfoByKushki?.brand),
    });
  };

  const errorQuery = router.query.error as keyof typeof KushkiCardErrorOptions;

  useEffect(() => {
    if (errorQuery) {
      handleRetryError(null, cookieCardKey, false, onError);
    }
  }, [errorQuery]);

  const errorLabels = {
    title: getKushkiErrorTitle(errorQuery?.toString(), cardInfoByKushki),
    description: KushkiCardErrorOptions[errorQuery]?.optionMessage,
    showBanner: KushkiCardErrorOptions[errorQuery]?.showBanner,
  };

  return (
    <>
      <InformationDrawer
        intent="error"
        open={showAlert !== null}
        title={showAlert === 'with_retries' ? errorLabels.title : 'Transacción declinada'}
        description={
          <div>
            <span className="text-[#686F87]">
              {showAlert === 'with_retries'
                ? errorLabels.description
                : 'Por normas de seguridad no podrás realizar pagos en Cometa con esta tarjeta por las próximas 24 hs.'}
            </span>
            {!!errorLabels.showBanner && (
              <Banner
                intent={showAlert === 'with_retries' ? 'info' : 'warning'}
                className={cn('text-left font-normal flex items-center gap-3 mt-4', {
                  'bg-[#FFF7CD] text-[#7A4F01]': showAlert === 'last_retry',
                  'text-[#1890FF] bg-[#D0F2FF]': showAlert === 'with_retries',
                })}
              >
                {showAlert === 'with_retries' ? (
                  <InformationWhite className="w-6 h-6 text-[#1890FF]" />
                ) : (
                  <Warning className="w-6 h-6 text-[#FFC107]" />
                )}
                {showAlert === 'with_retries'
                  ? 'Utiliza otra tarjeta para poder realizar el pago de manera correcta.'
                  : 'Cambia de tarjeta o acércate al colegio para realizar el pago.'}
              </Banner>
            )}
          </div>
        }
        onClick={() => setShowAlert(null)}
        onClose={() => {
          sendEvent(TrackEvents.checkout.card.errorDismissed, { error_code: errorQuery });
          if (errorQuery?.toString() === 'payment_failed_timeout') {
            router.push(`/guardians/${guardianHash}`);
          } else {
            router.push({ query: { ...router.query, error: null } }, undefined);
          }
          setIsLoading(false);
          setShowAlert(null);
        }}
      />

      <CreditCardForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isLoadingSubtotal={!cardInfoByKushki || !cardData.card?.type}
        commissionValues={commissionValues}
        cardBrandCode={cardBrandCode}
        cardData={cardData}
        checkedTerms={checkedTerms}
        handleChangeCheckbox={handleChangeCheckbox}
        show3DS={show3DS}
      />
    </>
  );
}
