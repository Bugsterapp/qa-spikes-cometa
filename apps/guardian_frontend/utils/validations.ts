// Specific validation rules

import type { FormikValues } from 'formik';
import { personTypeMoral } from './static_data/personTypesTaxRegimen';

export type ValidationReturn = boolean | string;

export const isValidEmail = (val: string): ValidationReturn => {
  if (!val) return true;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val) || 'Por favor ingresa un correo válido';
};

export const isRequired = (val: number | boolean | string): ValidationReturn => !!val || 'Este campo es requerido';

export const noSpecialChars = (val: string): ValidationReturn =>
  /^[a-zA-Z0-9Ññ ]+$/i.test(val) || 'Recuerda no utilizar acentos.';

export const isValidFullNumber = (val: string): ValidationReturn => {
  if (!val) return true;
  return /^\+(?:[0-9]●?){6,14}[0-9]$/i.test(val) || 'Número inválido. Usar el formato: +5215512345678';
};

export const isChecked = (val: boolean): ValidationReturn => val || 'Es necesario seleccionar este campo';

export const isValidRFC = (val: string, values?: FormikValues): ValidationReturn => {
  // RFC validation
  // to understand more: https://es.stackoverflow.com/a/31714

  if (values?.personType) {
    if (values.personType === personTypeMoral) {
      return (
        // the rfc must be 12 characters long
        // CAC7605101P1 is a valid rfc
        // the diff is in the first 3 characters
        /^([A-ZÑ&]{3}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i.test(
          val
        ) || 'Formato incorrecto.'
      );
    } else {
      return (
        // the rfc must be 13 characters long
        // CACX7605101P1 is a valid rfc
        // the diff is in the first 4 characters
        /^([A-ZÑ&]{4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i.test(
          val
        ) || 'Formato incorrecto.'
      );
    }
  } else {
    // the rfc must be 12-13 characters long
    // this is in the case that the person type is not yet selected
    return (
      /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i.test(
        val
      ) || 'Formato incorrecto.'
    );
  }
};

export const isPostalCode = (val: string): ValidationReturn =>
  /^\d{4,5}$/i.test(val) || 'Formato incorrecto, mínimo 4 y máximo 5 números';
