// main tools
import PropTypes from 'prop-types';

// ui component
import { Stack, Typography } from '@mui/material';

const SuccessListItem = ({ title, price }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="body3" color="neutralDark.main" textAlign="left">
      {title}
    </Typography>
    <Typography variant="body3" color="neutralDark.main" textAlign="right">
      {price}
    </Typography>
  </Stack>
);

SuccessListItem.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
};

export default SuccessListItem;
