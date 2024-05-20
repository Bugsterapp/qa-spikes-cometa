// Core validation functionality

const validateField = <Value, Rules extends any[], Values>(value: Value, rules: Rules, values: Values) => {
  for (const rule of rules) {
    const result = rule(value, values);
    if (result !== true) {
      return result;
    }
  }
  return null;
};

const validator = <T extends Record<string, any[]>>(rules: T, values: Record<string, any>) => {
  const errors: Record<string, any> = {};
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
