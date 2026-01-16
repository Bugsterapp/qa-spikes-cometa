import type { CountryCode, PhoneNumber } from 'libphonenumber-js';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

import { Emoji, Input, Select as RecreoSelect, TextField } from '../ui';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from './Select';
import { emojiFlags } from './constants';
import { useTelephone } from './hooks';
import { getCountryFlag } from './utils';
import { cn } from '@cometa/utils';

type PhoneInputProps = {
  onChange: (phone: PhoneNumber) => void;
  onRawValueChange?: (rawValue: string) => void;
  ignoreValidation?: boolean;
  initialValue?: string;
  label?: string;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  isLegacy?: boolean;
  className?: string;
};

export function PhoneInput({
  onChange,
  onRawValueChange,
  ignoreValidation = false,
  initialValue,
  label = 'Teléfono',
  onBlur,
  error,
  disabled = false,
  isLegacy = true,
  className,
}: PhoneInputProps) {
  const telephone = useTelephone({
    initialValue: initialValue ?? '',
    allowedCountryCodes,
    onNumberChange: (phone) => {
      if (ignoreValidation || phone?.isValid()) {
        onChange(phone);
      }
    },
    onRawValueChange,
  });

  return (
    <div className={cn('flex', className)}>
      <Select
        value={telephone.country}
        onValueChange={disabled ? undefined : (e) => telephone.onChangeCountry(e as CountryCode)}
      >
        <SelectTrigger
          className={cn(
            'bg-[#f3f5f9] h-[67px] group-data-[error=true]:border-[#FF4842] group-data-[error=true]:border group-data-[error=true]:border-r-0 p-4',
            disabled &&
              '!bg-neutral-50 !text-neutral-400 !cursor-not-allowed !opacity-100 !pointer-events-none hover:!bg-neutral-50 hover:!text-neutral-400 hover:!border-neutral-200 focus:!bg-neutral-50 focus:!text-neutral-400 focus:!border-neutral-200 active:!bg-neutral-50 active:!text-neutral-400 active:!border-neutral-200 data-[state=open]:!bg-neutral-50 data-[state=open]:!text-neutral-400 data-[state=open]:!border-neutral-200'
          )}
          data-error={Boolean(error)}
          disabled={disabled}
        >
          <SelectValue>
            <div className="relative flex items-center justify-between gap-1">
              <div className="flex flex-row items-center w-20 h-auto gap-2">
                <div className={cn(disabled && 'opacity-50')}>
                  <FlagEmoji flag={telephone.country} emoji={telephone.emoji} />
                </div>
                <span className={cn(disabled && '!text-neutral-400')}>+{telephone.countryCallingCode}</span>
              </div>
              <RecreoSelect.ChevronIcon
                className={cn(
                  "w-4 h-3 text-[#637381] group-[:has(button[data-state='open'])]:rotate-180 transition-transform",
                  disabled && '!text-neutral-400'
                )}
              />
            </div>
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="max-w-xs">
          {getAllowedCountries(['US', 'MX']).map((country) => (
            <SelectItem
              key={country.value}
              value={country.value}
              className="flex hover:cursor-pointer"
              textValue={country.name}
            >
              <div className="flex items-center gap-2">
                <FlagEmoji flag={country.value} emoji={country.emoji} /> {country.name} (+
                {country.countryCallingCode})
              </div>
            </SelectItem>
          ))}
          <SelectSeparator />
          {withoutPreferredCountries.map((country) => (
            <SelectItem
              key={country.value}
              value={country.value}
              className="flex hover:cursor-pointer"
              textValue={country.name}
            >
              <div className="flex items-center gap-2">
                <FlagEmoji flag={country.value} emoji={country.emoji} /> {country.name} (+
                {country.countryCallingCode})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TextField
        error={error}
        label={label}
        className={cn('flex-1 rounded-l-none', disabled && 'bg-neutral-50 opacity-100')}
        value={telephone.number}
        errorClassNames={isLegacy ? '-left-1/3' : '-left-28'}
        disabled={disabled}
      >
        <Input
          type="tel"
          data-testid="phone-input"
          placeholder={telephone.placeholder}
          value={telephone.value}
          onChange={(e) => telephone.onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
        />
      </TextField>
    </div>
  );
}

const allowedCountryCodes = getCountries();

const countries = allowedCountryCodes
  .map((country) => ({
    name: new Intl.DisplayNames(['es'], { type: 'region' }).of(country)!,
    value: country,
    countryCallingCode: getCountryCallingCode(country),
    emoji: emojiFlags?.find((flag) => flag.code === country)?.emoji || '🏳️',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const withoutPreferredCountries = countries.filter((country) => country.value !== 'MX' && country.value !== 'US');

function getAllowedCountries(options: string[]) {
  return countries.filter((country) => options.includes(country.value));
}

function FlagEmoji({ flag, emoji }: { flag: CountryCode; emoji: string }) {
  const isIOS = /iPad|iPhone|iPod/.test(window?.navigator.userAgent);
  const isMacOS = /Mac OS X/.test(window?.navigator.userAgent);

  if (isIOS || isMacOS) {
    return <Emoji symbol={emoji} label={`país ${flag}`} className="text-2xl" />;
  }

  return <img src={getCountryFlag(flag)} alt="Flag of the current selected country" className="w-[26px] h-[26px]" />;
}
