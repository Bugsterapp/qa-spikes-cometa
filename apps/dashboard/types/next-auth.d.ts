/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';
import { User } from '/src/interfaces/core';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    token: string;
    user: User;
  }
}
