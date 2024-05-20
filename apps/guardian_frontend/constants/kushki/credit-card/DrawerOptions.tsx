import card from 'card-validator';
import InformationWhite from '~/public/icons/information-white.svg';
import CreditCardError from '~/public/icons/credit-card-error.svg';

const DrawerOptions = {
  external: {
    title: 'Se produjo un error al procesar la operación.',
    icon: <InformationWhite className="text-white fill-current" />,
    optionMessage: 'Vuelve a intentar, intenta con otra tarjeta o cambia de método de pago',
    code: 'error',
  },
  '505': {
    icon: <CreditCardError />,
    title: 'Tu banco rechazó la transacción.',
    optionMessage: 'Usa otra tarjeta u otro medio de pago.',
    code: 'error',
  },
  'K-error': {
    icon: <CreditCardError />,
    title: 'Se produjo un error al procesar la operación.',
    optionMessage: 'Vuelve a intentar, intenta con otra tarjeta o cambia de método de pago',
    code: 'error',
  },
  '021': {
    icon: <CreditCardError />,
    title: 'No hay fondos suficientes para completar la operación.',
    optionMessage: 'Intenta con otra tarjeta u otro método de pago.',
    code: 'error',
  },
  '553': {
    icon: <CreditCardError />,
    title: 'La marca de la tarjeta ingresada no es compatible.',
    optionMessage: 'Intenta con otra tarjeta u otro método de pago.',
    code: 'error',
  },
  'K-default': {
    icon: <CreditCardError />,
    title: 'Ha ocurrido un error inesperado.',
    optionMessage: 'Vuelve a intentar o cambia de método de pago',
    code: 'error',
  },
  '006': {
    icon: <InformationWhite className="text-white fill-current" />,
    title: 'Transacción declinada.',
    optionMessage: 'Intenta con otra tarjeta u otro método de pago.',
    code: 'error',
  },
};

export default DrawerOptions;

export const validationRules = {
  cardName: {
    rule: card.cardholderName,
    message: 'Nombre inválido',
  },
  cardNumber: { rule: card.number, message: 'El número ingresado es incorrecto' },
  expiryDate: { rule: card.expirationDate, message: 'Fecha inválida' },
  cvv: { rule: card.cvv, message: 'N° de seguridad incorrecto' },
};
