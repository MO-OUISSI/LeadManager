const express = require('express');
const router = express.Router();

const noteController = require('../controllers/noteController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, noteController.createNote);

router.get('/lead/:leadId', authenticate, noteController.getNotesByLead);

router.put('/:id', authenticate, noteController.updateNote);

router.delete('/:id', authenticate, noteController.deleteNote);

module.exports = router;

