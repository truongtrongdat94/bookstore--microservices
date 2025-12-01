import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

// User notification routes (require authentication)
router.get('/', NotificationController.getUserNotifications);
router.get('/statistics', NotificationController.getStatistics);
router.get('/:id', NotificationController.getNotificationById);
router.post('/mark-read', NotificationController.markAsRead);
router.post('/mark-all-read', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

// Admin routes (would need role-based auth middleware)
router.post('/create', NotificationController.createNotification);
router.post('/send-email', NotificationController.sendEmail);
router.get('/admin/all', NotificationController.getAllNotifications);

export default router;
