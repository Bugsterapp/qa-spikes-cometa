import { InputProps, SxProps, TextField } from '@mui/material';
import React, { useState } from 'react';

interface TextFieldDashboardErrorValidation {
  error: boolean;
  setError: (error: boolean) => void;
  helperText?: string;
}

interface TextFieldDashboardProps {
  value: string;
  setValue: (value: string) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  errorValidation?: TextFieldDashboardErrorValidation;
  sx?: SxProps;
  multiline?: boolean;
  InputProps?: InputProps;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function TextFieldDashboard(props: TextFieldDashboardProps) {
  const {
    value,
    setValue,
    label,
    placeholder,
    errorValidation,
    required,
    sx,
    multiline,
    InputProps,
    autoFocus,
    onFocus,
    onBlur,
  } = props;
  const defaultHelperText = 'Debe llenar este campo';
  const [helperText, setHelperText] = useState<string>(errorValidation?.helperText || defaultHelperText);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = event?.target?.value;
    if (required) {
      setHelperText(inputText ? errorValidation?.helperText || defaultHelperText : defaultHelperText);
    }
    inputText && errorValidation && errorValidation.setError(false);
    setValue(inputText);
  };

  return (
    <TextField
      sx={sx}
      error={!!errorValidation?.error}
      helperText={!!errorValidation?.error && helperText}
      label={label}
      placeholder={placeholder}
      value={value}
      multiline={!!multiline}
      onChange={handleChange}
      InputProps={InputProps}
      autoFocus={!!autoFocus}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
