import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button, Container, Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';

function WrongHash({ session, guardianHash }: { session: Session; guardianHash: string }) {
  const _router = useRouter();
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <Head>
        <title>Otra cuenta</title>
      </Head>
      <Container
        maxWidth={false}
        sx={{
          background:
            'linear-gradient(179.6deg, rgba(211, 239, 255, 0.4) 0.34%, rgba(190, 189, 255, 0.4) 99.68%), #FFFFFF;',
        }}
      >
        <Grid
          maxWidth="sm"
          container
          px={2}
          gap={6}
          direction="column"
          height="100vh"
          alignItems="center"
          justifyContent="center"
          sx={{ margin: 'auto' }}
        >
          <Typography variant="h6" fontWeight={700} color="neutralDark.main" textAlign="center">
            Estás tratando de entrar a otra cuenta
          </Typography>
          <Typography color="neutralDark.main" textAlign="center">
            Actualmente, tienes una sesión abierta para{' '}
            <strong>
              {session?.user?.first_name} {session?.user?.last_name}
            </strong>
            .
          </Typography>
          <Grid
            container
            direction="row"
            spacing={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Grid item>
              <Button
                onClick={() => {
                  _router.push({
                    pathname: `/guardians/${session?.user?.hash}/`,
                    query: _router.query,
                  });
                }}
              >
                Continuar con sesión actual
              </Button>
            </Grid>
            <Grid item>
              <Button
                name="onboarding-3-submit"
                onClick={() => {
                  signOut({ callbackUrl: `/guardians/${guardianHash}/login` });
                }}
              >
                Cerrar sesión actual
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context?.query || { guardianHash: '' };
  return {
    props: {
      session,
      guardianHash,
    },
  };
};
WrongHash.auth = true;
export default WrongHash;
