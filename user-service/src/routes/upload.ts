import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

// Upload single image
// Note: Authentication can be added if needed
router.post('/image', uploadSingleImage, UploadController.uploadImage);

// Delete image
router.delete('/image/:filename', UploadController.deleteImage);

export default router;
