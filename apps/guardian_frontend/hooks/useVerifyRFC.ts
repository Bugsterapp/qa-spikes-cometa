import { useContext } from 'react';
import VerifyRFCContext from '~/contexts/VerifyRFCContext';

export const useVerifyRFC = () => useContext(VerifyRFCContext);
