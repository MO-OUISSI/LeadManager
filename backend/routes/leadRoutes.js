const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Create a new lead
router.post('/', authenticate, leadController.ajouterLead);
// Get all leads
router.get('/', authenticate, leadController.getAllLeads);
// Get one lead by ID
router.get('/:id', authenticate, leadController.getLead);
// Update a lead by ID
router.put('/:id', authenticate, leadController.modifierLead);
// Delete a lead by ID 
router.delete('/:id', authenticate, leadController.supprimerLead);

module.exports = router;