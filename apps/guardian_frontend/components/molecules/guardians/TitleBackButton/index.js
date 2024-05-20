import PropTypes from 'prop-types';
import { Grid, Typography } from '@mui/material';
import BackButton from '~/components/atoms/guardians/BackButton';

const TitleBackButton = ({ title, onClick }) => (
  <Grid container py={3} borderBottom="1px solid #E3E0FF">
    <Grid item mx={3}>
      <BackButton onClick={onClick} />
    </Grid>
    <Grid
      item
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography color="primary" variant="body1" lineHeight={2} fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  </Grid>
);

TitleBackButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default TitleBackButton;
