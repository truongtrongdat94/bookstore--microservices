import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../types';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import multer from 'multer';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.Console()]
});

export class UploadController {
  // Upload image (book cover, profile picture, etc.)
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if file exists
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded', 'NO_FILE');
      }

      const file = req.file;
      
      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        // Delete uploaded file if invalid
        fs.unlinkSync(file.path);
        throw new ApiError(400, 'Invalid file type. Only JPEG, PNG, GIF, WEBP allowed', 'INVALID_FILE_TYPE');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        fs.unlinkSync(file.path);
        throw new ApiError(400, 'File size exceeds 5MB limit', 'FILE_TOO_LARGE');
      }

      // Generate URL for the uploaded file
      // In production, this would be a CDN URL or cloud storage URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:4001';
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;

      logger.info('Image uploaded successfully', {
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      });

      const response: ApiResponse = {
        success: true,
        data: {
          url: imageUrl,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype
        }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete image
  static async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;

      const uploadDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'File not found', 'FILE_NOT_FOUND');
      }

      // Delete file
      fs.unlinkSync(filePath);

      logger.info('Image deleted successfully', { filename });

      const response: ApiResponse = {
        success: true,
        data: { message: 'Image deleted successfully' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
