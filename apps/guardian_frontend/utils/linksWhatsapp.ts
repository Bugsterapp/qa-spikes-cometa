const WHAT_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUM}`;
const formatLink = (name: string, message: string) => WHAT_LINK + `?${name}=${encodeURIComponent(message)}`;

const WHAT_PROFILE = formatLink(
  'text',
  'Hola, ¿qué tal?, quisiera modificar algunos de mis datos en la plataforma de pagos.'
);
const WHAT_INVOICING = formatLink('text', 'Hola, ¿qué tal? Tengo algunas dudas sobre la facturación.');
const WHAT_TALK_TO_US = formatLink('text', 'Hola tengo una pregunta sobre la plataforma de pagos.');
const WHAT_SUCCESS = formatLink('text', 'Hola, ¿qué tal? Tengo una duda sobre un pago al colegio.');
const WHAT_LOGIN = formatLink('text', 'Hola! Estoy teniendo problemas para ingresar a la plataforma de pagos.');
const WHAT_PAYMENT = WHAT_SUCCESS;
const WHAT_ONBOARDING_HELP = formatLink('text', 'Hola, ¿qué tal? Necesito ayuda en el portal de pagos.');
const WHAT_CHARGEBACK_HELP = formatLink('text', 'Hola, ¿qué tal? Necesito ayuda en el portal de pagos.');
const WHAT_ONBOARDING_HELP_PROFILE = formatLink(
  'text',
  'Hola, quisiera actualizar uno de mis datos de perfil en Cometa.'
);

export {
  WHAT_LINK,
  WHAT_INVOICING,
  WHAT_PROFILE,
  WHAT_SUCCESS,
  WHAT_TALK_TO_US,
  WHAT_LOGIN,
  WHAT_PAYMENT,
  WHAT_ONBOARDING_HELP,
  WHAT_CHARGEBACK_HELP,
  WHAT_ONBOARDING_HELP_PROFILE,
};
