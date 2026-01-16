import card from 'card-validator';
import type { BinInfoResponse } from '@kushki/js/lib/types/bin_info_response';

type Error = {
  title: string;
  alternativeTitle?: string;
  optionMessage: string;
  code: string;
  showBanner?: boolean;
};

const defaultError: Error = {
  title: 'Se produjo un error al procesar la operación',
  optionMessage: 'Intenta nuevamente más tarde o con otra tarjeta.',
  code: 'error',
  showBanner: true,
};

const baseISOErrorCodes = [
  'ISO04',
  'ISO07',
  'ISO10',
  'ISO11',
  'ISO13',
  'ISO15',
  'ISO19',
  'ISO21',
  'ISO25',
  'ISO28',
  'ISO39',
  'ISO41',
  'ISO43',
  'ISO46',
  'ISO52',
  'ISO53',
  'ISO55',
  'ISO58',
  'ISO59',
  'ISO63',
  'ISO64',
  'ISO70',
  'ISO74',
  'ISO75',
  'ISO76',
  'ISO78',
  'ISO79',
  'ISO80',
  'ISO81',
  'ISO91',
  'ISO92',
  'ISO93',
  'ISO94',
  'ISO96',
  'ISO1A',
  'ISO6P',
  'ISOB1',
  'ISON0',
  'ISON3',
  'ISON4',
  'ISON7',
  'ISON8',
  'ISOP5',
  'ISOP6',
  'ISOQ1',
  'ISOR0',
  'ISOR1',
  'ISOR2',
  'ISOR3',
  'ISOZ3',
];
const ISOErrorCodes: { [key: string]: Error } = {
  ISO01: {
    title: 'El banco rechazó tu solicitud',
    optionMessage: 'Contáctate con tu banco para obtener más información.',
    code: 'error',
  },
  ISO02: {
    title: 'El banco rechazó tu solicitud',
    optionMessage: 'Contáctate con tu banco para obtener más información.',
    code: 'error',
  },
  ISO03: {
    title: 'No aceptamos tarjetas emitidas por esa institución',
    optionMessage: 'Intenta con otra tarjeta',
    code: 'error',
  },
  ISO05: {
    title: 'Transacción declinada por motivos de seguridad o porque tienes tu tarjeta apagada',
    optionMessage:
      'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador. Revisa que tu tarjeta esté prendida.',
    code: 'error',
  },
  ISO06: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador.',
    code: 'error',
  },
  ISO12: {
    title: 'Tu banco rechazó tu solicitud de pago',
    optionMessage: 'Utiliza otra tarjeta o contáctate con tu banco para obtener más información.',
    code: 'error',
  },
  ISO14: {
    title: 'Los datos ingresados de la tarjeta son incorrectos',
    optionMessage: 'Porfavor complete los datos del formulario de pago nuevamente e inténtelo de nuevo.',
    code: 'error',
  },
  ISO51: {
    title: 'Superaste el límite de crédito de tu tarjeta',
    alternativeTitle: 'Fondos insuficientes',
    optionMessage: 'Intenta con otra tarjeta.',
    code: 'error',
  },
  ISO54: {
    title: 'Tarjeta expirada',
    optionMessage: 'Intenta con otra tarjeta.',
    code: 'error',
  },
  ISO57: {
    title: 'La operación que intentas realizar no está permitida para este tipo de tarjeta',
    optionMessage: 'Por favor intenta con otra tarjeta.',
    code: 'error',
  },
  ISO61: {
    title: 'El monto ingresado excede el límite permitido para tu tarjeta',
    alternativeTitle: 'El monto solicitado excede el límite de retiros permitidos para tu cuenta',
    optionMessage: 'Intenta con un monto menor o contacta a tu banco.',
    code: 'error',
  },
  ISO62: {
    title: 'Tarjeta restringida',
    optionMessage:
      'Por motivos de seguridad, no se pudo completar el pago debido al país emisor de la tarjeta o al país de donde estés realizando el pago.',
    code: 'error',
  },
  ISO65: {
    title: 'El monto ingresado excede el límite permitido para tu tarjeta',
    optionMessage: 'Intenta con un monto menor, con otra tarjeta, o contacta a tu banco.',
    code: 'error',
  },
  ISO82: {
    title: 'Transacción declinada por CVV erróneo',
    optionMessage: 'Por favor revisa los datos ingresados o intenta con otra tarjeta.',
    code: 'error',
  },
  ISO85: {
    title: 'Transacción declinada por CVV erróneo',
    optionMessage: 'Por favor revisa los datos ingresados o intenta con otra tarjeta.',
    code: 'error',
  },
  ISO86: {
    title: 'Transacción declinada por CVV erróneo',
    optionMessage: 'Por favor revisa los datos ingresados o intenta con otra tarjeta.',
    code: 'error',
  },
  ISO505: {
    title: 'La transacción fue declinada por tu banco o por el procesador',
    optionMessage: 'Intenta nuevamente en unos minutos y si el problema persiste utiliza otra tarjeta.',
    code: 'error',
  },
  ISOQ2: {
    title: 'La transacción no está permitida para esta tarjeta',
    optionMessage:
      'Por favor verifica si tu tarjeta permite este tipo de operación, contacta a tu banco o intenta con otra tarjeta.',
    code: 'error',
  },
  ISOP1: {
    title: 'Has alcanzado el límite diario de transacciones o monto permitido para esta tarjeta',
    optionMessage: 'Por favor intenta nuevamente mañana o usa otra tarjeta.',
    code: 'error',
  },
  ...baseISOErrorCodes.reduce((current: { [key: string]: Error }, code) => {
    current[code] = defaultError;
    return current;
  }, {}),
};

