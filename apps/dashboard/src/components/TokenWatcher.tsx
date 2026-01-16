import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AUTH_ERRORS } from '../constants/auth';
import { PATH_AUTH } from '../routes/paths';

function TokenWatcher() {
  const { data: session, status } = useSession();
  const signOutExecuted = useRef(false);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasAuthenticated = useRef(false);

  const executeSignOut = useCallback(() => {
    if (signOutExecuted.current) return;
    signOutExecuted.current = true;
    signOut({ callbackUrl: PATH_AUTH.login, redirect: true }).catch(() => {
      window.location.href = PATH_AUTH.login;
    });
  }, []);

  useEffect(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (status === 'authenticated' && session) {
      wasAuthenticated.current = true;
    }

    if (wasAuthenticated.current && status === 'unauthenticated') {
      executeSignOut();
      return;
    }

    if (status !== 'authenticated' || !session) return;

    if (session.error === AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR) {
      executeSignOut();
      return;
    }

    const isLegacyAuth = session.is_legacy_auth === true;

    if (isLegacyAuth) {
      return;
    }

    const expiryTime = session.refresh_expires_in ?? session.session_expires_in;

    if (!expiryTime) {
      return;
    }

    const msUntilExpiry = Math.max(0, expiryTime - Date.now());

    logoutTimerRef.current = setTimeout(executeSignOut, msUntilExpiry);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [session, status, executeSignOut]);

  return null;
}

export default TokenWatcher;
