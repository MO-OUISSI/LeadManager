const express = require('express');
const router = express.Router();

const noteController = require('../controllers/noteController');
const { authenticate } = require('../middlewares/authMiddleware');

// Create a new note for a lead
router.post('/', authenticate, noteController.createNote);

// Get all notes for a specific lead (all authenticated users can view)
router.get('/lead/:leadId', authenticate, noteController.getNotesByLead);

// Update a note (only the creator can update)
router.put('/:id', authenticate, noteController.updateNote);

// Delete a note (only the creator can delete)
router.delete('/:id', authenticate, noteController.deleteNote);

module.exports = router;

