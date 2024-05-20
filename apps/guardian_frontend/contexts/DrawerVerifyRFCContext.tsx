import { createContext } from 'react';
import { DependantErrorRFC } from './VerifyRFCContext';

interface IDrawerVerifyRFCContext {
  handleAssignRFC: (dependent: DependantErrorRFC) => void;
  allSuccess: (skipValidation?: boolean) => boolean;
  studentsWithoutInvoice: DependantErrorRFC[];
  openHasError: boolean;
}

const initialState = {
  handleAssignRFC: () => void 0,
  allSuccess: () => false,
  studentsWithoutInvoice: [],
  openHasError: false,
};

const DrawerVerifyRFCContext = createContext<IDrawerVerifyRFCContext>({
  ...initialState,
});

export default DrawerVerifyRFCContext;
