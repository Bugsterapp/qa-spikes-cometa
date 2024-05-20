import { TextField, TextFieldProps, Box } from '@mui/material';
import s from './input.module.scss';
import AlertSmall from '~/public/icons/alert-small.svg';

const FormTextField = ({ className, ...props }: TextFieldProps) => {
  const { helperText, ...rest } = props;

  return (
    <TextField
      className={`${s['base-root']} ${className ?? ''}`}
      helperText={
        <Box display="flex" flexWrap="nowrap" gap="0.37rem" alignItems="center">
          {rest.error ? (
            <span>
              <AlertSmall />
            </span>
          ) : (
            ''
          )}
          {helperText}
        </Box>
      }
      {...rest}
    />
  );
};

export default FormTextField;
