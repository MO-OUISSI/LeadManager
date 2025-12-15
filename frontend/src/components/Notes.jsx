import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Edit, Trash2, Check, X as XIcon } from 'lucide-react';
import { getNotesByLead, createNote, updateNote, deleteNote } from '../api/noteApi';
import { useAuth } from '../contexts/AuthContext';
import { getLeadById } from '../api/leadsApi';
import '../css/Notes.css';
import Loading from './Loading';

const Notes = ({ leadId, onClose }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [leadInfo, setLeadInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notesData, leadData] = await Promise.all([
          getNotesByLead(leadId),
          getLeadById(leadId)
        ]);
        // Reverse to show oldest first, newest last (chat style)
        setNotes([...notesData].reverse());
        setLeadInfo(leadData);
      } catch (err) {
        setError(err.message || 'Impossible de charger les notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leadId]);

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || saving) return;

    setSaving(true);
    try {
      const createdNote = await createNote({
        content: newNote.trim(),
        leadId
      });
      // Add new note at the end (newest at bottom)
      setNotes(prev => [...prev, createdNote]);
      setNewNote('');
      inputRef.current?.focus();
    } catch (err) {
      alert(err.message || 'Impossible d\'ajouter la note.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (note) => {
    setEditingId(note._id);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      const updatedNote = await updateNote(noteId, { content: editContent.trim() });
      setNotes(prev =>
        prev.map(note => (note._id === noteId ? updatedNote : note))
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour la note.');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer la note.');
    } finally {
      setDeletingId(null);
    }
  };

  const isMyNote = (note) => {
    if (!user || !note.userId) return false;
    const noteUserId = typeof note.userId === 'object' ? note.userId._id : note.userId;
    return noteUserId === user._id;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notes-overlay" onClick={(e) => e.target.classList.contains('notes-overlay') && onClose()}>
      <div className="notes-container">
        <div className="notes-header">
          <div className="notes-header-info">
            <h3 className="notes-title">Notes</h3>
            {leadInfo && (
              <p className="notes-subtitle">
                {leadInfo.prenom} {leadInfo.nom}
              </p>
            )}
          </div>
          <button onClick={onClose} className="notes-close-btn" title="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className="notes-messages">
          {loading ? (
            <div className="notes-loading">
              <Loading />
            </div>
          ) : error ? (
            <div className="notes-error">
              <p>{error}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty">
              <p>Aucune note pour le moment</p>
              <p className="notes-empty-subtitle">Soyez le premier à ajouter une note</p>
            </div>
          ) : (
            <>
              {notes.map((note) => {
                const isMine = isMyNote(note);
                const isEditing = editingId === note._id;
                const noteUser = note.userId?.name || 'Utilisateur inconnu';

                return (
                  <div
                    key={note._id}
                    className={`note-message ${isMine ? 'note-message-mine' : ''}`}
                  >
                    <div className="note-message-header">
                      <span className="note-author">{noteUser}</span>
                      <span className="note-date">{formatDate(note.createdAt)}</span>
                    </div>
                    {isEditing ? (
                      <div className="note-edit-container">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="note-edit-input"
                          rows="3"
                          autoFocus
                        />
                        <div className="note-edit-actions">
                          <button
                            onClick={() => handleSaveEdit(note._id)}
                            className="note-edit-btn note-edit-save"
                            disabled={!editContent.trim()}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="note-edit-btn note-edit-cancel"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="note-message-content">
                        <p>{note.content}</p>
                        {isMine && (
                          <div className="note-message-actions">
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="note-action-btn note-action-edit"
                              title="Modifier"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(note._id)}
                              className="note-action-btn note-action-delete"
                              title="Supprimer"
                              disabled={deletingId === note._id}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="notes-input-container">
          <textarea
            ref={inputRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Ajouter une note..."
            className="notes-input"
            rows="2"
            disabled={saving}
          />
          <button
            type="submit"
            className="notes-send-btn"
            disabled={!newNote.trim() || saving}
            title="Envoyer"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notes;

