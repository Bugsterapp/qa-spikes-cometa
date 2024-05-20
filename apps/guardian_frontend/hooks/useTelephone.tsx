import { useMemo, useState } from 'react';
import parse, {
  CountryCode,
  formatIncompletePhoneNumber,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isPossiblePhoneNumber,
  parsePhoneNumber,
  PhoneNumber,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

import flagsEmoji from '../public/countries/emoji-flags.json';
import * as React from 'react';
import Emoji from '~/components/Emoji';

export type { CountryCode };

export function getCountryFlag(code: CountryCode) {
  return `/countries/${code}.svg`;
}

const allCountryCodes = getCountries();

export const countries = allCountryCodes
  .map((country) => ({
    name: new Intl.DisplayNames(['es'], { type: 'region' }).of(country)!,
    value: country,
    countryCallingCode: getCountryCallingCode(country),
    emoji: flagsEmoji?.find((flag) => flag.code === country)?.emoji || '🏳️',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
// should filter by countries in allowedCountries
export const allowedCountries = (options: string[]) => countries.filter((country) => options.includes(country.value));

export interface Options {
  initialValue: string;
  allowedCountryCodes: CountryCode[];
  onNumberChange(number: PhoneNumber): unknown;
}
export function trimString(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}
export function useTelephone(_options?: Partial<Options>) {
  const options: Partial<Options> = {
    initialValue: 'MX',
    allowedCountryCodes: allCountryCodes,
    ..._options,
  };

  const [country, setCountry] = useState<CountryCode>('MX');

  const [input, setInputValue] = useState(options.initialValue);

  const { e164, valid } = useMemo(() => {
    const e164 = parse(input || '', {
      defaultCountry: country,
      extract: true,
    });

    if (e164?.country && options.allowedCountryCodes?.includes(e164.country) && e164.isPossible()) {
      setCountry((old) => {
        if (old === e164.country) {
          return old;
        }

        return e164.country ?? old;
      });
    }

    return {
      e164,
      valid: e164?.isValid() ?? false,
    };
  }, [input]);

  React.useEffect(() => {
    if (options.onNumberChange && e164) {
      options.onNumberChange(e164);
    }
  }, [e164]);

  return {
    country,
    parsed: e164,
    valid,
    value: formatIncompletePhoneNumber(input || '', country).replace(/\+\d+\s/, ''),
    flag: getCountryFlag(country),
    countryCallingCode: getCountryCallingCode(country),
    emoji: flagsEmoji.find((flag) => flag.code === country)?.emoji || '🏳️',
    number: e164?.number ?? null,
    placeholder: getExampleNumber(country, examples)?.formatNational(),

    onChange(value: string) {
      if (parse(value, country)?.isValid()) {
        setInputValue(value);
      } else {
        setInputValue(trimString(value, getExampleNumber(country, examples)?.formatNational().length || 0));
      }

      if (isPossiblePhoneNumber(value)) {
        setCountry(parsePhoneNumber(value).country ?? 'MX');
      }
    },

    onChangeCountry(country: CountryCode) {
      if (!country) return;
      if (!options?.allowedCountryCodes?.includes(country)) {
        throw new Error('Country is not allowed!');
      }

      setCountry(country);
      setInputValue('');
    },
  } as const;
}

export const FlagEmoji = ({ flag, emoji }: { flag: CountryCode; emoji: string }) => {
  const isIOS = /iPad|iPhone|iPod/.test(window?.navigator.userAgent);
  const isMacOS = /Mac OS X/.test(window?.navigator.userAgent);
  if (isIOS || isMacOS) {
    return <Emoji symbol={emoji} label={`país ${flag}`} className="text-2xl" />;
  }
  return (
    <img src={`${getCountryFlag(flag)}`} alt="Flag of the current selected country" className="w-[26px] h-[26px]" />
  );
};

export default useTelephone;
