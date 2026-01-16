const InvoicingErrors = {
  // School errors
  L001: {
    description: 'La fecha de emisión no está dentro de la vigencia del CSD del Emisor.',
    action: null,
  },
  L002: {
    description: 'El colegio no tiene configurado su CSD. Carga el CSD.',
    action: null,
  },
  L003: {
    description: 'Su CSD se encuentra vencido o revocado. Carga el CSD actualizado.',
    action: null,
  },
  L004: {
    description:
      'El emisor aún no se encuentra en la Lista de Contribuyentes del SAT o los Sellos Digitales son recientes. El SAT pide hasta 72 horas para activarlos. Favor de intentar mañana.',
    action: null,
  },
  L005: {
    description:
      'El colegio no tiene configurado su código postal. Carga el código postal que coincida con la Constancia de Identificación Fiscal.',
    action: null,
  },
  L006: {
    description: 'No fue posible sellar el documento. El certificado ya está vencido. Carga el CSD actualizado.',
    action: null,
  },
  L007: {
    description:
      'El RFC del colegio no coincide con la Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: null,
  },
  L008: {
    description:
      'El régimen fiscal del colegio no coincide con la Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: null,
  },
  L009: {
    description: 'El certificado ya está vencido. Carga el CSD actualizado.',
    action: null,
  },
  L010: {
    description: 'Error en la configuración de información global del colegio. Contacte a soporte.',
    action: null,
  },
  L011: {
    description: 'Error en la configuración de descripción del concepto. Contacte a soporte.',
    action: null,
  },
  L013: {
    description: 'Error en la configuración de la tasa de impuesto. Contacte a soporte.',
    action: null,
  },
  L014: {
    description: 'Error en la configuración del total de impuestos. Contacte a soporte.',
    action: null,
  },
  L015: {
    description: 'Error en la configuración del código de unidad. Contacte a soporte.',
    action: null,
  },
  L016: {
    description: 'Error en la configuración del logo del colegio. Contacte a soporte.',
    action: null,
  },
  L017: {
    description: 'Error en la configuración del CURP en el complemento educativo. Contacte a soporte.',
    action: null,
  },
  L018: {
    description: 'Error en la configuración del nivel educativo en el complemento educativo. Contacte a soporte.',
    action: null,
  },
  L019: {
    description: 'Error en la configuración del RFC de pago en el complemento educativo. Contacte a soporte.',
    action: null,
  },

  // Guardian errors
  G001: {
    description:
      'El código postal asignado al RFC es distinto al código postal de su Constancia de Identificación Fiscal.',
    action: 'Editar',
  },
  G002: {
    description:
      'El régimen fiscal no coincide con su Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G003: {
    description:
      'El régimen fiscal del tutor no coincide con su Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G004: {
    description: 'El uso de CFDI no es correcto. Debe corresponder con el tipo de persona y régimen fiscal.',
    action: 'Editar',
  },
  G005: {
    description:
      'El domicilio del tutor no coincide con su Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G006: {
    description:
      'El RFC registrado del tutor no coincide con su Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G007: {
    description:
      'El nombre del tutor no coincide con su Constancia de Identificación Fiscal. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G008: {
    description:
      'El nombre del tutor debe encontrarse en la lista de RFC inscritos no cancelados en el SAT. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G009: {
    description:
      'El nombre del tutor debe pertenecer al nombre asociado al RFC registrado. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G010: {
    description:
      'El RFC del tutor no existe en la lista de RFC inscritos no cancelados del SAT. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G011: {
    description: 'El domicilio fiscal del tutor debe pertenecer al RFC registrado. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G012: {
    description:
      'El domicilio fiscal del tutor debe encontrarse en la lista de RFC inscritos no cancelados en el SAT. Corríjalo e intente de nuevo.',
    action: 'Editar',
  },
  G013: {
    description:
      'El uso de CFDI debe corresponder con el tipo de persona (física o moral) y el régimen conforme al catálogo c_UsoCFDI.',
    action: 'Editar',
  },

  // Student errors
  S001: {
    description: 'El CURP del estudiante es incorrecto o no está registrado. Verifique y corríjalo.',
    action: 'Asignar',
  },
  S002: {
    description: 'Error en la configuración del nivel educativo del estudiante. Contacte a soporte.',
    action: 'Asignar',
  },

  // Product errors
  P001: {
    description: 'El campo ClaveProdServ no contiene un valor del catálogo c_ClaveProdServ. Contacte a soporte.',
    action: null,
  },
  P002: {
    description: 'La clave del producto o servicio no existe en el catálogo del SAT. Contacte a soporte.',
    action: null,
  },
  P003: {
    description: 'La ClaveProdServ debe ser de 8 dígitos (ej. 01010101). Contacte a soporte.',
    action: null,
  },
  P004: {
    description: 'La clave del producto o servicio no cumple con el formato correcto. Contacte a soporte.',
    action: null,
  },
  P005: {
    description: 'Falta el código de producto o servicio. Contacte a soporte.',
    action: null,
  },
  P006: {
    description: 'Error en el código de producto o servicio configurado. Contacte a soporte.',
    action: null,
  },
  P007: {
    description: 'Error en el código de producto o servicio configurado. Contacte a soporte.',
    action: null,
  },

  // Cometa errors
  C001: {
    description:
      'Tiempo de procesamiento excedido. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  C002: {
    description:
      'La fecha de generación no puede ser mayor a 72 horas. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  C003: {
    description:
      'No cuentas con folios suficientes para crear facturas. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  C008: {
    description: 'La clave de la unidad no cumple con el formato correcto. Contacte a soporte.',
    action: null,
  },
  C010: {
    description: 'Falta el código de unidad. Contacte a soporte.',
    action: null,
  },
  C011: {
    description: 'Error en el código de unidad configurado. Contacte a soporte.',
    action: null,
  },
  C099: {
    description: 'Operación inválida. Contacte a soporte.',
    action: null,
  },
  C999: {
    description: 'Error genérico de Cometa. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },

  // Facturama errors
  F001: {
    description:
      'Error de conexión con el proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F002: {
    description:
      'Ocurrió un problema al generar el comprobante. El equipo de Facturama ya fue informado. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F003: {
    description:
      'Error del proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F004: {
    description:
      'Ruta de almacenamiento inválida en el proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F005: {
    description:
      'Error de conexión con el proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F006: {
    description:
      'Error de conexión con el proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F007: {
    description:
      'Error genérico del proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F008: {
    description:
      'Error no clasificado del proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F009: {
    description:
      'Error desconocido del proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
  F999: {
    description:
      'Error desconocido del proveedor de facturación. Cometa se encargará de la emisión de la factura en las próximas horas.',
    action: null,
  },
};

export default InvoicingErrors;

export const RetriableCodes = [
  'C001',
  'C002',
  'C003',
  'F001',
  'F002',
  'F003',
  'F004',
  'F005',
  'F006',
  'F007',
  'F008',
  'F009',
  'F999',
];
