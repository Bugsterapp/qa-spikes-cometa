import { FraudStatusEnum } from '@cometa/trpc';
import * as Sentry from '@sentry/nextjs';
import { Session } from 'next-auth';
import { ParsedUrlQuery } from 'querystring';
import { appendUtmParameters } from '~/lib/destinationWithUTM';

function redirectByGuardianFraudStatus(session: Session | null, guardianHash: string, query: ParsedUrlQuery) {
  try {
    const doesHasHighRiskProfile = session?.user.fraud_status === FraudStatusEnum.HighRisk;
    if (doesHasHighRiskProfile) {
      return {
        redirect: {
          permanent: false,
          destination: appendUtmParameters(`/guardians/${guardianHash}`, query),
        },
      };
    }
    return null;
  } catch (err) {
    Sentry.captureException(err);
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${guardianHash}`, query),
      },
    };
  }
}

export default redirectByGuardianFraudStatus;
