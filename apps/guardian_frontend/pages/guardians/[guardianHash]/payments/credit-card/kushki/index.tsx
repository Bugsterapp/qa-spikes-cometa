import { Container, Box, Typography, IconButton, Divider, Button, CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import { ErrorBoundary } from '@sentry/nextjs';
import Lock from '~/public/icons/lock.svg';
import Image from 'next/image';
import { useFormik } from 'formik';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import Drawer, { DrawerCode } from '~/components/organisms/guardians/Drawer';
import Cookies from 'lib/Cookies';
import axios from 'axios';
import { sendPageViewedEvent, sendTrackEvent } from '~/utils/events';
import SubtotalCard from '~/components/organisms/guardians/SubtotalCard';
import DrawerOptions, { validationRules } from '~/constants/kushki/credit-card/DrawerOptions';
import { getCardBrand } from '~/lib/getCardBrand';
import BoxError from '~/components/atoms/common/BoxError';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cardValues,
  creditCardIcon,
  ErrorFieldMap,
  getCommissionValues,
  kushkiFormIcons,
  useKushki,
} from '~/utils/kushkiCreditCard';
import NFormTextField from '~/components/TexField';
import { LockOutlined } from '@mui/icons-material';
import { Events } from '~/constants/events';
import type { GetServerSideProps } from 'next';
import * as Sentry from '@sentry/nextjs';
import { catchPaymentPage } from '~/utils/processCatch';
import { useSelectionStore } from '@cometa/hooks';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { api } from '~/utils/api';
import { CardTypeEnum, PreferenceTypeEnum } from '@cometa/trpc';
import { BinInfoResponse } from '@kushki/js/lib/types/bin_info_response';
import useDebounce from '~/hooks/useDebounce';
import { ErrorResponse } from '@kushki/js/lib/types/error_response';
import { StockErrorAlert } from '~/components/StockErrorAlert';
import { isStockError } from '~/utils/stocks';

type CardCommission = {
  type: 'percentage';
  value: number;
  subtotal: number;
  commission: number;
  total: number;
};

type PageProps = {
  commissionValues: {
    DEBIT: CardCommission;
    CREDIT: CardCommission;
    AMEX: CardCommission;
  };
};

const MIN_NUM_BIN = 6;