const baseKushkiErrorCodes = [
  'K201',
  '228',
  '621',
  '622',
  '703',
  'K001',
  'K002',
  'K003',
  'K005',
  'K007',
  'K008',
  'K009',
  'K011',
  'K012',
  'K013',
  'K015',
  'K020',
  'K023',
  'K025',
  'K026',
  'K028',
  'K029',
  'K030',
  'K038',
  'K039',
  'K041',
  'K042',
  'K047',
  'K048',
  'K049',
];

/** Error codes for the requestBinInfo request from Kushki. It has a sufix
 * to differentiate them from the error codes received from backend requests.
 */
const kushkiBinErrorCodes: { [key: string]: Error } = {
  K001_bin: {
    title: 'Datos ingresados de tu tarjeta son incorrectos',
    optionMessage: 'Revisa los datos de tu tarjeta ingresados.',
    code: 'error',
  },
  K029_bin: {
    title: 'Datos ingresados de tu tarjeta son incorrectos',
    optionMessage: 'Revisa los datos de tu tarjeta ingresados.',
    code: 'error',
  },
};

/** Object that map error codes to message objects (type Error). It groups error codes from
 * different sources:
 * - errors from the requestBinInfo request. This request is made on the client side.
 * - errors from the tokenize request. This request is made on the client side.
 * - errors from the create payment request. This request is made via backend. This error
 * codes are categorized as common, ISO and k322 error codes.
 */
