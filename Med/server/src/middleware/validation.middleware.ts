import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => boolean;
}

export const validationMiddleware = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && !value) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type && typeof value !== rule.type) {
        errors[rule.field] = `${rule.field} must be of type ${rule.type}`;
      }

      if (rule.minLength && value.length < rule.minLength) {
        errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors[rule.field] = `${rule.field} must be at most ${rule.maxLength} characters`;
      }

      if (rule.custom && !rule.custom(value)) {
        errors[rule.field] = `${rule.field} is invalid`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
  };
};
