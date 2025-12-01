import { Router } from 'express';
import { CartController } from '../controllers/cartController';

const router = Router();

// Cart routes (all require authentication)
router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.put('/items/:bookId', CartController.updateCartItem);
router.delete('/items/:bookId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

export default router;
