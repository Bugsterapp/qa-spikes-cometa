import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ServiceClient } from '~/utils/api';

function Index({ link }: { link: string }) {
  const _router = useRouter();

  useEffect(() => {
    _router.push(link);
  }, []);

  return (
    <>
      <Head>
        <title>Cometa</title>
      </Head>
      <Box
        sx={{ backgroundColor: 'primary.main' }}
        display="flex"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Grid>
          <Stack direction="column" spacing={1} alignItems="center">
            <CircularProgress color="white" size={80} />
            <Typography variant="h5" color="white.main">
              Redireccionando...
            </Typography>
          </Stack>
        </Grid>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

  try {
    const { shortUrlHash } = context?.query || { shortUrlHash: '' };
    const res = (await ServiceClient.apiV1GuardiansShortUrlsList(
      {
        hash: shortUrlHash as string,
      },
      {
        headers: {
          secret: SECRET,
        },
      }
    )) as any;

    const link = res.data.redirect_url as string;

    return {
      props: {
        link,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
export default Index;
