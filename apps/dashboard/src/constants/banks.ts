export type BankConfig = {
  label: string;
  logoPath?: string;
};

export type BankMap = Record<string, BankConfig>;

export const BANK_CONFIG: BankMap = {
  BBVA: {
    label: 'BBVA',
    logoPath: undefined,
  },
  BANAMEX: {
    label: 'Banamex',
    logoPath: undefined,
  },
  SANTANDER: {
    label: 'Santander',
    logoPath: undefined,
  },
  BANORTE: {
    label: 'Banorte',
    logoPath: '/assets/images/banks/Banorte.png',
  },
  BANREGIO: {
    label: 'Banregio',
    logoPath: '/assets/images/banks/Banregio.png',
  },
  HSBC: {
    label: 'HSBC',
    logoPath: '/assets/images/banks/HSBC.png',
  },
  SCOTIABANK: {
    label: 'Scotiabank',
    logoPath: undefined,
  },
  INBURSA: {
    label: 'Inbursa',
    logoPath: undefined,
  },
  AZTECA: {
    label: 'Banco Azteca',
    logoPath: undefined,
  },
};
