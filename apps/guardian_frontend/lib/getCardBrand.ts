import card from 'card-validator';

export const getCardBrand = (cardNumber: string) => card.number(cardNumber);
