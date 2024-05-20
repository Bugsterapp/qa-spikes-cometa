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
import { getSchoolCredentials } from '~/components/molecules/common/AuthGlobal';
import { PreferenceTypeEnum } from '@cometa/trpc';
import { ServiceClient } from './api';
import { getSession } from 'next-auth/react';
import { decrypt } from '~/lib/base64';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';

export const ErrorFieldMap = {
  name: 'cardName',
  number: 'cardNumber',
  expiry_date: 'expiryDate',
  cvv: 'cvv',
};

export type KushkiType = Kushki;

export const useKushki = () => {
  const schoolKushkiCredentials = getSchoolCredentials();
  const kushkiInstance = new Kushki({
    merchantId: schoolKushkiCredentials?.public_merchant_id || '',
    inTestEnvironment: Boolean(process.env.NEXT_PUBLIC_KUSHKI_TEST === 'true'),
  });

  return kushkiInstance;
};

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

export const getCommissionValues = async (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  preference_type: PreferenceTypeEnum
) => {
  let selectedOrders = '';
  const cookiesOrders = context.req.cookies['COMMISSION_VALUES'];

  if (!cookiesOrders) {
    const query = context.query.orders;

    selectedOrders = decrypt(query as string);
  } else {
    selectedOrders = cookiesOrders;
  }

  const session = await getSession(context);
  const res = await ServiceClient.apiV1ValidatePreferencesCreate(
    {
      items: JSON.parse(selectedOrders),
      guardian: session?.user.id ?? '',
      preference_type,
    },
    {
      headers: {
        token: session?.token ?? '',
      },
    }
  );
  return res.data;
};
