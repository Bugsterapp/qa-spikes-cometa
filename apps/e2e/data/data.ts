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
    ADMIN_URL: 'http://localhost:8000/',
  },
  dev: {
    DASHBOARD_URL: 'https://dashboard-dev.getcometa.com/',
    PORTAL_URL: 'https://portal-dev.getcometa.com/',
    ADMIN_URL: 'https://api-cometa.dev.getcometa.com/',
  },
  demo: {
    DASHBOARD_URL: 'https://dashboard.demo.getcometa.com/',
    PORTAL_URL: 'https://portal.demo.getcometa.com/',
    ADMIN_URL: 'https://api-demo.dev.getcometa.com/',
  },
  oldDemo: {
    DASHBOARD_URL: 'https://demo.dashboard.getcometa.com/',
    PORTAL_URL: 'https://demo.portal.getcometa.com/',
    ADMIN_URL: 'https://api-cometa-demo.prd.getcometa.com/',
  },
  qa: {
    DASHBOARD_URL: 'https://dashboard.qa.getcometa.com/',
    PORTAL_URL: 'https://portal.qa.getcometa.com/',
    ADMIN_URL: 'https://api-qa.dev.getcometa.com/',
  },
  onDemand: {
    DASHBOARD_URL: 'https://dashboard-git-feat-pad-2439-test-bancometa.vercel.app/',
    PORTAL_URL: 'https://portal-git-feat-pad-2439-test-bancometa.vercel.app/',
    ADMIN_URL: 'https://api-pad-2439.dev.getcometa.com/',
  },
};

export const user1 = {
  email: 'automata@getcome.com',
  password: 'barriletecosmico',
};

export const user2 = {
  email: 'automationtres@getcometa.com',
  password: 'barriletecosmico',
};

export const localHostUser = {
  email: 'importantamichael@example.net',
  password: '123456',
};

export const conceptos = {
  automation: {
    colegiatura: {
      conceptId: 'fd208ceb-441b-4205-9994-ebc92321fde2',
    },
    ropa: {
      conceptId: '3263f47d-9b90-4fd9-a040-d1178a704134',
    },
  },
  automationdos: {
    colegiatura: {
      conceptId: '5f5d2a85-9d2e-4f8b-966f-5f0b45d771c4',
    },
    opcionalSinAtributos: {
      conceptId: 'a52a4d4d-caff-4afb-9c28-6c5a44696289',
      conceptName: 'Opcional sin atributos',
    },
    opcionalConAtributos: {
      conceptId: 'f39800b4-effb-409c-bc68-b8754882be9f',
      conceptName: 'Concepto con atributos',
    },
  },
  schoolBmt: {
    opcionalConAtributos: {
      conceptId: 'a9b0b4ea-8f01-4c1a-83c4-e47ddbb66323',
      conceptName: 'Concepto neglected 16355',
    },
  },
  schoolKcs: {
    opcionalSinAtributos: {
      conceptId: '4667180a-5e77-4e84-87de-51f48d3059a1',
      conceptName: 'Concepto sin atributos',
    },
  },
};

export const schoolData = {
  automation: {
    level: '73ed9b83-4b28-4e48-882a-1a0d8712a324',
    section: '46a5eeb3-9727-4e39-9b93-f79eee745026',
    group: '',
    grade: '',
    schoolId: 'b7c428e6-0365-4b4b-8bca-db561ebfde62',
  },
  automationdos: {
    level: '0cc2d0a6-a867-43c4-81ba-cfff5f07c7c5',
    section: '280739c5-0dc7-43fc-94e1-4a9414b31d5e',
    group: '',
    grade: '',
    schoolId: '07457a9d-d2b8-4bf9-ab50-4598aa2c3a45',
    bancAccountName: 'ABC CAPITAL (Account auto dos)',
    bankAccountId: 'fd75feca-72f4-4a28-8e85-907eebc7e441',
    fiscalEntity: 'f3937538-5884-4a42-b5e5-0b4608d9cced',
    schoolCycle: '75ea9d16-211b-4893-ba37-3438fdd2c473',
  },
  schoolBmt: {
    level: '5983f59c-1abc-4636-95f3-57e61adf99b6',
    section: '4cede55b-0b61-40df-8f46-6b54e42f3da0',
    group: '',
    grade: '',
    schoolId: '0ff7bba2-ac51-4108-bb76-2dad89f80875',
  },
  SchoolKcs: {
    level: '',
    section: '',
    group: '',
    grade: '',
    schoolId: '4d43d518-6f9b-4664-ac1c-870bc77260d5',
    bancAccountName: 'ABC CAPITAL (Account auto dos)',
  },
  SchoolGvs: {
    level: '',
    section: '',
    group: '',
    grade: '',
    schoolId: '0a206913-5208-47c2-9407-fb6c0ea69ab3',
    bancAccountName: 'BANORTE (Account School GVS 1)',
  },
};

export const excelPayoutsHeaders = [
  '# Orden',
  '# Pago',
  '# Deposito',
  'Estudiante - Matrícula',
  'Estudiante Nombre',
  'Estudiante Apellido',
  'Sección',
  'Nivel',
  'Pagador',
  'Medio de Pago',
  'Fecha de Pago (Pagador)',
  'Hora de pago',
  'Fecha de Vencimiento',
  'Precio de la Orden',
  'Orden',
  'Tipo de Concepto',
  'Monto Cobrado',
  'Descuento Pronto Pago',
  'Becas y Descuentos Especiales',
  'Recargo',
  'Subtotal (pre-IVA)',
  'IVA',
  'Total Cobrado',
  'Monto Facturado',
  'Comisión',
  'Comisión IVA',
  'Total Depositado',
  'Por Pagar',
  'Pago(Tipo)',
  'Estado de Deposito',
  'Fecha de Deposito',
  'Cuenta bancaria de abono',
  'Folio(factura)',
  'Folio Interno',
  'URL factura (PDF)',
  'Facturado a',
  'Tipo de Ingreso',
];

export const xlsResumenCobranzas = [
  'Mes',
  'Adelantado',
  'A tiempo',
  'Atrasado',
  'Recargos Cobrados',
  'Total Cobrado',
  'Total pendiente sin recargos',
  'Recargos por Cobrar',
  'Total pendiente por Cobrar',
  'Total a Recibir',
  'Total a Recibir Sin Recargos',
  'Porcentaje Cobrado',
  'Porcentaje Por Cobrar',
];
