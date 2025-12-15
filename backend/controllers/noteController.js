const Note = require('../models/noteModel');
const Lead = require('../models/leadModel');

// Create a new note for a lead
const createNote = async (req, res) => {
  try {
    const { content, leadId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }

    // Verify that the lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const note = new Note({
      content: content.trim(),
      leadId,
      userId: req.user._id,
    });

    const savedNote = await note.save();
    
    // Populate user info for response
    await savedNote.populate('userId', 'name email');

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all notes for a specific lead (all users can view)
const getNotesByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }

    // Verify that the lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const notes = await Note.find({ leadId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 }); // Most recent first

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a note (only the creator can update)
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the user is the creator of the note
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notes' });
    }

    note.content = content.trim();
    const updatedNote = await note.save();
    
    await updatedNote.populate('userId', 'name email');

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a note (only the creator can delete)
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the user is the creator of the note
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own notes' });
    }

    await Note.findByIdAndDelete(id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  getNotesByLead,
  updateNote,
  deleteNote,
};

