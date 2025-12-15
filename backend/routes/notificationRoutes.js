const express = require('express');
const router = express.Router();

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, getUserNotifications);
router.post('/', authenticate, createNotification);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

router.delete('/all', authenticate, deleteAllNotifications);
router.delete('/:id', authenticate, deleteNotification);



module.exports = router;

