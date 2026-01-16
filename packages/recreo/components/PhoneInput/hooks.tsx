import { useEffect, useMemo, useState } from 'react';
import parse, {
  CountryCode,
  formatIncompletePhoneNumber,
  getCountryCallingCode,
  getExampleNumber,
  isPossiblePhoneNumber,
  parsePhoneNumber,
  PhoneNumber,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { emojiFlags } from './constants';
import { getCountryFlag, trimString } from './utils';

interface Options {
  initialValue: string;
  allowedCountryCodes: CountryCode[];
  onNumberChange(number: PhoneNumber): unknown;
  onRawValueChange?(rawValue: string): unknown;
}
export function useTelephone(options: Options) {
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

  useEffect(() => {
    if (options.onNumberChange && e164) {
      options.onNumberChange(e164);
    }
  }, [e164]);

  function onChange(value: string) {
    if (options.onRawValueChange) {
      options.onRawValueChange(value);
    }

    if (parse(value, country)?.isValid()) {
      setInputValue(value);
    } else {
      setInputValue(trimString(value, getExampleNumber(country, examples)?.formatNational().length || 0));
    }

    if (isPossiblePhoneNumber(value)) {
      setCountry(parsePhoneNumber(value).country ?? 'MX');
    }
  }

  function onChangeCountry(country: CountryCode) {
    if (!country) return;
    if (!options?.allowedCountryCodes?.includes(country)) {
      throw new Error('Country is not allowed!');
    }

    setCountry(country);
    setInputValue('');
  }

  return {
    country,
    parsed: e164,
    valid,
    value: formatIncompletePhoneNumber(input || '', country).replace(/\+\d+\s/, ''),
    flag: getCountryFlag(country),
    countryCallingCode: getCountryCallingCode(country),
    emoji: emojiFlags.find((flag) => flag.code === country)?.emoji || '🏳️',
    number: e164?.number ?? null,
    placeholder: getExampleNumber(country, examples)?.formatNational(),
    onChange,
    onChangeCountry,
  } as const;
}
