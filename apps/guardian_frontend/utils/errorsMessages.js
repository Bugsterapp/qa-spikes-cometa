const phoneError = 'El número de teléfono introducido no es valido.';
const postalCodeError = {
  new: 'El código postal debe coincidir con el registrado para ese RFC.',
  origin:
    'El campo DomicilioFiscalReceptor del receptor, debe pertenecer al nombre asociado al RFC registrado en el campo Rfc del Receptor.',
  isValid: (originalMessage) => {
    const messageUpperCase = originalMessage.toUpperCase();
    return (
      (messageUpperCase.includes('DOMICILIOFISCALRECEPTOR') && messageUpperCase.includes('RFC')) ||
      (messageUpperCase.includes('DOMICILIO') && messageUpperCase.includes('DEBE PERTENECER'))
    );
  },
};
const changeSpecificErrors = (messageError) => {
  /**
   * Change origin message error to new message error
   */
  const options = [postalCodeError];
  const newMessage = options.find((option) => option.origin === messageError || option.isValid(messageError));
  return newMessage?.new || messageError;
};

export { phoneError, changeSpecificErrors };
