const WHAT_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUM}`;

const formatLink = (name: string, message: string): string => WHAT_LINK + `?${name}=${encodeURIComponent(message)}`;

const WHAT_TALK_TO_US: string = formatLink('text', 'Hola tengo una pregunta sobre el dashboard.');
const WHAT_LOGIN: string = formatLink('text', 'Hola! Estoy teniendo problemas para ingresar al dashboard');

export { WHAT_LINK, WHAT_TALK_TO_US, WHAT_LOGIN };
