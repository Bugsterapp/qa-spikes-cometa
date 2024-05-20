/**
 * Core validation functionality
 *  - validateField: validates a single field
 *  - validator: validates all fields
 *  - rules: a set of validation rules
 *  - values: the values to validate
 *  - errors: the errors object to populate
 *
 */
import type { FormikValues } from 'formik';
import { ValidationReturn } from './validations';

export type PackRules = {
  [key: string]: Rule[];
};
type Rule = (val: any, values?: FormikValues) => ValidationReturn;
type Errors = {
  [key: string]: string | false;
};
const validateField = (value: number | boolean | string, rules: Rule[], values: FormikValues) => {
  for (const rule of rules) {
    const result = rule(value, values);
    if (result !== true) {
      return result;
    }
  }
  return null;
};

const validator = (rules: PackRules, values: FormikValues) => {
  const errors: Errors = {};
  for (const name in values) {
    if (name in rules) {
      const result = validateField(values[name], rules[name], values);
      if (result !== null) {
        errors[name] = result;
      }
    }
  }
  return errors;
};

export default validator;
