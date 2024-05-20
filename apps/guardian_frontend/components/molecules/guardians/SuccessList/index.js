// main tools
import PropTypes from 'prop-types';

// ui components
import { List, Stack, Typography } from '@mui/material';
import SuccessListItem from '~/components/atoms/guardians/SuccessListItem';

export const SuccessList = ({ total, items = [] }) => (
  <List sx={{ width: '300px', maxHeight: '200px', overflow: 'auto' }} subheader={<Stack />}>
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="neutralDark.main" textAlign="left">
          Total pagado
        </Typography>
        <Typography variant="body2" color="neutralDark.main" textAlign="right">
          {total}
        </Typography>
      </Stack>
      {items.map((item, index) => (
        <SuccessListItem title={item.title} price={item.price} key={index} />
      ))}
    </Stack>
  </List>
);

SuccessList.propTypes = {
  total: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
};
