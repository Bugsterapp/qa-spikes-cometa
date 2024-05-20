import { SxProps } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { InputAttributes, NumericFormat as NumberFormat, NumericFormatProps } from 'react-number-format';

import { TextFieldDashboard } from './index';
import { formatPrice } from '../../../../utils/general';

interface AmountFieldDashboardErrorValidation {
  error: boolean;
  setError: (error: boolean) => void;
  maxAmount: number;
  minAmount: number;
  helperText?: string;
}

interface AmountFieldDashboardProps {
  value: string;
  setValue: (value: string) => void;
  label: string;
  placeholder: string;
  errorValidation?: AmountFieldDashboardErrorValidation;
  required?: boolean;
  sx?: SxProps;
  currency?: string;
}

interface CustomProps {
  onChange: (event: { target: { value: string } }) => void;
}

export function AmountFieldDashboard(props: AmountFieldDashboardProps) {
  const { value, setValue, label, placeholder, errorValidation, required, sx, currency } = props;
  const [autoFocus, setAutoFocus] = useState<boolean>(false);
  const defaultHelperTextMajor = `El ${label.toLowerCase()} debe ser menor a ${formatPrice(
    errorValidation?.maxAmount || 0,
    currency || 'MXN'
  )}`;
  const defaultHelperTextMinor = `El ${label.toLowerCase()} debe ser mayor a ${formatPrice(
    errorValidation?.minAmount || 0,
    currency || 'MXN'
  )}`;
  const [helperText, setHelperText] = useState<string>(defaultHelperTextMajor);

  const NumberFormatCustom = React.forwardRef<NumericFormatProps<InputAttributes>, CustomProps>(
    function NumberFormatCustom(props, ref) {
      const { onChange, ...other } = props;

      return (
        <NumberFormat
          {...other}
          getInputRef={ref}
          onValueChange={(values) => {
            onChange({
              target: {
                value: values.value,
              },
            });
          }}
          thousandSeparator
          valueIsNumericString
          prefix="$ "
        />
      );
    }
  );

  useEffect(() => {
    if (value) {
      const inputAmount = parseFloat(value);
      const isMajor = !!errorValidation && inputAmount > errorValidation.maxAmount;
      const isMinor = !!errorValidation && inputAmount < errorValidation?.minAmount;
      errorValidation && errorValidation.setError(isMajor || isMinor);
      isMajor && setHelperText(defaultHelperTextMajor);
      isMinor && setHelperText(defaultHelperTextMinor);
    } else {
      errorValidation && errorValidation.setError(false);
    }
  }, [value]);

  return (
    <TextFieldDashboard
      sx={sx}
      value={value}
      setValue={setValue}
      errorValidation={{ ...errorValidation, ...{ helperText } } as AmountFieldDashboardErrorValidation}
      required={required}
      label={label}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onFocus={() => setAutoFocus(true)}
      onBlur={() => setAutoFocus(false)}
      InputProps={{
        inputComponent: NumberFormatCustom as any,
      }}
    />
  );
}
