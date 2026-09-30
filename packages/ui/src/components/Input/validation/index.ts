import type { PasswordStrengthRule, ValidationRule, ValidatorFunction } from '../types';

/**
 * Runs `rules` against `value` and resolves with every failing rule's message
 * (in rule order). Length and pattern rules only apply to strings.
 */
export const validateValue = async (
  value: unknown,
  rules: ValidationRule[],
  formValues?: Record<string, unknown>
): Promise<string[]> => {
  const errors: string[] = [];

  for (const rule of rules) {
    let isValid = true;

    switch (rule.type) {
      case 'required':
        isValid = value !== undefined && value !== null && value !== '';
        break;

      case 'minLength':
        if (typeof value === 'string') {
          isValid = value.length >= (Number(rule.value) || 0);
        }
        break;

      case 'maxLength':
        if (typeof value === 'string') {
          isValid = value.length <= (Number(rule.value) || Infinity);
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = rule.value instanceof RegExp ? rule.value : new RegExp(String(rule.value));
          isValid = regex.test(value);
        }
        break;

      case 'passwordStrength':
        isValid = validatePasswordStrength(typeof value === 'string' ? value : '', rule as PasswordStrengthRule);
        break;

      case 'custom':
        if (rule.validator) {
          const result = await rule.validator(value, formValues);
          isValid = result;
        }
        break;

      default:
        break;
    }

    if (!isValid) {
      errors.push(rule.message);
    }
  }

  return errors;
};

export const validatePasswordStrength = (
  password: string,
  rule: PasswordStrengthRule
): boolean => {
  if (!password) return false;

  const { requirements } = rule;

  if (requirements.minLength && password.length < requirements.minLength) {
    return false;
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    return false;
  }

  if (requirements.requireSymbols && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    return false;
  }

  return true;
};

export const calculatePasswordStrength = (
  password: string,
  rules?: PasswordStrengthRule[]
): number => {
  if (!password) return 0;

  let score = 0;
  const maxScore = 5;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 0.5;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) score += 1;

  // Additional checks if rules are provided
  if (rules) {
    for (const rule of rules) {
      if (validatePasswordStrength(password, rule)) {
        score += 0.5;
      }
    }
  }

  return Math.min(score / maxScore, 1);
};

// Pre-built validation rules for common use cases
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    type: 'required',
    message
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Must be at least ${length} characters`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Must be no more than ${length} characters`
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    type: 'pattern',
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    type: 'pattern',
    value: /^https?:\/\/.+/,
    message
  }),

  number: (message = 'Please enter a valid number'): ValidationRule => ({
    type: 'pattern',
    value: /^\d+$/,
    message
  }),

  passwordStrength: (
    requirements: PasswordStrengthRule['requirements'],
    message = 'Password does not meet strength requirements'
  ): PasswordStrengthRule => ({
    type: 'passwordStrength',
    requirements,
    message
  }),

  custom: (
    validator: ValidatorFunction,
    message: string
  ): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
};
