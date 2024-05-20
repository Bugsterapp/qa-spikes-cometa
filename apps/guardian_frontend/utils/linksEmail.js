const EMAIL_LINK = `mailto:${process.env.NEXT_PUBLIC_EMAIL_CONTACT}`;
const formatLink = (name, message) => EMAIL_LINK + `?${name}=${encodeURIComponent(message)}`;

const EMAIL_PROFILE = formatLink(
  'subject',
  'Hola, ¿qué tal?, quisiera modificar algunos de mis datos en la plataforma de pagos.'
);
const EMAIL_ONBOARDING = formatLink('subject', 'Hola, ¿qué tal? Tengo algunas dudas sobre la facturación.');
const EMAIL_INVOICING = EMAIL_ONBOARDING;
const EMAIL_TALK_TO_US = formatLink('subject', 'Hola tengo una pregunta sobre la plataforma de pagos.');
const EMAIL_SUCCESS = formatLink('subject', 'Hola, ¿qué tal? Tengo una duda sobre un pago al colegio.');
const EMAIL_LOGIN = formatLink('subject', 'Hola! Estoy teniendo problemas para ingresar a la plataforma de pagos.');

export { EMAIL_LINK, EMAIL_INVOICING, EMAIL_ONBOARDING, EMAIL_PROFILE, EMAIL_SUCCESS, EMAIL_TALK_TO_US, EMAIL_LOGIN };
