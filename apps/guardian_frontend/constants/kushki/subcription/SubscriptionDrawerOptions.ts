const SubscriptionDrawerOptions = {
  success: {
    title: 'Tu domiciliación fue creada con éxito.',
    optionMessage:
      'Tus pagos serán cobrados automáticamente. Podrás visualizarlos en tu historial de pagos una vez pagados.',
    code: 'success',
  },
  error: {
    title: 'Hubo un error en el alta de tu domiciliación.',
    optionMessage: 'Hubo un error con tu pago',
    code: 'error',
  },
  last_fulfillment: {
    title: 'La orden del mes vigente fue la última a cobrar.',
    optionMessage: 'No hay más órdenes para realizar la domiciliación.',
    code: 'success',
  },
};

export default SubscriptionDrawerOptions;