function KushkiCreditCard({ commissionValues }: Readonly<PageProps>) {
  const kushkiInstance = useKushki();
  const selectedSchool = useSelectedSchool();
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const { selectedItems, clear } = useSelectionStore();
  const itemsQuantity = selectedItems?.length;
  const schoolCardsAllowed = useMemo(() => selectedSchool?.preferences.credit.methods || [], [selectedSchool]);
  const [cardInfoByKushki, setCardInfoByKushki] = useState<BinInfoResponse | null>(null);
  const [stockError, setStockError] = useState(false);

  const catchErrorCardInfo = (error: ErrorResponse, showError = false) => {
    if (showError) {
      showDrawer(error);
      formik.setSubmitting(false);
    }
    if (error.message !== 'Bin no válido.') {
      sendTrackEvent('portal: Payment Failed', {
        code: error.code,
        message: error.message,
        method: 'requestBinInfo',
        type: 'Credit',
      });
      Sentry.setContext('requestBinInfo catch Error', {
        message: error.message,
        code: error.code,
      });
      Sentry.captureEvent({ message: `requestBinInfo catch ${JSON.stringify(error)}` });
    }
  };

  const getCardInfo = (bin: string) => {
    if (!bin || bin.length < MIN_NUM_BIN) return setCardInfoByKushki(null);
    kushkiInstance?.requestBinInfo({ bin }, (response) => {
      if (!('code' in response)) {
        setCardInfoByKushki(response);
      } else {
        setCardInfoByKushki(null);
        catchErrorCardInfo(response);
      }
    });
  };

  useEffect(() => {
    sendPageViewedEvent('Metodo de pago - Tarjeta - Kushki');
  }, []);

  useEffect(() => {
    if (!itemsQuantity) _router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity]);

  const formik = useFormik({
    initialStatus: {
      status: null,
    },
    initialValues: cardValues,
    validate: (values) => {
      const errors: Record<string, unknown> = {};
      Object.keys(values).forEach((key) => {
        const cardBrand = getCardBrand(values?.cardNumber ?? '');
        if (key === 'cvv') {
          if (
            values['cvv'] &&
            !validationRules.cvv.rule(String(values.cvv), cardBrand?.card?.type === 'american-express' ? 4 : 3).isValid
          ) {
            errors['cvv'] = validationRules['cvv'].message;
          }
        } else if (
          values[key as keyof typeof values] &&
          !validationRules[key as keyof typeof values].rule(String(values[key as keyof typeof values])).isValid
        ) {
          errors[key] = validationRules[key as keyof typeof values].message;
        }
      });
      return errors;
    },
    onSubmit: ({ cardName, cardNumber, expiryDate, cvv }) => {
      const [expiryMonth, expiryYear] = expiryDate.split('/');
      Cookies.set('FULLFILMENT_VALUES', commissionValues[cardBrandCode]);
      localStorage.removeItem(RATED_CSAT_PAYMENT);
      if (!cardInfoByKushki) {
        kushkiInstance?.requestBinInfo({ bin: cardNumber }, (response) => {
          if (!('code' in response)) {
            setCardInfoByKushki(response);
            requestKushkiToken({ cardName, cardNumber: cardNumber.replaceAll(' ', ''), expiryMonth, expiryYear, cvv });
          } else {
            setCardInfoByKushki(null);
            catchErrorCardInfo(response, true);
          }
        });
      } else requestKushkiToken({ cardName, cardNumber: cardNumber.replaceAll(' ', ''), expiryMonth, expiryYear, cvv });
    },
  });

  const searchNumCard = useDebounce(formik?.values?.cardNumber, 900);

  useEffect(() => {
    getCardInfo(searchNumCard);
  }, [searchNumCard]);

  const cardData = getCardBrand(formik?.values?.cardNumber ?? '');

  const getCardBrandCode = () => {
    const { AMEX, CREDIT, DEBIT } = CardTypeEnum;
    if (cardData?.card?.type === 'american-express') {
      return AMEX;
    } else if (cardInfoByKushki?.cardType === 'debit') {
      return DEBIT;
    } else {
      return CREDIT;
    }
  };

  const cardBrandCode = getCardBrandCode();

  const handleCardAllowance = useCallback(() => {
    if (cardData?.card?.type && !schoolCardsAllowed.includes(cardData?.card?.type)) {
      formik.errors.cardNumber = `Por el momento no aceptamos ${cardData?.card?.niceType}. Por favor intenta con otra tarjeta.`;
    }
  }, [cardData, formik.errors, schoolCardsAllowed]);

  const handleCardMask = () => {
    handleCardAllowance();
    if (cardData?.card?.type === 'american-express') {
      return '____ ______ _____';
    }
    return '____ ____ ____ ____';
  };

  const isLoading = !cardData?.card?.type;

  const hasCommissions = !!Object.keys(commissionValues).find(
    (key) => commissionValues[key as keyof typeof commissionValues].commission
  );
  const { mutate: mutateCheckoutCard } = api.kushki.checkoutCard.useMutation({
    onSuccess() {
      sendTrackEvent(Events.payment_success, { method: 'kushki', type: 'Card' });
      _router.push({ pathname: `/guardians/${guardianHash}/success`, query: { status: 'paid' } });
    },
    onError(error) {
      showDrawer(error);
      formik.setSubmitting(false);
    },
  });

  const requestKushkiToken = async ({
    cardName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
  }: {
    cardName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }) => {
    if (!formik.isValid) return;

    kushkiInstance?.requestToken(
      {
        amount: commissionValues[cardBrandCode].total,
        currency: 'MXN',
        card: {
          name: cardName,
          number: cardNumber,
          expiryMonth,
          expiryYear,
          cvc: cvv.toString(),
        },
      },
      (response) => {
        if (!('code' in response) && Boolean(itemsQuantity)) {
          const storedCheckoutOrders = selectedItems.map((fulfillment) => ({
            order: fulfillment.order_id,
            student: fulfillment.student.id,
          }));
          mutateCheckoutCard({
            items: storedCheckoutOrders,
            cardType: cardBrandCode,
            kushkiToken: response.token,
          });
        } else {
          formik.setStatus({ status: 'external' });
          formik.setSubmitting(false);
        }
      }
    );
  };

  const showDrawer = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const { code, field, message } = error.response?.data ?? {};
      sendTrackEvent('portal: Payment Failed', { code: code, message: message, method: 'KUSHKI', type: 'Credit' });
      if (field !== '-') {
        formik.setErrors({
          [ErrorFieldMap[field as keyof typeof ErrorFieldMap]]: message,
        });
      } else if (Object.keys(DrawerOptions).find((key) => key === code)) {
        formik.setStatus({ status: code });
      } else {
        formik.setStatus({ status: 'K-default' });
      }
    } else {
      formik.setStatus({ status: 'external' });
    }
  };

  const tryAgain = () => {
    sendTrackEvent(Events.payment_failed_retry, { method: 'Kushki', type: 'Card' });
    formik.setStatus({ status: null });
  };

  const changePaymentMethod = () => {
    sendTrackEvent(Events.payment_failed_change_method, { method: 'Kushki', type: 'Card' });
    _router.push(`/guardians/${guardianHash}/payments`);
  };

  return (
    <>
      <Head>
        <title>Tarjeta Crédito o Débito</title>
      </Head>
      {formik.status.status && (
        <Drawer
          code={DrawerOptions[formik.status.status as keyof typeof DrawerOptions].code as DrawerCode}
          title={DrawerOptions[formik.status.status as keyof typeof DrawerOptions].title}
          information="¿Qué puedo hacer?"
          optionMessage={DrawerOptions[formik.status.status as keyof typeof DrawerOptions].optionMessage}
          icon={DrawerOptions[formik.status.status as keyof typeof DrawerOptions].icon}
        >
          <Box display="flex" gap="0.625rem" flexDirection="column" width="100%">
            <Button
              variant="contained"
              fullWidth
              sx={{ py: '0.75rem', height: 44, borderRadius: 16 }}
              onClick={tryAgain}
            >
              Volver a intentar
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: '0.75rem', height: 44, borderRadius: 16 }}
              onClick={changePaymentMethod}
            >
              Cambiar método de pago
            </Button>
          </Box>
        </Drawer>
      )}

      <Container maxWidth="sm" disableGutters>
        <div className="flex ml-2">
          <IconButton
            onClick={() => _router.back()}
            disabled={formik.isSubmitting}
            sx={{
              backgroundColor: 'white.main',
              mr: 2,
              mt: 2,
              mb: 2,
            }}
          >
            <ChevronLeftIcon color="primary" />
          </IconButton>
          <div className="flex items-center justify-center m-2">
            <Typography variant="heading2" color="#091A7A">
              Tarjeta Crédito o Débito
            </Typography>
          </div>
        </div>
        <Divider sx={{ mb: 4 }} />
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap="1.5rem 2.3rem"
          justifyContent="center"
          px="1.6rem"
        >
          {!hasCommissions && (
            <p className="font-medium text-xs text-[#57537A] text-align-center col-span-full text-center">
              Por favor completa los datos que se le solicitan a continuación para poder realizar el pago.
            </p>
          )}

          <ErrorBoundary fallback={BoxError}>
            <NFormTextField
              name="cardNumber"
              type="text"
              label="Número de la tarjeta"
              className="col-span-full"
              error={formik.errors.cardNumber}
              LeftIcon={kushkiFormIcons.cardIcon}
              RightIcon={creditCardIcon[cardData?.card?.type as keyof typeof creditCardIcon]}
              maskConfig={{ mask: handleCardMask(), replacement: /\d/ }}
              onChange={({ target: { value } }) => {
                formik.setFieldValue('cardNumber', value);
              }}
              value={formik.values.cardNumber}
            />
          </ErrorBoundary>

          <NFormTextField
            className="col-span-full"
            label="Nombre en la tarjeta"
            name="cardName"
            onChange={formik.handleChange}
            value={formik.values.cardName}
            error={formik.errors.cardName}
            helperText={formik.touched.cardName ? formik.errors.cardName : undefined}
            LeftIcon={kushkiFormIcons.people}
          />

          <NFormTextField
            name="expiryDate"
            label="Fecha Exp"
            type="text"
            className="grid-col-[1/2]"
            onChange={formik.handleChange}
            value={formik.values.expiryDate}
            error={formik.errors.expiryDate}
            LeftIcon={kushkiFormIcons.calendar}
            maskConfig={{ mask: '__/__', replacement: /\d/ }}
          />

          <NFormTextField
            name="cvv"
            label="CVV"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.cvv}
            error={formik.errors.cvv}
            LeftIcon={kushkiFormIcons.lock}
            className="grid-col-[2/3]"
          />

          {hasCommissions && (
            <SubtotalCard
              className="col-span-full"
              subtotalValue={commissionValues[cardBrandCode].subtotal}
              commissionValue={isLoading ? 0 : commissionValues[cardBrandCode].commission}
              totalValue={commissionValues[cardBrandCode].total}
              isLoading={isLoading || !cardInfoByKushki}
            />
          )}
          <span className="flex md:justify-self-center content-center items-center col-[1/-1] gap-2 max-w-lg">
            <Lock className="w-[18px]" />
            <p className="text-[#57537A] text-xs font-normal text-left flex-1 md:flex-none m-0">
              Tus datos están seguros y encriptados con certificación PCI.
            </p>
          </span>
          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={
              !formik.isValid ||
              !formik.dirty ||
              formik.isSubmitting ||
              Object.values(formik.values).some((val) => val === '')
            }
            sx={{
              height: 56,
              borderRadius: 16,
              gridColumn: '1/-1',
            }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <LockOutlined className="w-[18px] mr-1.5" /> <Typography>Pagar</Typography>
              </>
            )}
          </Button>

          <Box gridColumn="1/-1" mt="0.625rem" px="0.5rem" display="flex" flexDirection="column" gap="1.5rem">
            <PoweredByKushki />
            <Divider orientation="horizontal" sx={{ width: '100%' }} />
            <span className="flex content-between col-span-[1/-1] items-center gap-6">
              <Image src="/images/pci-dss-compliant-logo.svg" alt="pci-dss-compliant-logo" height={50} width={130} />
              <Typography color="textCopy.main" variant="caption" fontWeight={400} lineHeight="1rem">
                Este pago es procesado de forma segura por Kushki, un proveedor de pagos PCI de nivel 1.
              </Typography>
            </span>
          </Box>
        </Box>
        <StockErrorAlert stockError={stockError} setStockError={setStockError} resetSelection={clear} />
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guardianHash } = context.query;
  try {
    const commissionValues = await getCommissionValues(context, PreferenceTypeEnum.CARD);

    return {
      props: {
        remoteAddress: context.req.socket.remoteAddress,
        commissionValues: commissionValues,
      },
    };
  } catch (err) {
    catchPaymentPage(err, context, 'GSSP Credit Card');
    isStockError(err, guardianHash);
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${guardianHash}`,
      },
    };
  }
};
KushkiCreditCard.auth = true;
export default KushkiCreditCard;
