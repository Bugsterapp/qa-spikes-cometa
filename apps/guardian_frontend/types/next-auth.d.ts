import { BillingStudent, RetrieveGuardian } from '@cometa/trpc/src/types';
import { DefaultSession } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';
import { Color } from '~/utils/colors';

declare namespace UserDependant {
  export interface User extends RetrieveGuardian {
    dependents: (BillingStudent & Color)[];
  }
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: UserDependant.User & DefaultSession['user'];
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: Session['user'];
  }
}
