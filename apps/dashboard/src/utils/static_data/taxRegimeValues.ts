/**
 * Fecha  inicio de vigencia del catálogo 1/1/2022
 */

import { personTypesMoral, personTypesNatural, personTypesBoth } from './personTypesTaxRegimen';

const taxRegimeValues = [
  {
    name: 'General de Ley Personas Morales',
    value: '601',
    personTypes: personTypesMoral,
  },
  {
    name: 'Personas Morales con Fines no Lucrativos',
    value: '603',
    personTypes: personTypesMoral,
  },
  {
    name: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    value: '605',
    personTypes: personTypesNatural,
  },
  {
    name: 'Arrendamiento',
    value: '606',
    personTypes: personTypesNatural,
  },
  {
    name: 'Régimen de Enajenación o Adquisición de Bienes',
    value: '607',
    personTypes: personTypesNatural,
  },
  {
    name: 'Demás ingresos',
    value: '608',
    personTypes: personTypesNatural,
  },
  {
    name: 'Residentes en el Extranjero sin Establecimiento Permanente en México',
    value: '610',
    personTypes: personTypesBoth,
  },
  {
    name: 'Ingresos por Dividendos (socios y accionistas)',
    value: '611',
    personTypes: personTypesNatural,
  },
  {
    name: 'Personas Físicas con Actividades Empresariales y Profesionales',
    value: '612',
    personTypes: personTypesNatural,
  },
  {
    name: 'Ingresos por intereses',
    value: '614',
    personTypes: personTypesNatural,
  },
  {
    name: 'Régimen de los ingresos por obtención de premios',
    value: '615',
    personTypes: personTypesNatural,
  },
  {
    name: 'Sin obligaciones fiscales',
    value: '616',
    personTypes: personTypesNatural,
  },
  {
    name: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
    value: '620',
    personTypes: personTypesMoral,
  },
  {
    name: 'Incorporación Fiscal',
    value: '621',
    personTypes: personTypesNatural,
  },
  {
    name: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    value: '622',
    personTypes: personTypesMoral,
  },
  {
    name: 'Opcional para Grupos de Sociedades',
    value: '623',
    personTypes: personTypesMoral,
  },
  {
    name: 'Coordinados',
    value: '624',
    personTypes: personTypesMoral,
  },
  {
    name: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    value: '625',
    personTypes: personTypesNatural,
  },
  {
    name: 'Régimen Simplificado de Confianza',
    value: '626',
    personTypes: personTypesBoth,
  },
];

export default taxRegimeValues;
