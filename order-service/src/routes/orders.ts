import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();

// Order routes (all require authentication)
router.post('/checkout', OrderController.checkout);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/statistics', OrderController.getOrderStatistics);

// Admin routes - Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3
// Note: These routes need admin role check in controller
router.get('/admin/pending-payment', OrderController.getPendingPaymentOrders);
router.post('/admin/orders/:id/confirm-payment', OrderController.confirmPayment);
router.post('/admin/orders/:id/reject', OrderController.rejectOrder);

router.get('/:id', OrderController.getOrderById);
router.get('/:id/qr', OrderController.getOrderQR);  // QR retrieval endpoint - Requirements: 2.2, 6.1, 6.2, 6.3
router.delete('/:id/cancel', OrderController.cancelOrder);

// Admin routes (would need role-based auth middleware)
router.get('/', OrderController.getAllOrders);
router.put('/:id/status', OrderController.updateOrderStatus);

export default router;
