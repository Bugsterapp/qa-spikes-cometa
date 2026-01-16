import { useContext } from 'react';

import { AlertContext } from '../contexts/AlertContext';

export const defaultAlertTime = 5 * 1000;
const useAlert = () => useContext(AlertContext);

export default useAlert;
