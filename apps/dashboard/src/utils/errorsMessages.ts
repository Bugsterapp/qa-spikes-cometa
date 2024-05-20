import { isArray } from 'lodash';

const dateFormat = {
  new: 'La fecha no es valida.',
  origin: 'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
  isValid: (originalMessage: string) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return messageUpperCase.includes('FORMAT') && messageUpperCase.includes('DATE');
  },
};
const phoneError = {
  new: 'El número de teléfono introducido no es valido.',
  origin: 'the phone number entered is not valid.',
  isValid: (originalMessage: string) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return messageUpperCase.includes('PHONE NUMBER') && messageUpperCase.includes('NOT VALID');
  },
};
const emailDuplicate = {
  new: 'Este correo está siendo utilizado para otro tutor.',
  origin: 'guardian with this email already exists.',
  isValid: (originalMessage: string) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return messageUpperCase.includes('ALREADY EXISTS') && messageUpperCase.includes('EMAIL');
  },
};
const phoneDuplicate = {
  new: 'Este número está siendo utilizado para otro tutor.',
  origin: 'guardian with this phone already exists.',
  isValid: (originalMessage: string) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return messageUpperCase.includes('ALREADY EXISTS') && messageUpperCase.includes('PHONE');
  },
};
const postalCodeError = {
  new: 'El código postal debe coincidir con el registrado para ese RFC.',
  origin:
    'El campo DomicilioFiscalReceptor del receptor, debe pertenecer al nombre asociado al RFC registrado en el campo Rfc del Receptor.',
  isValid: (originalMessage: string) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return (
      (messageUpperCase.includes('DOMICILIOFISCALRECEPTOR') && messageUpperCase.includes('RFC')) ||
      (messageUpperCase.includes('DOMICILIO') && messageUpperCase.includes('DEBE PERTENECER'))
    );
  },
};
const changeSpecificErrors = (messageError: string) => {
  /**
   * Change origin message error to new message error
   */
  if (!messageError) return messageError;
  const options = [postalCodeError, phoneDuplicate, emailDuplicate, phoneError, dateFormat];
  const newMessage = options.find((option) => option.origin === messageError || option.isValid(messageError));
  return newMessage?.new || messageError;
};

const changeMultipleErrors = (messageErrors: string[] | string) => {
  if (isArray(messageErrors)) return messageErrors.map((messageError) => changeSpecificErrors(messageError)).join('\n');
  else return changeSpecificErrors(messageErrors);
};

export { phoneError, changeSpecificErrors, changeMultipleErrors };