const KushkiCardErrorOptions: { [key: string]: Error } = {
  external: {
    title: 'Se produjo un error al procesar la operación',
    optionMessage: '',
    code: 'error',
  },
  T016: {
    title: 'Se produjo un error al procesar la operación',
    optionMessage: 'Vuelve a intentar y si persiste contacta a soporte.',
    code: 'error',
  },
  '228': {
    title: 'No fue posible establecer comunicación con el procesador',
    optionMessage: 'Por favor inténtelo de nuevo mas tarde.',
    code: 'error',
  },
  '505': {
    title: 'Se produjo un error al procesar la operación',
    optionMessage: 'Vuelve a intentar y si persiste contacta a soporte.',
    code: 'error',
  },
  '551': {
    title: 'No hay fondos suficientes para completar la operación',
    optionMessage: 'Intenta con otra tarjeta u otro método de pago.',
    code: 'error',
  },
  '553': {
    title: 'La marca de la tarjeta ingresada no es compatible',
    optionMessage: 'Intenta con otra tarjeta u otro método de pago.',
    code: 'error',
  },
  '577': {
    title: 'Los datos ingresados son incorrectos',
    optionMessage: 'Por favor complete los datos del formulario de pago nuevamente e inténtelo de nuevo.',
    code: 'error',
  },
  K17: {
    title: 'Tarjeta no válida',
    optionMessage: 'Intentar con otra tarjeta.',
    code: 'error',
  },
  K004: {
    title: 'Tarjeta no soportada',
    optionMessage:
      'Las tarjetas Amex o Discover no están permitidas para realizar pagos por reglas del procesador. Intente con otra tarjeta.',
    code: 'error',
  },
  K006: {
    title: 'Tu banco o emisor tuvo un error al procesar el pago',
    optionMessage:
      'Por favor verifica si tu tarjeta permite este tipo de operación, contacta a tu banco o intenta con otra tarjeta.',
    code: 'error',
  },
  K016: {
    title: 'Se produjo un error al procesar la operación',
    optionMessage: 'Vuelve a intentar y si persiste contacta a soporte.',
    code: 'error',
  },
  K021: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage:
      'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador. Intenta pagar en otro dispositivo y con otro método de pago.',
    code: 'error',
  },
  K027: {
    title: 'La operación cayó en timeout, por favor inténtelo de nuevo',
    optionMessage: 'Intenta nuevamente la transacción.',
    code: 'error',
  },
  K040: {
    title: 'Se produjo un error al completar el pago',
    optionMessage:
      'Cierra sesión en Cometa y vuelve a iniciarla. Si el problema persiste por favor contacta a soporte.',
    code: 'error',
  },
  K220: {
    title: 'Se produjo un error al completar el pago',
    optionMessage: 'Vuelve a seleccionar tu orden e inténtalo nuevamente.',
    code: 'error',
  },
  K505: {
    title: 'Se produjo un error al procesar la operación',
    optionMessage: 'Vuelve a intentar y si persiste contacta a soporte.',
    code: 'error',
  },
  K322: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador.',
    code: 'error',
  },
  K322_L_BLK_CHN: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Intenta nuevamente con otra conexión a internet diferente.',
    code: 'error',
  },
  K322_L_BLK_IP: {
    title:
      'Transacción declinada por motivos de seguridad ya que la red de internet a la que estás conectado no permite hacer el pago',
    optionMessage: 'Intenta nuevamente con otra conexión a internet diferente',
    code: 'error',
  },
  K322_L_BLK_KSKID: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador.',
    code: 'error',
  },
  K322_L_BLK_MAIL: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por favor inténtalo con otra cuenta de Cometa.',
    code: 'error',
  },
  'K322_LISTA NEGRA TARJETA': {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Intenta con otra tarjeta.',
    code: 'error',
  },
  K322_R_DEC_COU: {
    title: 'Tu tarjeta emitida por otro país no está soportada',
    optionMessage: 'Intenta con otra tarjeta',
    code: 'error',
  },
  K322_R_DEC_CTRL_DECL: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador.',
    code: 'error',
  },
  K322_R_DEC_KSKID_COUN_DAY: {
    title: 'Has alcanzado el límite diario de transacciones o intentos de pago',
    optionMessage: 'Por favor intenta nuevamente mañana.',
    code: 'error',
  },
  K322_R_DEC_KSKID_COUN_MTH: {
    title: 'Has alcanzado el límite diario de transacciones o intentos de pago',
    optionMessage: 'Contáctate con tu banco para obtener más información.',
    code: 'error',
  },
  K322_L_BLK_BIN: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Tu tarjeta emitida por este banco no está soportada, intenta con otra tarjeta.',
    code: 'error',
  },
  last_retry: {
    title: 'Transacción declinada por motivos de seguridad',
    optionMessage: 'Por motivos de seguridad la transacción fue bloqueada por reglas del procesador.',
    code: 'error',
    showBanner: true,
  },
  'K-default': {
    title: 'Por normas de seguridad de tu banco emisor no se pudo completar la transacción',
    optionMessage: 'Utiliza otra tarjeta para poder realizar el pago de manera correcta.',
    code: 'error',
  },
  CARD_BRAND_NOT_ALLOWED: {
    title: 'El colegio no acepta tarjetas de esa red',
    optionMessage:
      'Intenta con otra tarjeta que no sea de esa red. La red no aceptada podría ser Mastercard, Visa, Diners, o American Express.',
    code: 'error',
  },
  ...baseKushkiErrorCodes.reduce((current: { [key: string]: Error }, code) => {
    current[code] = defaultError;
    return current;
  }, {}),
  ...ISOErrorCodes,
  ...kushkiBinErrorCodes,
  payment_failed: defaultError,
};

export const binInfoErrorCodes = ['K001', 'K029'];

/** List of error codes that need to use different title depending if the card used is credit or debit */
const creditOrDebitErrorCodes = ['ISO51', 'ISO61'];
export const getKushkiErrorTitle = (status: string, cardInfoByKushki: BinInfoResponse | null) => {
  const error = KushkiCardErrorOptions[status];
  if (creditOrDebitErrorCodes.includes(status) && 'optionMessage' in error && cardInfoByKushki) {
    return cardInfoByKushki?.cardType === 'debit' ? error?.alternativeTitle : error?.title;
  }
  if (error) {
    return error.title;
  }
  return defaultError.title;
};

export default KushkiCardErrorOptions;

export const validationRules = {
  cardName: {
    rule: card.cardholderName,
    message: 'Nombre inválido',
  },
  cardNumber: { rule: card.number, message: 'El número ingresado es incorrecto' },
  expiryDate: { rule: card.expirationDate, message: 'Fecha inválida' },
  cvv: { rule: card.cvv, message: 'N° de seguridad incorrecto' },
};
