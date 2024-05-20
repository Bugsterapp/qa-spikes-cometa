import { Autocomplete, AutocompleteRenderOptionState, InputAdornment, TextField } from '@mui/material';
import { HTMLAttributes, ReactNode } from 'react';
import IcSearch from '/public/assets/icons/ic_search.svg';

interface CometaSingleSelectProps {
  placeholder: string;
  setSelected: (arg0: string | null) => void;
  getOptionDisabled?: (option: any) => boolean;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: any, state: AutocompleteRenderOptionState) => ReactNode;
  currentValue: any;
  data: any[];
  disabled?: boolean;
}

const CometaSingleSelect = ({
  data,
  setSelected,
  renderOption,
  getOptionDisabled,
  placeholder,
  currentValue,
  disabled = false,
}: CometaSingleSelectProps) => (
  <Autocomplete
    disabledItemsFocusable
    freeSolo
    componentsProps={{ paper: { sx: { py: 1 } } }}
    options={data}
    value={currentValue}
    onChange={(event: any, newValue: any) => {
      setSelected(newValue);
    }}
    getOptionLabel={(option: any) => option.name}
    getOptionDisabled={getOptionDisabled}
    sx={({ palette }) => ({
      '& fieldset': currentValue && {
        borderColor: `${palette.secondary.main} !important`,
      },
    })}
    disabled={disabled}
    renderOption={renderOption}
    renderInput={(params) => (
      <TextField
        color="secondary"
        {...params}
        placeholder={placeholder}
        autoComplete="off"
        InputProps={{
          ...params.InputProps,
          startAdornment: <InputAdornment position="start">{!currentValue && <IcSearch />}</InputAdornment>,
        }}
      />
    )}
  />
);

export default CometaSingleSelect;
