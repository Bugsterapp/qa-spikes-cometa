import NextAuth from 'next-auth';
import { authOptions } from '~/server/auth';

// createOptions permite enviale datos a la configurcion de options
const Auth = NextAuth(authOptions);

export default Auth;
