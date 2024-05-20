import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Box, InputAdornment, SxProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
interface SearchAutocompleteProps {
  autocompleteKey?: any;
  data: any[];
  optionLabel: (option: any) => string;
  renderOption: (props: any, option: any) => any;
  onChangeTextField: (event: any) => void;
  onChangeAutocomplete: (event: any, value: any, reason: string) => void;
  onClickAutocomplete: (event: any) => void;
  labelTextField: string;
  placeholderTextField: string;
  inputText: string;
  sx?: SxProps;
  icon?: any;
  width?: string;
  loading?: boolean;
}

export default function SearchAutocomplete(props: SearchAutocompleteProps) {
  const {
    autocompleteKey,
    data,
    renderOption,
    onChangeTextField,
    onChangeAutocomplete,
    onClickAutocomplete,
    labelTextField,
    placeholderTextField,
    optionLabel,
    inputText,
    width,
    loading,
  } = props;
  return (
    <Box
      sx={{
        width: width || '14rem',
      }}
    >
      <Autocomplete
        {...(autocompleteKey ? { key: autocompleteKey } : {})}
        options={data}
        getOptionLabel={optionLabel}
        disablePortal
        forcePopupIcon={false}
        renderOption={renderOption}
        noOptionsText="No se han encontrado coincidencias"
        loading={loading}
        renderInput={(params) => {
          const inputProps = inputText ? { ...params.inputProps, value: inputText } : { ...params.inputProps };
          return (
            <TextField
              {...params}
              sx={{
                height: '18px',
                outline: 'none',
                border: 'none',
                '&:focus': { outline: 'none', border: 'none' },
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  outline: 'none',
                },
                '& .MuiInputBase-input:focus': {
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                },
              }}
              onClick={onClickAutocomplete}
              onChange={onChangeTextField}
              inputProps={inputProps}
              label={labelTextField}
              placeholder={placeholderTextField}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">{props.icon ? props.icon : <SearchIcon />}</InputAdornment>
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          );
        }}
        onChange={onChangeAutocomplete}
      />
    </Box>
  );
}
