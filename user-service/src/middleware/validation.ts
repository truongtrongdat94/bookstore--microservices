import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

// Validation schemas
export const schemas = {
  // Register validation schema
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(20)
      .required()
      .messages({
        'string.min': 'Username must be at least 4 characters',
        'string.max': 'Username cannot exceed 20 characters',
        'string.alphanum': 'Username can only contain alphanumeric characters'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least 1 number and 1 special character'
      }),
    full_name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters'
      })
  }),
  
  // Login validation schema
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required'
      })
  }),
  
  // Update user schema
  updateUser: Joi.object({
    full_name: Joi.string().min(2).max(100),
    username: Joi.string().alphanum().min(4).max(20)
  }).min(1),
  
  // User ID parameter
  userId: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  // Shipping Address
  createShippingAddress: Joi.object({
    full_name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^0\d{9,10}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10-11 digits starting with 0'
    }),
    address_line: Joi.string().min(10).max(500).required(),
    city: Joi.string().max(100),
    district: Joi.string().max(100),
    ward: Joi.string().max(100),
    postal_code: Joi.string().max(20),
    is_default: Joi.boolean().default(false)
  }),
  
  updateShippingAddress: Joi.object({
    full_name: Joi.string().min(2).max(255),
    phone: Joi.string().pattern(/^0\d{9,10}$/),
    address_line: Joi.string().min(10).max(500),
    city: Joi.string().max(100),
    district: Joi.string().max(100),
    ward: Joi.string().max(100),
    postal_code: Joi.string().max(20),
    is_default: Joi.boolean()
  }).min(1),
  
  // OTP verification
  verifyEmail: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    otp_code: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.length': 'OTP code must be 6 digits',
        'string.pattern.base': 'OTP code must contain only numbers'
      })
  }),
  
  // Resend OTP
  resendOTP: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      })
  }),
  
  // Change Password
  changePassword: Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Old password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.empty': 'New password is required'
      })
  }),
  
  // Create Address
  createAddress: Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 255 characters',
        'string.empty': 'Name is required'
      }),
    phone: Joi.string()
      .pattern(/^0\d{9,10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be 10-11 digits starting with 0',
        'string.empty': 'Phone number is required'
      }),
    company: Joi.string()
      .max(255)
      .allow('')
      .optional(),
    address: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Address must be at least 10 characters',
        'string.max': 'Address cannot exceed 500 characters',
        'string.empty': 'Address is required'
      }),
    country: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.empty': 'Country is required'
      }),
    province: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.empty': 'Province is required'
      }),
    district: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.empty': 'District is required'
      }),
    ward: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.empty': 'Ward is required'
      }),
    zip_code: Joi.string()
      .max(20)
      .allow('')
      .optional(),
    is_default: Joi.boolean()
      .default(false)
  }),
  
  // Update Address
  updateAddress: Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .optional(),
    phone: Joi.string()
      .pattern(/^0\d{9,10}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone number must be 10-11 digits starting with 0'
      }),
    company: Joi.string()
      .max(255)
      .allow('')
      .optional(),
    address: Joi.string()
      .min(10)
      .max(500)
      .optional()
      .messages({
        'string.min': 'Address must be at least 10 characters',
        'string.max': 'Address cannot exceed 500 characters'
      }),
    country: Joi.string()
      .max(100)
      .optional(),
    province: Joi.string()
      .max(100)
      .optional(),
    district: Joi.string()
      .max(100)
      .optional(),
    ward: Joi.string()
      .max(100)
      .optional(),
    zip_code: Joi.string()
      .max(20)
      .allow('')
      .optional(),
    is_default: Joi.boolean()
      .optional()
  }).min(1)
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          }
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

// Validate query parameters
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const validated = await schema.validateAsync(req.query, {
        abortEarly: false,
        stripUnknown: true
      });
      
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query validation failed',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          }
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

// Validate route parameters
export const validateParams = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const validated = await schema.validateAsync(req.params, {
        abortEarly: false,
        stripUnknown: true
      });
      
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parameter validation failed',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          }
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};
