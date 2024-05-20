import { Box, Grid, Typography } from '@mui/material';

export type DrawerCode = 'success' | 'error' | 'warning';

type Props = {
  title: string;
  code: DrawerCode;
  optionMessage: string;
  children: React.ReactNode;
  information: string;
  icon: React.ReactNode;
};

const Drawer = ({ title, code, optionMessage, children, information, icon }: Props) => (
  <>
    <Box
      sx={{
        backgroundColor: 'rgba(0,0,0,.5)',
        top: 0,
        left: 0,
        position: 'fixed',
        zIndex: 9999,
        height: '100vh',
        width: '100vw',
      }}
      component="div"
    />
    <Box
      bottom={0}
      margin="0 auto"
      left={0}
      right={0}
      width="100%"
      maxWidth="sm"
      paddingTop={3}
      position="fixed"
      zIndex="100000"
      bgcolor={`${code}.dark`}
      sx={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      data-test-id="footer-payment-result"
    >
      <Grid spacing={2} container justifyContent="space-around" alignItems="center">
        <Grid item xs={12} display="flex" justifyContent="center">
          {icon}
        </Grid>
        <Grid item xs={7} display="flex" justifyContent="center">
          <Typography sx={{ color: 'white.main', fontWeight: 600, fontSize: '1.125rem', textAlign: 'center' }}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Box
            bgcolor="white.main"
            width="100%"
            p={3}
            sx={{
              borderTopLeftRadius: 48,
              borderTopRightRadius: 48,
            }}
          >
            <Grid
              spacing={2}
              container
              justifyContent="space-around"
              alignItems="center"
              direction="column"
              maxWidth="277px"
              margin="0 auto"
            >
              <Grid item xs={12} display="flex" justifyContent="center">
                <Typography sx={{ color: 'secondary', fontWeight: 500, fontSize: 14, textAlign: 'center' }}>
                  {information}
                </Typography>
              </Grid>
              <Grid item xs={10} display="flex" justifyContent="center" mb="1.25rem">
                <Typography sx={{ color: '#637381', fontWeight: 500, fontSize: 12, textAlign: 'center' }}>
                  {optionMessage}
                </Typography>
              </Grid>
              {children}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default Drawer;
