import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/tree', CategoryController.getCategoryTree);
router.get('/:id', CategoryController.getCategoryById);

// Admin routes (would need role-based auth)
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
