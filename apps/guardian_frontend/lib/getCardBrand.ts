import card from 'card-validator';

export const getCardBrand = (cardNumber: string) => card.number(cardNumber.replace(/[^0-9.]/g, ''));
