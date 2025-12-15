const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Authentication routes
router.get('/check-admin', userController.checkAdminExists);
router.post('/register-admin', userController.registerAdmin); 
router.post('/login', userController.login);

// Profile routes for the authenticated user (admin or agent)
router.get('/profile', authenticate, userController.getMe);
router.put('/profile/update', authenticate, userController.updateMe);

// Admin routes
router.post('/', authenticate, isAdmin, userController.createAgent);
router.get('/', authenticate, isAdmin, userController.listAgents);
router.get('/:id', authenticate, isAdmin, userController.getAgentById);
router.put('/:id', authenticate, isAdmin, userController.updateAgent);
router.delete('/:id', authenticate, isAdmin, userController.deleteAgent);


module.exports = router;