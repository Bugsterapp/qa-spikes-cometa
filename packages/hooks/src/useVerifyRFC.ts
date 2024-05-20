import { useContext } from 'react';
import VerifyRFCContext from '@cometa/contexts/src/VerifyRFCContext';

export const useVerifyRFC = () => useContext(VerifyRFCContext);
