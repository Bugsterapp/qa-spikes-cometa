import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../server/auth';
import { ServiceClient } from '/src/utils/api';
import React, { useEffect, useRef } from 'react';
import { api } from '/src/utils/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSetSelectedSchool } from '../../guards/AuthGuard';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

enum SessionStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
}

type ColumnConfig = {
  columns: Array<{
    columnId: string;
    columnName: string;
    isVisible: boolean;
    order: number;
  }>;
};

type FilterConfig = Record<string, unknown>;

type SharedTableLinkProps = {
  columnsConfig: ColumnConfig | null;
  filtersConfig: FilterConfig | null;
  tableName: string;
  schoolId: string;
  relativeUrl: string;
  hash: string;
};

export default function SharedTableLink({
  columnsConfig,
  filtersConfig,
  tableName,
  schoolId,
  relativeUrl,
  hash,
}: SharedTableLinkProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setSelectedSchool = useSetSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const eventSentRef = useRef(false);
  const configUpdatedRef = useRef(false);
  const redirectedRef = useRef(false);
  const schoolSetRef = useRef(false);

  const upsertTableConfig = api.students.upsertTableConfig.useMutation({
    onSuccess: () => {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.push(`/${relativeUrl}`);
      }
    },
    onError: () => {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.push(`/${tableName}`);
      }
    },
  });

  useEffect(() => {
    if (!schoolSetRef.current && schoolId && status !== SessionStatus.LOADING) {
      schoolSetRef.current = true;
      setSelectedSchool(schoolId);
    }
  }, [schoolId, setSelectedSchool, status]);

  useEffect(() => {
    if (!eventSentRef.current && status === SessionStatus.AUTHENTICATED && tableName && hash) {
      eventSentRef.current = true;
      sendTrackEventWithUserName(`dashboard: ${tableName} | ShareTable Opened`, {
        table_name: tableName,
        hash,
        relative_url: relativeUrl,
      });
    }
  }, [status, tableName, hash, relativeUrl, sendTrackEventWithUserName]);

  useEffect(() => {
    if (configUpdatedRef.current || status === SessionStatus.LOADING) {
      return;
    }

    if (status === SessionStatus.AUTHENTICATED && session?.user?.id) {
      configUpdatedRef.current = true;

      if ((columnsConfig?.columns || filtersConfig) && schoolId) {
        upsertTableConfig.mutate({
          userId: session.user.id,
          tableName,
          schoolId,
          columnsConfig: columnsConfig?.columns || [],
          filtersConfig: filtersConfig || {},
        });
      } else if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.push(`/${tableName}`);
      }
    } else if (status === SessionStatus.UNAUTHENTICATED && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push(`/${tableName}`);
    }
  }, [status, session, columnsConfig, filtersConfig, schoolId, tableName, router, upsertTableConfig, relativeUrl]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Cargando vista compartida...</p>
    </div>
  );
}

SharedTableLink.getLayout = function getLayout(page: JSX.Element) {
  return page;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const hash = context.params?.hash as string;
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || !session.token) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }

    const response = await ServiceClient.apiV1DashboardTableLinksHashRetrieve(hash, {
      headers: {
        Authorization: `Token ${session.token}`,
      },
    });

    if (response.ok && response.data) {
      const data = response.data;

      return {
        props: {
          columnsConfig: data.columns || null,
          filtersConfig: data.filters || null,
          tableName: data.table_name,
          schoolId: data.school_id,
          relativeUrl: data.relative_url,
          hash: data.hash,
        },
      };
    }

    return {
      notFound: true,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
