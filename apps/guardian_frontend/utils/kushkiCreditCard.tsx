import { Kushki } from '@kushki/js';
import Visa from '../public/icons/visa.svg';
import MasterCard from '../public/icons/mastercard.svg';
import Amex from '../public/icons/amex.svg';
import Maestro from '../public/icons/maestro.svg';
import PeopleIcon from '../public/icons/person.svg';
import CalendarIcon from '../public/icons/calendar.svg';
import LockIcon from '../public/icons/lock-icon.svg';
import CreditCardIcon from '../public/icons/creditcardicon.svg';
import Dinners from '../public/icons/dinnersclub.svg';
import Discover from '../public/icons/discover.svg';

export const ErrorFieldMap = {
  name: 'cardName',
  number: 'cardNumber',
  expiry_date: 'expiryDate',
  cvv: 'cvv',
};

export type KushkiType = Kushki;

export const kushki = new Kushki({
  merchantId: process.env.NEXT_PUBLIC_KUSHKI_MERCHANT_ID || '', // Your public merchant id
  inTestEnvironment: Boolean(process.env.NEXT_PUBLIC_KUSHKI_TEST === 'true'),
});

export const cardValues = {
  cardName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

export const creditCardIcon = {
  visa: Visa,
  mastercard: MasterCard,
  'american-express': Amex,
  maestro: Maestro,
  'diners-club': Dinners,
  discover: Discover,
};

export const kushkiFormIcons = {
  people: PeopleIcon,
  calendar: CalendarIcon,
  lock: LockIcon,
  cardIcon: CreditCardIcon,
};
