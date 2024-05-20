import { useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { sendTrackEvent, sendIdentifyEvent } from '~/utils/events';
import * as Sentry from '@sentry/nextjs';
import { GetServerSideProps } from 'next';

export default function ExternalAuth({ guardianHash }: { guardianHash: string }) {
  const _router = useRouter();

  const goToHomeOrNext = (hash: string, next: string | null) => {
    _router.push(`/guardians/${hash}/${next || ''}`);
  };

  const loginUser = async (externalHash: string) => {
    const res = await signIn('credentials', {
      redirect: false,
      externalHash,
      external: true,
    });
    sendTrackEvent('portal: External Login', {
      authenticated: !res?.error,
    });
    if (res?.error) {
      Sentry.captureMessage(res.error, 'info');
      _router.push({
        pathname: `/guardians/${guardianHash}/login`,
        query: { error: res.error || 'Usuario no autorizado' },
      });
    } else {
      const loggedUser = await getSession();
      if (loggedUser?.user.hash) {
        goToHomeOrNext(loggedUser.user.hash, null);
      }
    }
  };

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      loginUser(guardianHash);
    },
  });

  useEffect(() => {
    if (session && status === 'authenticated') {
      // identify user in segment
      sendIdentifyEvent(session?.user?.id, session?.user);
      if (session.user.external_id) {
        goToHomeOrNext(session?.user?.external_id, null);
      }
    }
  }, [session, _router]);

  return (
    <Box
      sx={{ backgroundColor: 'primary.main' }}
      display="flex"
      height="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Grid>
        {status !== 'authenticated' ? (
          <Stack direction="column" spacing={1} alignItems="center">
            <CircularProgress color="white" size={80} />
            <Typography variant="h5" color="white.main">
              Autenticando...
            </Typography>
          </Stack>
        ) : (
          <Stack direction="column" spacing={1} alignItems="center">
            <ThumbUpIcon color="white" />
            <Typography variant="h5" color="white.main">
              Autenticado
            </Typography>
          </Stack>
        )}
      </Grid>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context?.query || { guardianHash: '' };
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${session.user.hash}/`,
      },
    };
  }
  return {
    props: {
      guardianHash,
    },
  };
};
