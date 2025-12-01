import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/Category';
import { ApiResponse, ApiError } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

export class CategoryController {
  // Get all categories
  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryModel.findAll();
      
      const response: ApiResponse = {
        success: true,
        data: categories
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get category tree
  static async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await CategoryModel.getCategoryTree();
      
      const response: ApiResponse = {
        success: true,
        data: tree
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get category by ID
  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new ApiError(400, 'Invalid category ID', 'INVALID_CATEGORY_ID');
      }
      
      const category = await CategoryModel.findById(categoryId);
      
      if (!category) {
        throw new ApiError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }
      
      const response: ApiResponse = {
        success: true,
        data: category
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Create category (admin only)
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, parent_id, description } = req.body;
      
      const category = await CategoryModel.create(name, parent_id, description);
      
      logger.info('Category created', { categoryId: category.category_id, name });
      
      const response: ApiResponse = {
        success: true,
        data: category
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Update category (admin only)
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new ApiError(400, 'Invalid category ID', 'INVALID_CATEGORY_ID');
      }
      
      const category = await CategoryModel.update(categoryId, req.body);
      
      if (!category) {
        throw new ApiError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }
      
      logger.info('Category updated', { categoryId });
      
      const response: ApiResponse = {
        success: true,
        data: category
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete category (admin only)
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new ApiError(400, 'Invalid category ID', 'INVALID_CATEGORY_ID');
      }
      
      const deleted = await CategoryModel.delete(categoryId);
      
      if (!deleted) {
        throw new ApiError(404, 'Category not found or has associated books', 'CATEGORY_DELETE_FAILED');
      }
      
      logger.info('Category deleted', { categoryId });
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Category deleted successfully' }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
