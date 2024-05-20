type EnvironmentConfig = {
  DASHBOARD_URL: string;
  PORTAL_URL: string;
  ADMIN_URL: string;
};

type DataConfig = {
  [key: string]: EnvironmentConfig;
};

export const dataConfig: DataConfig = {
  local: {
    DASHBOARD_URL: 'http://localhost:3001/',
    PORTAL_URL: 'http://localhost:3000/',
    ADMIN_URL: 'https://api-cometa.dev.getcometa.com/',
  },
  dev: {
    DASHBOARD_URL: 'https://dashboard-dev.getcometa.com/',
    PORTAL_URL: 'https://portal-dev.getcometa.com/',
    ADMIN_URL: 'https://api-cometa.dev.getcometa.com/',
  },
  stage: {
    DASHBOARD_URL: 'https://dashboard-stg.getcometa.com/',
    PORTAL_URL: 'https://portal-stg.getcometa.com/',
    ADMIN_URL: 'https://api-cometa.stg.getcometa.com/',
  },
};

export const user1 = {
  email: 'automation@getcometa.com',
  password: 'carotomy',
};

export const user2 = {
  email: 'automationtres@getcometa.com',
  password: 'barriletecosmico',
};
