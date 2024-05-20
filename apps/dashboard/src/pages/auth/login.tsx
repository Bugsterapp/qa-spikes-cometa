import { styled } from '@mui/material/styles';
import { Box, Card, Stack, Container, Typography } from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
import Logo from '../../components/Logo';
import { LoginForm } from '../../sections/auth/login';
import * as Sentry from '@sentry/nextjs';
import Grid from '/src/components/atoms/Grid';
import { useEffect } from 'react';
import { useRemoveAllFromQueue } from '/src/components/BackgroundDownload/BackgroundDownload';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../server/auth';
import { PATH_PORTAL } from '/src/routes/paths';
import { sendPageViewedEvent } from '/src/utils/events';
import Image from 'next/image';
import LoginImage from '/public/assets/illustrations/illustration_login.png';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

function LoginPage() {
  const removeAllFromQueue = useRemoveAllFromQueue();
  sendPageViewedEvent('Login');

  const mdUp = useResponsive('up', 'md');
  useEffect(() => {
    removeAllFromQueue();
  }, [removeAllFromQueue]);
  return (
    <Grid columns={['grid-cols-[auto_1fr]']}>
      <HeaderStyle>
        <Logo />
      </HeaderStyle>

      {mdUp && (
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Hola, que bueno verte de nuevo
          </Typography>
          <Image layout="intrinsic" src={LoginImage} alt="login" />
        </SectionStyle>
      )}

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Inicia sesión en Cometa
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Ingresa tus datos aquí abajo</Typography>
            </Box>
          </Stack>
          <LoginForm />
        </ContentStyle>
      </Container>
    </Grid>
  );
}

const getLayout = (page: JSX.Element) => (
  <>
    <Head>
      <title>Login | Cometa</title>
    </Head>
    {page}
  </>
);

LoginPage.auth = false;

LoginPage.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: PATH_PORTAL.root,
        permanent: false,
      },
    };
  }

  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  try {
    if (isMobile) {
      return {
        redirect: {
          permanent: false,
          destination: '/only-desktop',
        },
      };
    }
    return {
      props: {},
    };
  } catch (e: any) {
    Sentry.captureException(e);
    throw new Error(e);
  }
};

export default LoginPage;
