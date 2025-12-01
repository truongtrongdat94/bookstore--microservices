import { Router } from 'express';
import { AuthorController } from '../controllers/authorController';

const router = Router();

// Public routes
router.get('/', AuthorController.getAllAuthors);
router.get('/top/sales', AuthorController.getTopAuthorsBySales); // Must be before /:id
router.get('/:id', AuthorController.getAuthorById);
router.get('/:id/books', AuthorController.getAuthorBooks);

export default router;
